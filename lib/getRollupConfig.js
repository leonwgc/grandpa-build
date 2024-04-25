"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _tslib = require("tslib");
var _fs = require("fs");
var _path = require("path");
var _pluginUrl = _interopRequireDefault(require("@rollup/plugin-url"));
var _pluginJson = _interopRequireDefault(require("@rollup/plugin-json"));
var _pluginReplace = _interopRequireDefault(require("@rollup/plugin-replace"));
var _pluginCommonjs = _interopRequireDefault(require("@rollup/plugin-commonjs"));
var _pluginNodeResolve = _interopRequireDefault(require("@rollup/plugin-node-resolve"));
var _pluginInject = _interopRequireDefault(require("@rollup/plugin-inject"));
var _pluginBabel = _interopRequireDefault(require("@rollup/plugin-babel"));
var _pluginutils = require("@rollup/pluginutils");
var _rollupPluginPostcss = _interopRequireDefault(require("rollup-plugin-postcss"));
var _rollupPluginTerser = require("rollup-plugin-terser");
var _rollupPluginTypescript = _interopRequireDefault(require("rollup-plugin-typescript2"));
var _lodash = require("lodash");
var _tempDir = _interopRequireDefault(require("temp-dir"));
var _autoprefixer = _interopRequireDefault(require("autoprefixer"));
var _lessPluginNpmImport = _interopRequireDefault(require("less-plugin-npm-import"));
var _rollup = _interopRequireDefault(require("@svgr/rollup"));
var _getBabelConfig = _interopRequireDefault(require("./getBabelConfig"));
var _es5ImcompatibleVersions = require("./es5ImcompatibleVersions");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _default(opts) {
  var _a, _b;
  var type = opts.type,
    entry = opts.entry,
    cwd = opts.cwd,
    rootPath = opts.rootPath,
    importLibToEs = opts.importLibToEs,
    bundleOpts = opts.bundleOpts;
  var umd = bundleOpts.umd,
    esm = bundleOpts.esm,
    cjs = bundleOpts.cjs,
    file = bundleOpts.file,
    _c = bundleOpts.target,
    target = _c === void 0 ? 'browser' : _c,
    _d = bundleOpts.extractCSS,
    extractCSS = _d === void 0 ? false : _d,
    _e = bundleOpts.injectCSS,
    injectCSS = _e === void 0 ? true : _e,
    modules = bundleOpts.cssModules,
    _f = bundleOpts.extraPostCSSPlugins,
    extraPostCSSPlugins = _f === void 0 ? [] : _f,
    _g = bundleOpts.extraBabelPresets,
    extraBabelPresets = _g === void 0 ? [] : _g,
    _h = bundleOpts.extraBabelPlugins,
    extraBabelPlugins = _h === void 0 ? [] : _h,
    _j = bundleOpts.extraRollupPlugins,
    extraRollupPlugins = _j === void 0 ? [] : _j,
    autoprefixerOpts = bundleOpts.autoprefixer,
    _k = bundleOpts.include,
    include = _k === void 0 ? /node_modules/ : _k,
    runtimeHelpersOpts = bundleOpts.runtimeHelpers,
    replaceOpts = bundleOpts.replace,
    injectOpts = bundleOpts.inject,
    _l = bundleOpts.extraExternals,
    extraExternals = _l === void 0 ? [] : _l,
    _m = bundleOpts.externalsExclude,
    externalsExclude = _m === void 0 ? [] : _m,
    nodeVersion = bundleOpts.nodeVersion,
    typescriptOpts = bundleOpts.typescriptOpts,
    _o = bundleOpts.nodeResolveOpts,
    nodeResolveOpts = _o === void 0 ? {} : _o,
    disableTypeCheck = bundleOpts.disableTypeCheck,
    _p = bundleOpts.lessInRollupMode,
    lessInRollupMode = _p === void 0 ? {} : _p,
    _q = bundleOpts.sassInRollupMode,
    sassInRollupMode = _q === void 0 ? {} : _q;
  var entryExt = (0, _path.extname)(entry);
  var name = file || (0, _path.basename)(entry, entryExt);
  var isTypeScript = entryExt === '.ts' || entryExt === '.tsx';
  var extensions = ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs'];
  var pkg = {};
  try {
    pkg = require((0, _path.join)(cwd, 'package.json')); // eslint-disable-line
  } catch (e) {}
  // cjs 不给浏览器用，所以无需 runtimeHelpers
  var runtimeHelpers = type === 'cjs' ? false : runtimeHelpersOpts;
  var babelOpts = (0, _tslib.__assign)((0, _tslib.__assign)({}, (0, _getBabelConfig.default)({
    type: type,
    target: type === 'esm' ? 'browser' : target,
    // watch 模式下有几率走的 babel？原因未知。
    // ref: https://github.com/umijs/father/issues/158
    typescript: true,
    runtimeHelpers: runtimeHelpers,
    nodeVersion: nodeVersion,
    cwd: cwd
  }).opts), {
    // ref: https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
    babelHelpers: runtimeHelpers ? 'runtime' : 'bundled',
    // exclude: /\/node_modules\//,
    filter: function filter(filePath) {
      var rollupFilter = (0, _pluginutils.createFilter)(null, /\/node_modules\//);
      // 默认过滤 node_modules
      if (!rollupFilter(filePath)) {
        var pkgPath = (0, _es5ImcompatibleVersions.getPkgPath)(filePath);
        return (0, _es5ImcompatibleVersions.shouldTransform)(pkgPath);
      }
      return true;
    },
    babelrc: false,
    // ref: https://github.com/rollup/rollup-plugin-babel#usage
    extensions: extensions
  });
  if (importLibToEs && type === 'esm') {
    babelOpts.plugins.push(require.resolve('../lib/importLibToEs'));
  }
  (_a = babelOpts.presets).push.apply(_a, extraBabelPresets);
  (_b = babelOpts.plugins).push.apply(_b, extraBabelPlugins);
  // rollup configs
  var input = (0, _path.join)(cwd, entry);
  var format = type;
  // ref: https://rollupjs.org/guide/en#external
  // 潜在问题：引用包的子文件时会报 warning，比如 @babel/runtime/helpers/esm/createClass
  // 解决方案：可以用 function 处理
  var external = (0, _tslib.__spreadArray)((0, _tslib.__spreadArray)((0, _tslib.__spreadArray)([], Object.keys(pkg.dependencies || {}), true), Object.keys(pkg.peerDependencies || {}), true), extraExternals, true);
  // umd 只要 external peerDependencies
  var externalPeerDeps = (0, _tslib.__spreadArray)((0, _tslib.__spreadArray)([], Object.keys(pkg.peerDependencies || {}), true), extraExternals, true);
  function getPkgNameByid(id) {
    var splitted = id.split('/');
    // @ 和 @tmp 是为了兼容 umi 的逻辑
    if (id.charAt(0) === '@' && splitted[0] !== '@' && splitted[0] !== '@tmp') {
      return splitted.slice(0, 2).join('/');
    } else {
      return id.split('/')[0];
    }
  }
  function testExternal(pkgs, excludes, id) {
    if (excludes.includes(id)) {
      return false;
    }
    return pkgs.includes(getPkgNameByid(id));
  }
  var terserOpts = {
    compress: {
      // pure_getters: true,
      // unsafe: true,
      // unsafe_comps: true,
      warnings: true
    }
  };
  // https://github.com/umijs/father/issues/164
  function mergePlugins(defaultRollupPlugins, extraRollupPlugins) {
    if (defaultRollupPlugins === void 0) {
      defaultRollupPlugins = [];
    }
    if (extraRollupPlugins === void 0) {
      extraRollupPlugins = [];
    }
    var pluginsMap = Object.assign(defaultRollupPlugins.reduce(function (r, plugin) {
      var _a;
      return (0, _tslib.__assign)((0, _tslib.__assign)({}, r), (_a = {}, _a[plugin.name] = plugin, _a));
    }, {}), extraRollupPlugins.reduce(function (r, plugin) {
      var _a;
      return (0, _tslib.__assign)((0, _tslib.__assign)({}, r), (_a = {}, _a[plugin.name] = plugin, _a));
    }, {}));
    return Object.values(pluginsMap);
  }
  function getPlugins(opts) {
    if (opts === void 0) {
      opts = {};
    }
    var minCSS = opts.minCSS;
    var defaultRollupPlugins = (0, _tslib.__spreadArray)((0, _tslib.__spreadArray)((0, _tslib.__spreadArray)((0, _tslib.__spreadArray)((0, _tslib.__spreadArray)([(0, _pluginUrl.default)(), (0, _rollup.default)(), (0, _rollupPluginPostcss.default)((0, _tslib.__assign)((0, _tslib.__assign)({
      extract: extractCSS,
      inject: injectCSS,
      modules: modules
    }, modules ? {
      autoModules: false
    } : {}), {
      minimize: !!minCSS,
      use: {
        less: (0, _tslib.__assign)({
          plugins: [new _lessPluginNpmImport.default({
            prefix: '~'
          })],
          javascriptEnabled: true
        }, lessInRollupMode),
        sass: (0, _tslib.__assign)({}, sassInRollupMode),
        stylus: false
      },
      plugins: (0, _tslib.__spreadArray)([(0, _autoprefixer.default)((0, _tslib.__assign)({
        // https://github.com/postcss/autoprefixer/issues/776
        remove: false
      }, autoprefixerOpts))], extraPostCSSPlugins, true)
    }))], injectOpts ? [(0, _pluginInject.default)(injectOpts)] : [], true), replaceOpts && Object.keys(replaceOpts || {}).length ? [(0, _pluginReplace.default)(replaceOpts)] : [], true), [(0, _pluginNodeResolve.default)((0, _tslib.__assign)({
      mainFields: ['module', 'jsnext:main', 'main'],
      extensions: extensions
    }, nodeResolveOpts))], false), isTypeScript ? [(0, _rollupPluginTypescript.default)((0, _tslib.__assign)({
      cwd: cwd,
      // @see https://github.com/umijs/father/issues/61#issuecomment-544822774
      clean: true,
      cacheRoot: "".concat(_tempDir.default, "/.rollup_plugin_typescript2_cache"),
      // 支持往上找 tsconfig.json
      // 比如 lerna 的场景不需要每个 package 有个 tsconfig.json
      tsconfig: [(0, _path.join)(cwd, 'tsconfig.json'), (0, _path.join)(rootPath, 'tsconfig.json')].find(_fs.existsSync),
      tsconfigDefaults: {
        compilerOptions: {
          // Generate declaration files by default
          declaration: true
        }
      },
      tsconfigOverride: {
        compilerOptions: {
          // Support dynamic import
          target: 'esnext'
        }
      },
      check: !disableTypeCheck
    }, typescriptOpts || {}))] : [], true), [(0, _pluginBabel.default)(babelOpts), (0, _pluginJson.default)()], false);
    return mergePlugins(defaultRollupPlugins, extraRollupPlugins || []);
  }
  switch (type) {
    case 'esm':
      var output = {
        dir: (0, _path.join)(cwd, "".concat(esm && esm.dir || 'dist')),
        entryFileNames: "".concat(esm && esm.file || "".concat(name, ".esm"), ".js")
      };
      return (0, _tslib.__spreadArray)([{
        input: input,
        output: (0, _tslib.__assign)({
          format: format
        }, output),
        plugins: (0, _tslib.__spreadArray)((0, _tslib.__spreadArray)([], getPlugins(), true), esm && esm.minify ? [(0, _rollupPluginTerser.terser)(terserOpts)] : [], true),
        external: testExternal.bind(null, external, externalsExclude)
      }], esm && esm.mjs ? [{
        input: input,
        output: {
          format: format,
          file: (0, _path.join)(cwd, "dist/".concat(esm && esm.file || "".concat(name), ".mjs"))
        },
        plugins: (0, _tslib.__spreadArray)((0, _tslib.__spreadArray)([], getPlugins(), true), [(0, _pluginReplace.default)({
          'process.env.NODE_ENV': JSON.stringify('production')
        }), (0, _rollupPluginTerser.terser)(terserOpts)], false),
        external: testExternal.bind(null, externalPeerDeps, externalsExclude)
      }] : [], true);
    case 'cjs':
      return [{
        input: input,
        output: {
          format: format,
          file: (0, _path.join)(cwd, "dist/".concat(cjs && cjs.file || name, ".js"))
        },
        plugins: (0, _tslib.__spreadArray)((0, _tslib.__spreadArray)([], getPlugins(), true), cjs && cjs.minify ? [(0, _rollupPluginTerser.terser)(terserOpts)] : [], true),
        external: testExternal.bind(null, external, externalsExclude)
      }];
    case 'umd':
      // Add umd related plugins
      var extraUmdPlugins = [(0, _pluginCommonjs.default)({
        include: include
        // namedExports options has been remove from https://github.com/rollup/plugins/pull/149
      })];
      return (0, _tslib.__spreadArray)([{
        input: input,
        output: {
          format: format,
          sourcemap: umd && umd.sourcemap,
          file: (0, _path.join)(cwd, "dist/".concat(umd && umd.file || "".concat(name, ".umd"), ".js")),
          globals: umd && umd.globals,
          name: umd && umd.name || pkg.name && (0, _lodash.camelCase)((0, _path.basename)(pkg.name))
        },
        plugins: (0, _tslib.__spreadArray)((0, _tslib.__spreadArray)((0, _tslib.__spreadArray)([], extraUmdPlugins, true), getPlugins(), true), [(0, _pluginReplace.default)({
          'process.env.NODE_ENV': JSON.stringify('development')
        })], false),
        external: testExternal.bind(null, externalPeerDeps, externalsExclude)
      }], umd && umd.minFile === false ? [] : [{
        input: input,
        output: {
          format: format,
          sourcemap: umd && umd.sourcemap,
          file: (0, _path.join)(cwd, "dist/".concat(umd && umd.file || "".concat(name, ".umd"), ".min.js")),
          globals: umd && umd.globals,
          name: umd && umd.name || pkg.name && (0, _lodash.camelCase)((0, _path.basename)(pkg.name))
        },
        plugins: (0, _tslib.__spreadArray)((0, _tslib.__spreadArray)((0, _tslib.__spreadArray)([], extraUmdPlugins, true), getPlugins({
          minCSS: true
        }), true), [(0, _pluginReplace.default)({
          'process.env.NODE_ENV': JSON.stringify('production')
        }), (0, _rollupPluginTerser.terser)(terserOpts)], false),
        external: testExternal.bind(null, externalPeerDeps, externalsExclude)
      }], true);
    default:
      throw new Error("Unsupported type ".concat(type));
  }
}