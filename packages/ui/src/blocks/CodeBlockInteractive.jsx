'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

var esbuildinitialized = false;
var esbuildModule = null;

async function initEsbuild() {
  if (esbuildinitialized) return esbuildModule;
  esbuildModule = await import('esbuild-wasm');
  await esbuildModule.initialize({
    wasmURL: 'https://cdn.jsdelivr.net/npm/esbuild-wasm@0.28.2/esbuild.wasm',
  });
  esbuildinitialized = true;
  return esbuildModule;
}

async function compileTSX(code) {
  var esbuild = await initEsbuild();
  var result = await esbuild.transform(code, {
    loader: 'tsx',
    jsx: 'automatic',
    target: 'es2020',
    format: 'esm',
    minify: false,
  });
  return result.code;
}

function extractModule(compiledCode) {
  var forbidden = ['process.env', 'require('];
  for (var i = 0; i < forbidden.length; i++) {
    if (compiledCode.includes(forbidden[i])) {
      throw new Error('Forbidden pattern detected: ' + forbidden[i]);
    }
  }

  try {
    var moduleObj = { exports: {} };
    var exportsObj = {};
    var fn = new Function('module', 'exports', compiledCode);
    fn(moduleObj, exportsObj);

    var target = moduleObj.exports && moduleObj.exports.default
      ? moduleObj.exports
      : exportsObj.default
        ? exportsObj
        : moduleObj.exports;

    var Component = (target && target.default) || (target && target.Component) || null;
    return { Component: Component };
  } catch (e) {
    return { Component: null };
  }
}

function CodeBlockInteractive(_ref) {
  var data = _ref.data;
  var runtime = (data && data.runtime) || 'react';
  var code = (data && data.code) || '';
  var props = (data && data.props) || {};

  if (runtime === 'html') {
    return React.createElement(HtmlCodeBlock, { code: code });
  }

  if (!code.trim()) {
    return null;
  }

  return React.createElement(ReactCodeBlock, { code: code, props: props });
}

function ReactCodeBlock(_ref2) {
  var code = _ref2.code;
  var props = _ref2.props;

  var _useState = useState(null);
  var Component = _useState[0];
  var setComponent = _useState[1];

  var _useState2 = useState(null);
  var error = _useState2[0];
  var setError = _useState2[1];

  var _useState3 = useState(true);
  var loading = _useState3[0];
  var setLoading = _useState3[1];

  useEffect(function () {
    var cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);
        var compiled = await compileTSX(code);
        if (cancelled) return;
        var mod = extractModule(compiled);
        if (cancelled) return;
        if (mod.Component) {
          setComponent(function () { return mod.Component; });
        } else {
          setError('No default export found. Export a React component as default.');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to compile');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return function () { cancelled = true; };
  }, [code]);

  if (loading) {
    return React.createElement(
      'div',
      { className: 'flex items-center justify-center py-20' },
      React.createElement('div', { className: 'h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-40' })
    );
  }

  if (error) {
    return React.createElement(
      'div',
      { className: 'p-4 text-destructive text-xs font-mono whitespace-pre-wrap' },
      error
    );
  }

  if (!Component) return null;

  return React.createElement(Component, props);
}

function HtmlCodeBlock(_ref3) {
  var code = _ref3.code;
  var iframeRef = useRef(null);

  var buildSrcdoc = useCallback(function () {
    var root = document.documentElement;
    var computed = getComputedStyle(root);

    var vars = [
      '--background', '--foreground', '--card', '--card-foreground',
      '--primary', '--primary-foreground', '--secondary', '--secondary-foreground',
      '--muted', '--muted-foreground', '--accent', '--accent-foreground',
      '--destructive', '--destructive-foreground',
      '--border', '--input', '--ring', '--radius',
    ];

    var rootStyles = vars.map(function (v) {
      return v + ': ' + computed.getPropertyValue(v) + ';';
    }).join('\n      ');

    var heightScript = '<script>\n' +
      '  function sendHeight() {\n' +
      '    var h = document.body.scrollHeight;\n' +
      '    window.parent.postMessage({ type: "code-block-resize", height: h }, "*");\n' +
      '  }\n' +
      '  window.addEventListener("load", sendHeight);\n' +
      '  new ResizeObserver(sendHeight).observe(document.body);\n' +
      '  setInterval(sendHeight, 500);\n' +
      '<\/script>';

    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <script src="https://cdn.tailwindcss.com"><\/script>\n  <script>\n    tailwind.config = {\n      theme: {\n        extend: {\n          colors: {\n            background: \'hsl(' + computed.getPropertyValue('--background').trim() + ')\',\n            foreground: \'hsl(' + computed.getPropertyValue('--foreground').trim() + ')\',\n            primary: { DEFAULT: \'hsl(' + computed.getPropertyValue('--primary').trim() + ')\', foreground: \'hsl(' + computed.getPropertyValue('--primary-foreground').trim() + ')\' },\n            secondary: { DEFAULT: \'hsl(' + computed.getPropertyValue('--secondary').trim() + ')\', foreground: \'hsl(' + computed.getPropertyValue('--secondary-foreground').trim() + ')\' },\n            muted: { DEFAULT: \'hsl(' + computed.getPropertyValue('--muted').trim() + ')\', foreground: \'hsl(' + computed.getPropertyValue('--muted-foreground').trim() + ')\' },\n            accent: { DEFAULT: \'hsl(' + computed.getPropertyValue('--accent').trim() + ')\', foreground: \'hsl(' + computed.getPropertyValue('--accent-foreground').trim() + ')\' },\n            destructive: { DEFAULT: \'hsl(' + computed.getPropertyValue('--destructive').trim() + ')\', foreground: \'hsl(' + computed.getPropertyValue('--destructive-foreground').trim() + ')\' },\n            card: { DEFAULT: \'hsl(' + computed.getPropertyValue('--card').trim() + ')\', foreground: \'hsl(' + computed.getPropertyValue('--card-foreground').trim() + ')\' },\n            border: \'hsl(' + computed.getPropertyValue('--border').trim() + ')\',\n            input: \'hsl(' + computed.getPropertyValue('--input').trim() + ')\',\n            ring: \'hsl(' + computed.getPropertyValue('--ring').trim() + ')\',\n          },\n          borderRadius: {\n            lg: \'var(--radius)\',\n            md: \'calc(var(--radius) - 2px)\',\n            sm: \'calc(var(--radius) - 4px)\',\n          },\n        },\n      },\n    };\n  <\/script>\n  <style>\n    :root { ' + rootStyles + ' }\n    *, *::before, *::after { box-sizing: border-box; }\n    body {\n      margin: 0;\n      padding: 0;\n      font-family: system-ui, -apple-system, sans-serif;\n      background: hsl(' + computed.getPropertyValue('--background').trim() + ');\n      color: hsl(' + computed.getPropertyValue('--foreground').trim() + ');\n    }\n  </style>\n</head>\n<body>\n  ' + code + '\n  ' + heightScript + '\n</body>\n</html>';
  }, [code]);

  useEffect(function () {
    if (!iframeRef.current) return;
    iframeRef.current.srcdoc = buildSrcdoc();
  }, [buildSrcdoc]);

  useEffect(function () {
    function handleMessage(event) {
      if (event.data && event.data.type === 'code-block-resize' && iframeRef.current) {
        var h = event.data.height;
        if (typeof h === 'number' && h > 0) {
          iframeRef.current.style.height = h + 'px';
        }
      }
    }
    window.addEventListener('message', handleMessage);
    return function () { window.removeEventListener('message', handleMessage); };
  }, []);

  return React.createElement('iframe', {
    ref: iframeRef,
    style: { width: '100%', height: '0px', border: 'none', overflow: 'hidden' },
    sandbox: 'allow-scripts',
    title: 'HTML Preview',
  });
}

export { CodeBlockInteractive };
export default CodeBlockInteractive;
