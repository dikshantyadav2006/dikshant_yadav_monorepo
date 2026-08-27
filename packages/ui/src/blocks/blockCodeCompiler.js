'use client';

/**
 * blockCodeCompiler.js
 * ----------------------------------------------------------------
 * Client-side transpiler + sandbox module loader for user-authored
 * React (TSX) code blocks.
 *
 * Why this file exists on its own:
 *   - It keeps the <CodeBlockInteractive> React component focused on
 *     rendering, and this module focused on "how do we turn an
 *     author's TSX string into a real but isolated React component?"
 *   - The same pieces (esbuild bootstrap, import map, module
 *     resolution) are logically reusable and independently testable.
 *
 * High-level flow:
 *   1. esbuild.transform  TSX source  ->  ESM JavaScript
 *   2. Parse the ESM to discover every import binding
 *   3. Rewrite ESM `export` statements into CJS `exports.*` assignments
 *   4. Execute inside a `new Function(...)` sandbox, injecting the
 *      resolved bindings so `import`s work without a bundler.
 */

import React from 'react';
import {
  motion,
  AnimatePresence,
  useAnimation,
  useInView,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import clsx from 'clsx';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import * as esbuild from 'esbuild-wasm';
import * as UIGateway from './ContentRenderer.jsx';

/* ====================================================================== */
/*  Sandbox import map                                                    */
/* ====================================================================== */

/**
 * Modules an author may import from inside a code block. Each entry maps a
 * bare specifier to the *real* runtime object we inject into the sandbox.
 * Kept inline so the public apps (post-web / work-web) can resolve imports
 * for @dikshant/ui without relying on a separate build step.
 *
 * The `@dikshant/ui` entry uses a lazy getter: ContentRenderer.jsx imports
 * CodeBlockInteractive and this module, forming a module cycle. Reading the
 * block components eagerly at module-init would hit the temporal dead zone,
 * so we defer the lookup until the sandbox actually executes user code (at
 * which point the module graph is fully initialized).
 */
const SANDBOXED_MODULES = {
  react: React,
  'react/jsx-runtime': React,
  'react/jsx-dev-runtime': React,
  '@dikshant/ui': {
    get ContentRenderer() { return UIGateway.default; },
    get HeadingBlock() { return UIGateway.HeadingBlock; },
    get TextBlock() { return UIGateway.TextBlock; },
    get ImageBlock() { return UIGateway.ImageBlock; },
    get VideoBlock() { return UIGateway.VideoBlock; },
    get GalleryBlock() { return UIGateway.GalleryBlock; },
    get QuoteBlock() { return UIGateway.QuoteBlock; },
    get DividerBlock() { return UIGateway.DividerBlock; },
    get CodeBlock() { return UIGateway.CodeBlock; },
    get EmbedBlock() { return UIGateway.EmbedBlock; },
    get QuestionBlock() { return UIGateway.QuestionBlock; },
    get PollBlock() { return UIGateway.PollBlock; },
    get ButtonBlock() { return UIGateway.ButtonBlock; },
    get AIBlock() { return UIGateway.AIBlock; },
  },
  'framer-motion': {
    motion,
    AnimatePresence,
    useAnimation,
    useInView,
    useMotionValue,
    useTransform,
    useSpring,
  },
  'lucide-react': LucideIcons,
  clsx: { default: clsx },
  'class-variance-authority': cva ? { cva } : {},
  'tailwind-merge': { twMerge },
};

/** Specifiers that back the automatic JSX runtime (handled specially). */
const JSX_RUNTIME_MODULES = {
  'react/jsx-runtime': true,
  'react/jsx-dev-runtime': true,
};

/* ====================================================================== */
/*  esbuild bootstrap (lazy singleton)                                    */
/* ====================================================================== */

let esbuildPromise = null;

/**
 * Boot esbuild-wasm once and reuse the same instance for every block.
 * The WASM binary is pulled from a CDN because we run entirely in the
 * browser; the version is pinned so it stays in sync with the package.
 *
 * We memoize a single initialization *promise* rather than a boolean flag:
 * several React blocks can mount at the same time, and each could trigger a
 * concurrent `initialize()` call. Memoizing the promise guarantees all callers
 * co-operate on one initialization and fixes "Cannot call initialize more than
 * once".
 *
 * `esbuild` is imported statically (as the admin app does) so every bundler
 * (webpack, vite) resolves and bundles it consistently. The module itself is
 * only activated lazily, on the first transform request.
 */
async function getEsbuild() {
  if (!esbuildPromise) {
    esbuildPromise = (async () => {
      try {
        await esbuild.initialize({
          wasmURL: 'https://cdn.jsdelivr.net/npm/esbuild-wasm@0.28.2/esbuild.wasm',
        });
      } catch (err) {
        // esbuild-wasm throws "Cannot call initialize more than once" when
        // another copy of this module already booted it (e.g. admin's own
        // esbuild bootstrap, or the block renderer's own copy). That is
        // harmless — the shared instance is already ready.
        if (!/initialize/i.test(String(err && err.message))) {
          esbuildPromise = null;
          throw err;
        }
      }
      return esbuild;
    })();
  }
  return esbuildPromise;
}

/* ====================================================================== */
/*  Compile step: TSX string -> ESM JavaScript                            */
/* ====================================================================== */

/**
 * Transpile a single TSX/TS source string into ESM JavaScript.
 *
 * We intentionally use `esbuild.transform` (not `build`): on
 * esbuild-wasm >= 0.28, calling `build` with an explicit entryPoint plus
 * `stdin` is treated as two inputs and errors with
 * "Must use outdir when there are multiple input files".
 *
 * @param {string} code - Raw author source (TSX/TS).
 * @returns {Promise<string>} Transpiled ESM JavaScript.
 */
export async function compileCode(code) {
  const esbuild = await getEsbuild();
  const result = await esbuild.transform(code, {
    loader: 'tsx',
    jsx: 'automatic',
    target: 'es2020',
  });
  return result.code;
}

/* ====================================================================== */
/*  Module resolution: ESM imports/exports -> sandboxed execution         */
/* ====================================================================== */

/**
 * Walk the transpiled source and capture every `import` binding so we can
 * inject it as a parameter of the sandboxed `new Function(...)` scope.
 *
 * Examples parsed:
 *   import { jsx } from "react/jsx-runtime"   (auto JSX runtime)
 *   import { motion } from "framer-motion"    (named import)
 *   import Hero from "./thing"                (relative import - ignored)
 *
 * @param {string} source - Transpiled ESM output from compileCode().
 * @returns {Array<{ name: string, value: unknown }>} Resolved bindings.
 */
function collectImportBindings(source) {
  const bindings = [];
  const lines = source.split('\n');

  for (const line of lines) {
    // Named import:  import { a, b as c } from "mod";
    const named = line.match(/^\s*import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]\s*;?\s*$/);
    if (named) {
      const moduleName = named[2].trim();

      // Automatic-JSX-runtime imports map jsx/jsxs/Fragment onto React primitives.
      if (JSX_RUNTIME_MODULES[moduleName]) {
        for (const spec of splitSpecs(named[1])) {
          const { imported, local } = splitAlias(spec);
          if (imported === 'jsx' || imported === 'jsxs' || imported === 'jsxDEV') {
            bindings.push({ name: local, value: React.createElement });
          } else if (imported === 'Fragment') {
            bindings.push({ name: local, value: React.Fragment });
          }
        }
        continue;
      }

      // Named import from a known sandbox module.
      const moduleNs = SANDBOXED_MODULES[moduleName];
      if (!moduleNs) continue;
      for (const spec of splitSpecs(named[1])) {
        const { imported, local } = splitAlias(spec);
        const value =
          moduleNs && typeof moduleNs === 'object' && imported in Object(moduleNs)
            ? moduleNs[imported]
            : moduleNs.default;
        bindings.push({ name: local, value: value || moduleNs });
      }
      continue;
    }

    // Default import:  import Foo from "mod";
    const def = line.match(/^\s*import\s+(\w+)\s+from\s*['"]([^'"]+)['"]\s*;?\s*$/);
    if (def) {
      const defNs = SANDBOXED_MODULES[def[2].trim()];
      if (!defNs) continue;
      const defValue = defNs.default !== undefined ? defNs.default : defNs;
      if (typeof defValue === 'function' || (defValue && typeof defValue === 'object')) {
        bindings.push({ name: def[1].trim(), value: defValue });
      }
    }
  }

  return bindings;
}

/** Split `a, b as c` into `['a','b as c']`, dropping empties. */
function splitSpecs(raw) {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Split a single specifier `x` or `x as y` into { imported, local }. */
function splitAlias(spec) {
  const parts = spec.split(/\s+as\s+/);
  const imported = parts[0].trim();
  return { imported, local: (parts[1] || imported).trim() };
}

/**
 * Convert ESM `export` statements into CJS `exports.*` assignments so the
 * browser sandbox (`new Function`) can hold them — it has no module loader.
 */
function rewriteExports(source) {
  let code = source
    .replace(/^import\s+.*$/gm, '')
    .replace(/^export\s*\{[^}]*\};\s*$/gm, '');

  // Default exports:
  //   export default function Foo(){...}   -> exports.__default = function Foo(){...}
  //   export default class Foo{...}        -> exports.__default = class Foo{...}
  //   export default Foo;                  -> exports.__default = Foo;
  //   export default (expr);               -> exports.__default = (expr);
  //   export default Foo(...)              -> exports.__default = Foo(...)
  code = code
    .replace(/^export\s+default\s+function\b/gm, 'exports.__default = function')
    .replace(/^export\s+default\s+class\b/gm, 'exports.__default = class')
    .replace(/^export\s+default\s+([\w$][\w$\d]*)\s*;/gm, 'exports.__default = $1;')
    .replace(/^export\s+default\s*?\(/gm, 'exports.__default = (')
    .replace(/^export\s+default\s+([\w$][\w$\d]*)\s*\(.*$/gm, (m) =>
      m.replace(/^export\s+default\s+/, 'exports.__default = ')
    );

  // Named exports:
  //   export const x = ...      -> exports.x = ...
  //   export function x(){}     -> exports.x = function x(){}
  //   export class x{}          -> exports.x = class x{}
  code = code
    .replace(/^export\s+const\s+(\w+)\s*=/gm, 'exports.$1 =')
    .replace(/^export\s+let\s+(\w+)\s*=/gm, 'exports.$1 =')
    .replace(/^export\s+var\s+(\w+)\s*=/gm, 'exports.$1 =')
    .replace(/^export\s+function\s+(\w+)/gm, 'exports.$1 = function')
    .replace(/^export\s+class\s+(\w+)/gm, 'exports.$1 = class');

  return code;
}

/**
 * Execute transpiled ESM inside an isolated `new Function` scope and return
 * the authored component (as the sandbox understands it).
 *
 * @param {string} compiledCode - Output of compileCode().
 * @returns {{ Component: Function|undefined, config?: object }}
 */
export function loadModule(compiledCode) {
  // 1. Resolve every import binding to a real value we own.
  const bindings = collectImportBindings(compiledCode);

  // 2. Strip imports and rewrite exports to CJS-style assignments.
  const code = rewriteExports(compiledCode);

  // 3. Run in a fresh scope with the resolved bindings injected.
  const names = bindings.map((b) => b.name);
  const values = bindings.map((b) => b.value);
  const moduleObj = { exports: {} };

  const executor = new Function(
    names.concat('module', 'exports', 'React').join(','),
    code
  );
  executor.apply(null, values.concat(moduleObj, moduleObj.exports, React));

  const exported = moduleObj.exports;
  const Component =
    exported.__default ||
    exported.default ||
    (typeof exported === 'function' ? exported : null);

  if (!Component) {
    throw new Error('Code must export a React component as default export');
  }

  return { Component, config: exported.config || undefined };
}
