import * as esbuild from 'esbuild-wasm';

let initialized = false;
let initPromise: Promise<void> | null = null;

export async function initCompiler(): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await esbuild.initialize({
        wasmURL: 'https://cdn.jsdelivr.net/npm/esbuild-wasm@0.28.2/esbuild.wasm',
      });
      initialized = true;
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

export async function compileTSX(code: string): Promise<string> {
  await initCompiler();

  const result = await esbuild.transform(code, {
    loader: 'tsx',
    jsx: 'automatic',
    target: 'es2020',
  });

  return result.code;
}
