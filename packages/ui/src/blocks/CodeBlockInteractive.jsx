'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { compileCode, loadModule } from './blockCodeCompiler.js';

function looksLikeHtml(code) {
  if (!code || !code.trim()) return false;
  var trimmed = code.trim();
  if (/^\s*<!doctype/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) return true;
  if (/<head[\s>]/i.test(trimmed) || /<body[\s>]/i.test(trimmed)) return true;
  if (/<div[\s>]/i.test(trimmed) && /<\/div>/i.test(trimmed)) return true;
  if (/<section[\s>]/i.test(trimmed) && /<\/section>/i.test(trimmed)) return true;
  return false;
}

function extractFromFullDoc(code) {
  if (!code || !code.trim()) return { html: '', css: '', js: '' };
  var trimmed = code.trim();
  var isFullDoc = /^\s*<!doctype/i.test(trimmed) || /<html[\s>]/i.test(trimmed);
  if (!isFullDoc) return { html: code, css: '', js: '' };

  var html = '';
  var css = '';
  var js = '';

  var bodyMatch = trimmed.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    html = bodyMatch[1]
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .trim();
  }

  var styleMatches = trimmed.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  if (styleMatches) {
    css = styleMatches
      .map(function (m) { return m.replace(/<\/?style[^>]*>/gi, ''); })
      .join('\n')
      .trim();
  }

  var scriptMatches = trimmed.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
  if (scriptMatches) {
    js = scriptMatches
      .map(function (m) { return m.replace(/<\/?script[^>]*>/gi, ''); })
      .filter(function (s) {
        var t = s.trim();
        return t && t.indexOf('tailwind.config') === -1 && t.indexOf('cdn.tailwindcss.com') === -1;
      })
      .join('\n')
      .trim();
  }

  return { html: html, css: css, js: js };
}

function CodeBlockInteractive(_ref) {
  var data = _ref.data;
  var runtime = (data && data.runtime) || 'react';
  var code = (data && data.code) || '';
  var html = (data && data.html) || '';
  var css = (data && data.css) || '';
  var js = (data && data.js) || '';
  var props = (data && data.props) || {};
  var widthMode = (data && data.widthMode) || 'contained';

  var isHtmlRuntime = runtime === 'html';
  var isReactWithHtml = !isHtmlRuntime && runtime === 'react' && looksLikeHtml(code);

  if (isHtmlRuntime || isReactWithHtml) {
    var effectiveHtml = html;
    var effectiveCss = css;
    var effectiveJs = js;

    if (!html && !css && !js && code) {
      var extracted = extractFromFullDoc(code);
      effectiveHtml = extracted.html;
      effectiveCss = extracted.css;
      effectiveJs = extracted.js;
    }

    if (!effectiveHtml && !effectiveCss && !effectiveJs) {
      return null;
    }

    return React.createElement(HtmlCodeBlock, {
      html: effectiveHtml,
      css: effectiveCss,
      js: effectiveJs,
      widthMode: widthMode,
    });
  }

  if (!code.trim()) {
    return null;
  }

  return React.createElement(ReactCodeBlock, { code: code, props: props, widthMode: widthMode });
}

function ReactCodeBlock(_ref2) {
  var code = _ref2.code;
  var props = _ref2.props;
  var widthMode = _ref2.widthMode || 'contained';

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
        var compiled = await compileCode(code);
        if (cancelled) return;
        var mod = loadModule(compiled);
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

  return React.createElement(
    'div',
    { className: 'relative w-full min-w-0 max-w-full overflow-x-clip bg-transparent' },
    React.createElement(Component, props)
  );
}

function buildSrcdoc(html, css, js, blockId, widthMode) {
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

  var responsiveFix = '';
  if (widthMode === 'contained') {
    responsiveFix = ' .max-w-7xl,.max-w-6xl,.max-w-5xl{max-width:100% !important;}';
  }
  var baseResponsive = ' *{min-width:0;} img,video,canvas,svg,iframe{max-width:100%;}';

  var heightScript = '<script>\n' +
    '  (function() {\n' +
    '    var blockId = "' + blockId + '";\n' +
    '    var lastH = 0;\n' +
    '    var raf = 0;\n' +
    '    function getHeight() {\n' +
    '      var root = document.getElementById("root");\n' +
    '      if (!root) root = document.body;\n' +
    '      var h = Math.max(\n' +
    '        root ? root.scrollHeight : 0,\n' +
    '        root ? root.offsetHeight : 0,\n' +
    '        document.body ? document.body.scrollHeight : 0,\n' +
    '        document.body ? document.body.offsetHeight : 0,\n' +
    '        document.documentElement ? document.documentElement.scrollHeight : 0,\n' +
    '        document.documentElement ? document.documentElement.offsetHeight : 0\n' +
    '      );\n' +
    '      return h;\n' +
    '    }\n' +
    '    function sendHeight() {\n' +
    '      cancelAnimationFrame(raf);\n' +
    '      raf = requestAnimationFrame(function(){\n' +
    '        var h = getHeight();\n' +
    '        if (h > 0 && Math.abs(h - lastH) > 2) { lastH = h; parent.postMessage({ type: "code-block-resize", id: blockId, height: h }, "*"); }\n' +
    '        if (document.body) document.body.classList.add("ready");\n' +
    '      });\n' +
    '    }\n' +
    '    window.addEventListener("load", sendHeight);\n' +
    '    window.addEventListener("resize", sendHeight);\n' +
    '    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sendHeight);\n' +
    '    var roHtml = new ResizeObserver(sendHeight);\n' +
    '    var roBody = new ResizeObserver(sendHeight);\n' +
    '    if (document.documentElement) roHtml.observe(document.documentElement);\n' +
    '    if (document.body) roBody.observe(document.body);\n' +
    '    var rootEl = document.getElementById("root");\n' +
    '    if (rootEl) {\n' +
    '      var roRoot = new ResizeObserver(sendHeight);\n' +
    '      roRoot.observe(rootEl);\n' +
    '    }\n' +
    '    var mo = new MutationObserver(sendHeight);\n' +
    '    mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class","style"] });\n' +
    '    var tries = 0;\n' +
    '    var iv = setInterval(function(){ sendHeight(); tries++; if(tries>20) clearInterval(iv); }, 300);\n' +
    '    setTimeout(sendHeight, 0);\n' +
    '    setTimeout(sendHeight, 100);\n' +
    '    setTimeout(sendHeight, 500);\n' +
    '    setTimeout(sendHeight, 1000);\n' +
    '    setTimeout(sendHeight, 2000);\n' +
    '  })();\n' +
    '<\/script>';

  var jsBlock = js && js.trim()
    ? '<script>\n' + js + '\n<\/script>'
    : '';

  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <script src="https://cdn.tailwindcss.com"><\/script>\n  <script>\n    tailwind.config = {\n      theme: {\n        extend: {\n          colors: {\n            background: \'hsl(' + computed.getPropertyValue('--background').trim() + ')\',\n            foreground: \'hsl(' + computed.getPropertyValue('--foreground').trim() + ')\',\n            primary: { DEFAULT: \'hsl(' + computed.getPropertyValue('--primary').trim() + ')\', foreground: \'hsl(' + computed.getPropertyValue('--primary-foreground').trim() + ')\' },\n            secondary: { DEFAULT: \'hsl(' + computed.getPropertyValue('--secondary').trim() + ')\', foreground: \'hsl(' + computed.getPropertyValue('--secondary-foreground').trim() + ')\' },\n            muted: { DEFAULT: \'hsl(' + computed.getPropertyValue('--muted').trim() + ')\', foreground: \'hsl(' + computed.getPropertyValue('--muted-foreground').trim() + ')\' },\n            accent: { DEFAULT: \'hsl(' + computed.getPropertyValue('--accent').trim() + ')\', foreground: \'hsl(' + computed.getPropertyValue('--accent-foreground').trim() + ')\' },\n            destructive: { DEFAULT: \'hsl(' + computed.getPropertyValue('--destructive').trim() + ')\', foreground: \'hsl(' + computed.getPropertyValue('--destructive-foreground').trim() + ')\' },\n            card: { DEFAULT: \'hsl(' + computed.getPropertyValue('--card').trim() + ')\', foreground: \'hsl(' + computed.getPropertyValue('--card-foreground').trim() + ')\' },\n            border: \'hsl(' + computed.getPropertyValue('--border').trim() + ')\',\n            input: \'hsl(' + computed.getPropertyValue('--input').trim() + ')\',\n            ring: \'hsl(' + computed.getPropertyValue('--ring').trim() + ')\',\n          },\n          borderRadius: {\n            lg: \'var(--radius)\',\n            md: \'calc(var(--radius) - 2px)\',\n            sm: \'calc(var(--radius) - 4px)\',\n          },\n        },\n      },\n    };\n  <\/script>\n  <style>\n    :root {\n      ' + rootStyles + '\n    }\n    body {\n      margin: 0;\n      padding: 0;\n      font-family: system-ui, -apple-system, sans-serif;\n      background: hsl(' + computed.getPropertyValue('--background').trim() + ');\n      color: hsl(' + computed.getPropertyValue('--foreground').trim() + ');\n    }\n    #root {\n      width: 100%;\n    }\n    ' + baseResponsive + '\n    ' + responsiveFix + '\n    ' + (css || '') + '\n  </style>\n</head>\n<body>\n  <div id="root">\n    ' + (html || '') + '\n  </div>\n  ' + jsBlock + '\n  ' + heightScript + '\n</body>\n</html>';
}

function HtmlCodeBlock(_ref3) {
  var html = _ref3.html || '';
  var css = _ref3.css || '';
  var js = _ref3.js || '';
  var widthMode = _ref3.widthMode || 'contained';
  var iframeRef = useRef(null);
  var blockIdRef = useRef(null);
  if (blockIdRef.current === null) {
    blockIdRef.current = 'cb-' + Math.random().toString(36).slice(2, 9);
  }
  var blockId = blockIdRef.current;

  var buildSrcdocCb = useCallback(function () {
    return buildSrcdoc(html, css, js, blockId, widthMode);
  }, [html, css, js, blockId, widthMode]);

  useEffect(function () {
    if (!iframeRef.current) return;
    iframeRef.current.srcdoc = buildSrcdocCb();
  }, [buildSrcdocCb]);

  useEffect(function () {
    function handleMessage(event) {
      if (!event.data || event.data.type !== 'code-block-resize') return;
      if (event.data.id && event.data.id !== blockId) return;
      if (event.data.id == null && iframeRef.current && event.source !== iframeRef.current.contentWindow) return;
      var h = event.data.height;
      if (typeof h === 'number' && h > 0 && iframeRef.current) {
        iframeRef.current.style.height = h + 'px';
      }
    }
    window.addEventListener('message', handleMessage);
    return function () { window.removeEventListener('message', handleMessage); };
  }, [blockId]);

  return React.createElement(
    'div',
    { className: 'relative w-full min-w-0 max-w-full overflow-x-clip bg-transparent' },
    React.createElement('iframe', {
      ref: iframeRef,
      style: { width: '100%', minWidth: '0', display: 'block', height: '400px', border: 'none', overflow: 'hidden', transition: 'height 0.12s ease' },
      sandbox: 'allow-scripts allow-modals',
      title: 'HTML Preview',
      loading: 'lazy',
    })
  );
}

export { CodeBlockInteractive };
export default CodeBlockInteractive;
