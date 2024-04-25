"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _tslib = require("tslib");
var _path = require("path");
function transformImportLess2Css() {
  return {
    name: 'transform-import-less-to-css',
    visitor: {
      ImportDeclaration: function ImportDeclaration(path, source) {
        var re = /\.less$/;
        if (re.test(path.node.source.value)) {
          path.node.source.value = path.node.source.value.replace(re, '.css');
        }
      }
    }
  };
}
function _default(opts) {
  var target = opts.target,
    typescript = opts.typescript,
    type = opts.type,
    runtimeHelpers = opts.runtimeHelpers,
    filePath = opts.filePath,
    browserFiles = opts.browserFiles,
    nodeFiles = opts.nodeFiles,
    nodeVersion = opts.nodeVersion,
    lazy = opts.lazy,
    lessInBabelMode = opts.lessInBabelMode;
  var isBrowser = target === 'browser';
  // rollup 场景下不会传入 filePath
  if (filePath) {
    if ((0, _path.extname)(filePath) === '.tsx' || (0, _path.extname)(filePath) === '.jsx') {
      isBrowser = true;
    } else {
      if (isBrowser) {
        if (nodeFiles.includes(filePath)) isBrowser = false;
      } else {
        if (browserFiles.includes(filePath)) isBrowser = true;
      }
    }
  }
  var targets = isBrowser ? {
    browsers: ['last 2 versions', 'IE 10']
  } : {
    node: nodeVersion || 6
  };
  return {
    opts: {
      presets: (0, _tslib.__spreadArray)((0, _tslib.__spreadArray)((0, _tslib.__spreadArray)([], typescript ? [require.resolve('@babel/preset-typescript')] : [], true), [[require.resolve('@babel/preset-env'), {
        targets: targets,
        modules: type === 'esm' ? false : 'auto'
      }]], false), isBrowser ? [require.resolve('@babel/preset-react')] : [], true),
      plugins: (0, _tslib.__spreadArray)((0, _tslib.__spreadArray)((0, _tslib.__spreadArray)((0, _tslib.__spreadArray)((0, _tslib.__spreadArray)((0, _tslib.__spreadArray)([], type === 'cjs' && lazy && !isBrowser ? [[require.resolve('@babel/plugin-transform-modules-commonjs'), {
        lazy: true
      }]] : [], true), lessInBabelMode ? [transformImportLess2Css] : [], true), isBrowser ? [require.resolve('babel-plugin-react-require')] : [], true), [require.resolve('@babel/plugin-syntax-dynamic-import'), require.resolve('@babel/plugin-proposal-export-default-from'), require.resolve('@babel/plugin-proposal-export-namespace-from'), require.resolve('@babel/plugin-proposal-do-expressions'), require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'), require.resolve('@babel/plugin-proposal-optional-chaining'), [require.resolve('@babel/plugin-proposal-decorators'), {
        legacy: true
      }], [require.resolve('@babel/plugin-proposal-class-properties'), {
        loose: true
      }]], false), runtimeHelpers ? [[require.resolve('@babel/plugin-transform-runtime'), {
        useESModules: isBrowser && type === 'esm',
        // use @babel/runtime version from project dependencies
        version: require("".concat(opts.cwd, "/package.json")).dependencies['@babel/runtime']
      }]] : [], true), process.env.COVERAGE ? [require.resolve('babel-plugin-istanbul')] : [], true)
    },
    isBrowser: isBrowser
  };
}