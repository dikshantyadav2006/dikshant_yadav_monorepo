import React from 'react';
import { importMap } from './importMap';
import type { ComponentConfig } from './parseConfig';

export interface RuntimeModule {
  Component: React.ComponentType<any>;
  config?: ComponentConfig;
}

export const FORBIDDEN_PATTERNS = [
  /process\./g,
  /require\(/g,
  /fetch\(/g,
  /XMLHttpRequest/g,
  /localStorage/g,
  /sessionStorage/g,
  /document\.cookie/g,
  /window\.location\s*=/g,
];

export function validateSource(code: string): void {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(code)) {
      throw new Error(`Code contains forbidden pattern: ${pattern.source}`);
    }
  }
}

interface Binding {
  name: string;
  value: any;
}

function collectImportBindings(source: string): Binding[] {
  const bindings: Binding[] = [];
  const jsxRuntimeMods = new Set(['react/jsx-runtime', 'react/jsx-dev-runtime']);

  for (const line of source.split('\n')) {
    const named = line.match(/^\s*import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]\s*;?\s*$/);
    if (named) {
      const [, specList, moduleName] = named;
      const trimmedModule = moduleName.trim();
      const moduleNs = importMap[trimmedModule];
      if (!moduleNs) continue;
      for (const spec of specList.split(',')) {
        const trimmed = spec.trim();
        if (!trimmed) continue;
        const parts = trimmed.split(/\s+as\s+/);
        const imported = parts[0].trim();
        const local = (parts[1] || imported).trim();

        if (jsxRuntimeMods.has(trimmedModule)) {
          if (imported === 'jsx' || imported === 'jsxs' || imported === 'jsxDEV') {
            bindings.push({ name: local, value: React.createElement });
          } else if (imported === 'Fragment') {
            bindings.push({ name: local, value: React.Fragment });
          }
          continue;
        }

        let value = moduleNs;
        if (moduleNs && typeof moduleNs === 'object' && imported in Object(moduleNs)) {
          value = moduleNs[imported] ?? moduleNs;
        } else if (moduleNs && (moduleNs as any).default) {
          value = (moduleNs as any).default;
        }
        bindings.push({ name: local, value });
      }
      continue;
    }

    const def = line.match(/^\s*import\s+(\w+)\s+from\s*['"]([^'"]+)['"]\s*;?\s*$/);
    if (def) {
      const [, local, moduleName] = def;
      const moduleNs = importMap[moduleName.trim()];
      if (!moduleNs) continue;
      const value =
        moduleNs && (moduleNs as any).default !== undefined
          ? (moduleNs as any).default
          : moduleNs;
      if (typeof value === 'function' || (value && typeof value === 'object')) {
        bindings.push({ name: local, value });
      }
    }
  }

  return bindings;
}

export function extractModule(compiledCode: string): RuntimeModule {
  // collect bindings from the compiled (transformed) code — imports are preserved by transform()
  const importBindings = collectImportBindings(compiledCode);

  // Remove import lines
  let code = compiledCode.replace(/^import\s+.*$/gm, '');

  // Rewire default exports.
  //   export default function Foo(...) {...}  ->  exports.__default = function Foo(...) {...}
  //   export default class Foo {...}           ->  exports.__default = class Foo {...}
  //   export default Foo;                      ->  exports.__default = Foo;
  //   export default (expr);                   ->  exports.__default = (expr);
  code = code
    .replace(/^export\s+default\s+function\b/gm, 'exports.__default = function')
    .replace(/^export\s+default\s+class\b/gm, 'exports.__default = class')
    .replace(/^export\s+default\s+([\w$][\w$\d]*)\s*;/gm, 'exports.__default = $1;')
    .replace(/^export\s+default\s*?\(/gm, 'exports.__default = (')
    .replace(/^export\s+default\s+([\w$][\w$\d]*)\s*\(.*$/gm, (m) => {
      // inline arrow/function-call default like `export default Component()` -> `exports.__default = Component()`
      return m.replace(/^export\s+default\s+/, 'exports.__default = ');
    });

  // Rewire named exports: export const x = ... / export function x() {} / export class x {}
  code = code
    .replace(/^export\s+const\s+(\w+)\s*=/gm, 'exports.$1 =')
    .replace(/^export\s+let\s+(\w+)\s*=/gm, 'exports.$1 =')
    .replace(/^export\s+var\s+(\w+)\s*=/gm, 'exports.$1 =')
    .replace(/^export\s+function\s+(\w+)/gm, 'exports.$1 = function')
    .replace(/^export\s+class\s+(\w+)/gm, 'exports.$1 = class');

  // Remove any remaining export statements (e.g. `export {}`)
  code = code.replace(/^export\s+\{[^}]*\};?\s*$/gm, '');

  const names = importBindings.map((b) => b.name);
  const values = importBindings.map((b) => b.value);

  const mod = { exports: {} as any };
  const exportsObj = mod.exports;

  // eslint-disable-next-line no-new-func
  const executor = new Function(...names, 'module', 'exports', 'React', code);
  executor(...values, mod, exportsObj, React);

  let Component = exportsObj.__default || exportsObj.default || (typeof exportsObj === 'function' ? exportsObj : null);

  if (!Component) {
    throw new Error('Code must export a React component as default export');
  }

  if (typeof Component !== 'function' && typeof Component !== 'object') {
    throw new Error('Default export must be a React component (function or forwardRef)');
  }

  const config = exportsObj.config || exportsObj.__config || (Component as any).config;
  if (config && typeof Component === 'object') {
    (Component as any).config = config;
  }

  return {
    Component,
    config: config || undefined,
  };
}
