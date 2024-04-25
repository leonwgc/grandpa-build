"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _tslib = require("tslib");
var _path = require("path");
var _fs = require("fs");
var _vinylFs = _interopRequireDefault(require("vinyl-fs"));
var _signale = _interopRequireDefault(require("signale"));
var _lodash = _interopRequireDefault(require("lodash"));
var _rimraf = _interopRequireDefault(require("rimraf"));
var _through = _interopRequireDefault(require("through2"));
var _slash = _interopRequireDefault(require("slash2"));
var chokidar = _interopRequireWildcard(require("chokidar"));
var babel = _interopRequireWildcard(require("@babel/core"));
var _gulpTypescript = _interopRequireDefault(require("gulp-typescript"));
var _gulpLess = _interopRequireDefault(require("gulp-less"));
var _gulpPlumber = _interopRequireDefault(require("gulp-plumber"));
var _gulpIf = _interopRequireDefault(require("gulp-if"));
var _chalk = _interopRequireDefault(require("chalk"));
var _getBabelConfig = _interopRequireDefault(require("./getBabelConfig"));
var ts = _interopRequireWildcard(require("typescript"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _default(opts) {
  return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
    function transform(opts) {
      var _a, _b;
      var file = opts.file,
        type = opts.type;
      var _c = (0, _getBabelConfig.default)({
          target: target,
          type: type,
          typescript: true,
          runtimeHelpers: runtimeHelpers,
          filePath: (0, _slash.default)((0, _path.relative)(cwd, file.path)),
          browserFiles: browserFiles,
          nodeFiles: nodeFiles,
          nodeVersion: nodeVersion,
          lazy: cjs && cjs.lazy,
          lessInBabelMode: lessInBabelMode,
          cwd: cwd
        }),
        babelOpts = _c.opts,
        isBrowser = _c.isBrowser;
      if (importLibToEs && type === "esm") {
        babelOpts.plugins.push(require.resolve("../lib/importLibToEs"));
      }
      (_a = babelOpts.presets).push.apply(_a, extraBabelPresets);
      (_b = babelOpts.plugins).push.apply(_b, extraBabelPlugins);
      var relFile = (0, _slash.default)(file.path).replace("".concat(cwd, "/"), "");
      log("Transform to ".concat(type, " for ").concat(_chalk.default[isBrowser ? "yellow" : "blue"](relFile)));
      return babel.transform(file.contents, (0, _tslib.__assign)((0, _tslib.__assign)({}, babelOpts), {
        filename: file.path,
        // 不读取外部的babel.config.js配置文件，全采用babelOpts中的babel配置来构建
        configFile: false
      })).code;
    }
    /**
     * tsconfig.json is not valid json file
     * https://github.com/Microsoft/TypeScript/issues/20384
     */
    function parseTsconfig(path) {
      var readFile = function readFile(path) {
        return (0, _fs.readFileSync)(path, "utf-8");
      };
      var result = ts.readConfigFile(path, readFile);
      if (result.error) {
        return;
      }
      var pkgTsConfig = result.config;
      if (pkgTsConfig.extends) {
        var rootTsConfigPath = (0, _slash.default)((0, _path.relative)(cwd, pkgTsConfig.extends));
        var rootTsConfig = parseTsconfig(rootTsConfigPath);
        if (rootTsConfig) {
          var mergedConfig = (0, _tslib.__assign)((0, _tslib.__assign)((0, _tslib.__assign)({}, rootTsConfig), pkgTsConfig), {
            compilerOptions: (0, _tslib.__assign)((0, _tslib.__assign)({}, rootTsConfig.compilerOptions), pkgTsConfig.compilerOptions)
          });
          return mergedConfig;
        }
      }
      return pkgTsConfig;
    }
    function getTsconfigCompilerOptions(path) {
      var config = parseTsconfig(path);
      return config ? config.compilerOptions : undefined;
    }
    function getTSConfig() {
      var tsconfigPath = (0, _path.join)(cwd, "tsconfig.json");
      var templateTsconfigPath = (0, _path.join)(__dirname, "../template/tsconfig.json");
      if ((0, _fs.existsSync)(tsconfigPath)) {
        return getTsconfigCompilerOptions(tsconfigPath) || {};
      }
      if (rootPath && (0, _fs.existsSync)((0, _path.join)(rootPath, "tsconfig.json"))) {
        return getTsconfigCompilerOptions((0, _path.join)(rootPath, "tsconfig.json")) || {};
      }
      return getTsconfigCompilerOptions(templateTsconfigPath) || {};
    }
    function createStream(src) {
      var tsConfig = getTSConfig();
      var babelTransformRegexp = disableTypeCheck ? /\.(t|j)sx?$/ : /\.jsx?$/;
      function isTsFile(path) {
        return /\.tsx?$/.test(path) && !path.endsWith(".d.ts");
      }
      function isTransform(path) {
        return babelTransformRegexp.test(path) && !path.endsWith(".d.ts");
      }
      return _vinylFs.default.src(src, {
        allowEmpty: true,
        base: srcPath
      }).pipe(watch ? (0, _gulpPlumber.default)() : _through.default.obj()).pipe((0, _gulpIf.default)(function (f) {
        return !disableTypeCheck && isTsFile(f.path);
      }, (0, _gulpTypescript.default)(tsConfig))).pipe((0, _gulpIf.default)(function (f) {
        return lessInBabelMode && /\.less$/.test(f.path);
      }, (0, _gulpLess.default)(lessInBabelMode || {}))).pipe((0, _gulpIf.default)(function (f) {
        return isTransform(f.path);
      }, _through.default.obj(function (file, env, cb) {
        try {
          file.contents = Buffer.from(transform({
            file: file,
            type: type
          }));
          // .jsx -> .js
          file.path = file.path.replace((0, _path.extname)(file.path), ".js");
          cb(null, file);
        } catch (e) {
          _signale.default.error("Compiled faild: ".concat(file.path));
          console.log(e);
          cb(null);
        }
      }))).pipe(_vinylFs.default.dest(targetPath));
    }
    var cwd, rootPath, type, watch, dispose, importLibToEs, log, _a, _b, target, runtimeHelpers, _c, extraBabelPresets, _d, extraBabelPlugins, _e, browserFiles, _f, nodeFiles, nodeVersion, disableTypeCheck, cjs, lessInBabelMode, srcPath, targetDir, targetPath;
    return (0, _tslib.__generator)(this, function (_g) {
      cwd = opts.cwd, rootPath = opts.rootPath, type = opts.type, watch = opts.watch, dispose = opts.dispose, importLibToEs = opts.importLibToEs, log = opts.log, _a = opts.bundleOpts, _b = _a.target, target = _b === void 0 ? "browser" : _b, runtimeHelpers = _a.runtimeHelpers, _c = _a.extraBabelPresets, extraBabelPresets = _c === void 0 ? [] : _c, _d = _a.extraBabelPlugins, extraBabelPlugins = _d === void 0 ? [] : _d, _e = _a.browserFiles, browserFiles = _e === void 0 ? [] : _e, _f = _a.nodeFiles, nodeFiles = _f === void 0 ? [] : _f, nodeVersion = _a.nodeVersion, disableTypeCheck = _a.disableTypeCheck, cjs = _a.cjs, lessInBabelMode = _a.lessInBabelMode;
      srcPath = (0, _path.join)(cwd, "src");
      targetDir = type === "esm" ? "es" : "lib";
      targetPath = (0, _path.join)(cwd, targetDir);
      log(_chalk.default.gray("Clean ".concat(targetDir, " directory")));
      _rimraf.default.sync(targetPath);
      return [2 /*return*/, new Promise(function (resolve) {
        var patterns = [(0, _path.join)(srcPath, "**/*"), "!".concat((0, _path.join)(srcPath, "**/fixtures{,/**}")), "!".concat((0, _path.join)(srcPath, "**/demos{,/**}")), "!".concat((0, _path.join)(srcPath, "**/__test__{,/**}")), "!".concat((0, _path.join)(srcPath, "**/__tests__{,/**}")), "!".concat((0, _path.join)(srcPath, "**/*.mdx")), "!".concat((0, _path.join)(srcPath, "**/*.md")), "!".concat((0, _path.join)(srcPath, "**/*.+(test|e2e|spec).+(js|jsx|ts|tsx)")), "!".concat((0, _path.join)(srcPath, "**/tsconfig{,.*}.json")), "!".concat((0, _path.join)(srcPath, ".umi{,-production,-test}{,/**}"))];
        createStream(patterns).on("end", function () {
          if (watch) {
            var compileFiles = function compileFiles() {
              while (files_1.length) {
                createStream(files_1.pop());
              }
            };
            log(_chalk.default.magenta("Start watching ".concat((0, _slash.default)(srcPath).replace("".concat(cwd, "/"), ""), " directory...")));
            var watcher_1 = chokidar.watch(patterns, {
              ignoreInitial: true
            });
            var files_1 = [];
            var debouncedCompileFiles_1 = _lodash.default.debounce(compileFiles, 1000);
            watcher_1.on("all", function (event, fullPath) {
              var relPath = fullPath.replace(srcPath, "");
              log("[".concat(event, "] ").concat((0, _slash.default)((0, _path.join)(srcPath, relPath)).replace("".concat(cwd, "/"), "")));
              if (!(0, _fs.existsSync)(fullPath)) return;
              if ((0, _fs.statSync)(fullPath).isFile()) {
                if (!files_1.includes(fullPath)) files_1.push(fullPath);
                debouncedCompileFiles_1();
              }
            });
            process.once("SIGINT", function () {
              watcher_1.close();
            });
            dispose === null || dispose === void 0 ? void 0 : dispose.push(function () {
              return watcher_1.close();
            });
          }
          resolve();
        });
      })];
    });
  });
}