"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.build = build;
exports.buildForLerna = buildForLerna;
exports.default = _default;
exports.getBundleOpts = getBundleOpts;
var _tslib = require("tslib");
var _fs = require("fs");
var _path = require("path");
var _rimraf = _interopRequireDefault(require("rimraf"));
var assert = _interopRequireWildcard(require("assert"));
var _lodash = require("lodash");
var _signale = _interopRequireDefault(require("signale"));
var _chalk = _interopRequireDefault(require("chalk"));
var _babel = _interopRequireDefault(require("./babel"));
var _rollup = _interopRequireDefault(require("./rollup"));
var _registerBabel = _interopRequireDefault(require("./registerBabel"));
var _utils = require("./utils");
var _getUserConfig = _interopRequireWildcard(require("./getUserConfig"));
var _randomColor = _interopRequireDefault(require("./randomColor"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function getBundleOpts(opts) {
  var cwd = opts.cwd,
    _a = opts.buildArgs,
    buildArgs = _a === void 0 ? {} : _a,
    _b = opts.rootConfig,
    rootConfig = _b === void 0 ? {} : _b;
  var entry = (0, _utils.getExistFile)({
    cwd: cwd,
    files: ['src/index.tsx', 'src/index.ts', 'src/index.jsx', 'src/index.js'],
    returnRelative: true
  });
  var userConfig = (0, _getUserConfig.default)({
    cwd: cwd,
    customPath: buildArgs.config
  });
  var userConfigs = Array.isArray(userConfig) ? userConfig : [userConfig];
  return userConfigs.map(function (userConfig) {
    var bundleOpts = (0, _lodash.merge)({
      entry: entry
    }, rootConfig, userConfig, buildArgs);
    // Support config esm: 'rollup' and cjs: 'rollup'
    if (typeof bundleOpts.esm === 'string') {
      bundleOpts.esm = {
        type: bundleOpts.esm
      };
    }
    if (typeof bundleOpts.cjs === 'string') {
      bundleOpts.cjs = {
        type: bundleOpts.cjs
      };
    }
    return bundleOpts;
  });
}
function validateBundleOpts(bundleOpts, _a) {
  var cwd = _a.cwd,
    rootPath = _a.rootPath;
  if (bundleOpts.runtimeHelpers) {
    var pkgPath = (0, _path.join)(cwd, 'package.json');
    assert.ok((0, _fs.existsSync)(pkgPath), "@babel/runtime dependency is required to use runtimeHelpers");
    var pkg = JSON.parse((0, _fs.readFileSync)(pkgPath, 'utf-8'));
    assert.ok((pkg.dependencies || {})['@babel/runtime'], "@babel/runtime dependency is required to use runtimeHelpers");
  }
  if (bundleOpts.cjs && bundleOpts.cjs.lazy && bundleOpts.cjs.type === 'rollup') {
    throw new Error("\ncjs.lazy don't support rollup.\n    ".trim());
  }
  if (!bundleOpts.esm && !bundleOpts.cjs && !bundleOpts.umd) {
    throw new Error("\nNone format of ".concat(_chalk.default.cyan('cjs | esm | umd'), " is configured, checkout https://github.com/umijs/father for usage details.\n").trim());
  }
  if (bundleOpts.entry) {
    var tsConfigPath = (0, _path.join)(cwd, 'tsconfig.json');
    var tsConfig = (0, _fs.existsSync)(tsConfigPath) || rootPath && (0, _fs.existsSync)((0, _path.join)(rootPath, 'tsconfig.json'));
    if (!tsConfig && (Array.isArray(bundleOpts.entry) && bundleOpts.entry.some(isTypescriptFile) || !Array.isArray(bundleOpts.entry) && isTypescriptFile(bundleOpts.entry))) {
      _signale.default.info("Project using ".concat(_chalk.default.cyan('typescript'), " but tsconfig.json not exists. Use default config."));
    }
  }
}
function isTypescriptFile(filePath) {
  return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
}
function build(opts, extraOpts) {
  if (extraOpts === void 0) {
    extraOpts = {};
  }
  return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
    function log(msg) {
      console.log("".concat(pkg ? "".concat((0, _randomColor.default)("".concat(pkgName)), ": ") : '').concat(msg));
    }
    var cwd, rootPath, watch, _a, buildArgs, _b, clean, pkg, dispose, customConfigPath, pkgName, bundleOptsArray, _i, bundleOptsArray_1, bundleOpts, cjs, esm, importLibToEs;
    return (0, _tslib.__generator)(this, function (_c) {
      switch (_c.label) {
        case 0:
          cwd = opts.cwd, rootPath = opts.rootPath, watch = opts.watch, _a = opts.buildArgs, buildArgs = _a === void 0 ? {} : _a, _b = opts.clean, clean = _b === void 0 ? true : _b;
          pkg = extraOpts.pkg;
          dispose = [];
          customConfigPath = buildArgs.config && ((0, _path.isAbsolute)(buildArgs.config) ? buildArgs.config : (0, _path.join)(process.cwd(), buildArgs.config));
          // register babel for config files
          (0, _registerBabel.default)({
            cwd: cwd,
            only: customConfigPath ? _getUserConfig.CONFIG_FILES.concat(customConfigPath) : _getUserConfig.CONFIG_FILES
          });
          pkgName = (typeof pkg === 'string' ? pkg : pkg === null || pkg === void 0 ? void 0 : pkg.name) || 'unknown';
          bundleOptsArray = getBundleOpts(opts);
          _i = 0, bundleOptsArray_1 = bundleOptsArray;
          _c.label = 1;
        case 1:
          if (!(_i < bundleOptsArray_1.length)) return [3 /*break*/, 12];
          bundleOpts = bundleOptsArray_1[_i];
          validateBundleOpts(bundleOpts, {
            cwd: cwd,
            rootPath: rootPath
          });
          // Clean dist
          if (clean) {
            log(_chalk.default.gray("Clean dist directory"));
            _rimraf.default.sync((0, _path.join)(cwd, 'dist'));
          }
          if (!bundleOpts.umd) return [3 /*break*/, 3];
          log("Build umd");
          return [4 /*yield*/, (0, _rollup.default)({
            cwd: cwd,
            rootPath: rootPath,
            log: log,
            type: 'umd',
            entry: bundleOpts.entry,
            watch: watch,
            dispose: dispose,
            bundleOpts: bundleOpts
          })];
        case 2:
          _c.sent();
          _c.label = 3;
        case 3:
          if (!bundleOpts.cjs) return [3 /*break*/, 7];
          cjs = bundleOpts.cjs;
          log("Build cjs with ".concat(cjs.type));
          if (!(cjs.type === 'babel')) return [3 /*break*/, 5];
          return [4 /*yield*/, (0, _babel.default)({
            cwd: cwd,
            rootPath: rootPath,
            watch: watch,
            dispose: dispose,
            type: 'cjs',
            log: log,
            bundleOpts: bundleOpts
          })];
        case 4:
          _c.sent();
          return [3 /*break*/, 7];
        case 5:
          return [4 /*yield*/, (0, _rollup.default)({
            cwd: cwd,
            rootPath: rootPath,
            log: log,
            type: 'cjs',
            entry: bundleOpts.entry,
            watch: watch,
            dispose: dispose,
            bundleOpts: bundleOpts
          })];
        case 6:
          _c.sent();
          _c.label = 7;
        case 7:
          if (!bundleOpts.esm) return [3 /*break*/, 11];
          esm = bundleOpts.esm;
          log("Build esm with ".concat(esm.type));
          importLibToEs = esm && esm.importLibToEs;
          if (!(esm && esm.type === 'babel')) return [3 /*break*/, 9];
          return [4 /*yield*/, (0, _babel.default)({
            cwd: cwd,
            rootPath: rootPath,
            watch: watch,
            dispose: dispose,
            type: 'esm',
            importLibToEs: importLibToEs,
            log: log,
            bundleOpts: bundleOpts
          })];
        case 8:
          _c.sent();
          return [3 /*break*/, 11];
        case 9:
          return [4 /*yield*/, (0, _rollup.default)({
            cwd: cwd,
            rootPath: rootPath,
            log: log,
            type: 'esm',
            entry: bundleOpts.entry,
            importLibToEs: importLibToEs,
            watch: watch,
            dispose: dispose,
            bundleOpts: bundleOpts
          })];
        case 10:
          _c.sent();
          _c.label = 11;
        case 11:
          _i++;
          return [3 /*break*/, 1];
        case 12:
          return [2 /*return*/, dispose];
      }
    });
  });
}
function buildForLerna(opts) {
  return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
    var cwd, _a, rootConfig, _b, buildArgs, userConfig, pkgs, dispose, _i, pkgs_1, pkg, pkgPath, _c, _d, _e;
    return (0, _tslib.__generator)(this, function (_f) {
      switch (_f.label) {
        case 0:
          cwd = opts.cwd, _a = opts.rootConfig, rootConfig = _a === void 0 ? {} : _a, _b = opts.buildArgs, buildArgs = _b === void 0 ? {} : _b;
          // register babel for config files
          (0, _registerBabel.default)({
            cwd: cwd,
            only: _getUserConfig.CONFIG_FILES
          });
          userConfig = (0, _lodash.merge)((0, _getUserConfig.default)({
            cwd: cwd
          }), rootConfig, buildArgs);
          return [4 /*yield*/, (0, _utils.getLernaPackages)(cwd, userConfig.pkgFilter)];
        case 1:
          pkgs = _f.sent();
          // support define pkgs in lerna
          // TODO: 使用lerna包解决依赖编译问题
          if (userConfig.pkgs) {
            pkgs = userConfig.pkgs.map(function (item) {
              return pkgs.find(function (pkg) {
                return (0, _path.basename)(pkg.contents) === item;
              });
            }).filter(Boolean);
          }
          dispose = [];
          _i = 0, pkgs_1 = pkgs;
          _f.label = 2;
        case 2:
          if (!(_i < pkgs_1.length)) return [3 /*break*/, 5];
          pkg = pkgs_1[_i];
          if (process.env.PACKAGE && (0, _path.basename)(pkg.contents) !== process.env.PACKAGE) return [3 /*break*/, 4];
          pkgPath = pkg.contents;
          assert.ok((0, _fs.existsSync)((0, _path.join)(pkgPath, 'package.json')), "package.json not found in packages/".concat(pkg));
          process.chdir(pkgPath);
          _d = (_c = dispose.push).apply;
          _e = [dispose];
          return [4 /*yield*/, build((0, _tslib.__assign)((0, _tslib.__assign)({}, opts), {
            buildArgs: opts.buildArgs,
            rootConfig: userConfig,
            cwd: pkgPath,
            rootPath: cwd
          }), {
            pkg: pkg
          })];
        case 3:
          _d.apply(_c, _e.concat([_f.sent()]));
          _f.label = 4;
        case 4:
          _i++;
          return [3 /*break*/, 2];
        case 5:
          return [2 /*return*/, dispose];
      }
    });
  });
}
function _default(opts) {
  return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
    var useLerna, isLerna, dispose, _a;
    return (0, _tslib.__generator)(this, function (_b) {
      switch (_b.label) {
        case 0:
          useLerna = (0, _fs.existsSync)((0, _path.join)(opts.cwd, 'lerna.json'));
          isLerna = useLerna && process.env.LERNA !== 'none';
          if (!isLerna) return [3 /*break*/, 2];
          return [4 /*yield*/, buildForLerna(opts)];
        case 1:
          _a = _b.sent();
          return [3 /*break*/, 4];
        case 2:
          return [4 /*yield*/, build(opts)];
        case 3:
          _a = _b.sent();
          _b.label = 4;
        case 4:
          dispose = _a;
          return [2 /*return*/, function () {
            return dispose.forEach(function (e) {
              return e();
            });
          }];
      }
    });
  });
}