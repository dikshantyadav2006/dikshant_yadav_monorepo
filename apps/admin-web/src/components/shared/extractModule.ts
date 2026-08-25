import type { ComponentConfig } from './parseConfig';

export interface RuntimeModule {
  Component: React.ComponentType<any>;
  config?: ComponentConfig;
}

const FORBIDDEN_PATTERNS = [
  /process\./g,
  /require\(/g,
  /import\(/g,
  /fetch\(/g,
  /XMLHttpRequest/g,
  /localStorage/g,
  /sessionStorage/g,
  /document\.cookie/g,
  /window\.location\s*=/g,
];

function validateCode(code: string): void {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(code)) {
      throw new Error(`Code contains forbidden pattern: ${pattern.source}`);
    }
  }
}

export function extractModule(compiledCode: string): RuntimeModule {
  validateCode(compiledCode);

  const mod = { exports: {} as any };
  const exports = mod.exports;

  const executor = new Function('module', 'exports', compiledCode);

  executor(mod, exports);

  const exported = mod.exports;
  const Component = exported.default || (typeof exported === 'function' ? exported : null);

  if (!Component) {
    throw new Error('Code must export a React component as default export');
  }

  if (typeof Component !== 'function' && typeof Component !== 'object') {
    throw new Error('Default export must be a React component (function or forwardRef)');
  }

  return {
    Component,
    config: exported.config || undefined,
  };
}
