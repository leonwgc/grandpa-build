"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _tslib = require("tslib");
var _rollup = require("rollup");
var _signale = _interopRequireDefault(require("signale"));
var _chalk = _interopRequireDefault(require("chalk"));
var _getRollupConfig = _interopRequireDefault(require("./getRollupConfig"));
var _normalizeBundleOpts = _interopRequireDefault(require("./normalizeBundleOpts"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function build(entry, opts) {
  return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
    var cwd, rootPath, type, log, bundleOpts, importLibToEs, dispose, rollupConfigs, _loop_1, _i, rollupConfigs_1, rollupConfig;
    return (0, _tslib.__generator)(this, function (_a) {
      switch (_a.label) {
        case 0:
          cwd = opts.cwd, rootPath = opts.rootPath, type = opts.type, log = opts.log, bundleOpts = opts.bundleOpts, importLibToEs = opts.importLibToEs, dispose = opts.dispose;
          rollupConfigs = (0, _getRollupConfig.default)({
            cwd: cwd,
            rootPath: rootPath || cwd,
            type: type,
            entry: entry,
            importLibToEs: importLibToEs,
            bundleOpts: (0, _normalizeBundleOpts.default)(entry, bundleOpts)
          });
          _loop_1 = function _loop_1(rollupConfig) {
            var watcher_1, output, input, bundle;
            return (0, _tslib.__generator)(this, function (_b) {
              switch (_b.label) {
                case 0:
                  if (!opts.watch) return [3 /*break*/, 2];
                  watcher_1 = (0, _rollup.watch)([(0, _tslib.__assign)((0, _tslib.__assign)({}, rollupConfig), {
                    watch: {}
                  })]);
                  return [4 /*yield*/, new Promise(function (resolve) {
                    watcher_1.on('event', function (event) {
                      // 每次构建完成都会触发 BUNDLE_END 事件
                      // 当第一次构建完成或出错就 resolve
                      if (event.code === 'ERROR') {
                        _signale.default.error(event.error);
                        resolve();
                      } else if (event.code === 'BUNDLE_END') {
                        log("".concat(_chalk.default.green("Build ".concat(type, " success")), " ").concat(_chalk.default.gray("entry: ".concat(entry))));
                        resolve();
                      }
                    });
                  })];
                case 1:
                  _b.sent();
                  process.once('SIGINT', function () {
                    watcher_1.close();
                  });
                  dispose === null || dispose === void 0 ? void 0 : dispose.push(function () {
                    return watcher_1.close();
                  });
                  return [3 /*break*/, 5];
                case 2:
                  output = rollupConfig.output, input = (0, _tslib.__rest)(rollupConfig, ["output"]);
                  return [4 /*yield*/, (0, _rollup.rollup)(input)];
                case 3:
                  bundle = _b.sent();
                  return [4 /*yield*/, bundle.write(output)];
                case 4:
                  _b.sent(); // eslint-disable-line
                  log("".concat(_chalk.default.green("Build ".concat(type, " success")), " ").concat(_chalk.default.gray("entry: ".concat(entry))));
                  _b.label = 5;
                case 5:
                  return [2 /*return*/];
              }
            });
          };
          _i = 0, rollupConfigs_1 = rollupConfigs;
          _a.label = 1;
        case 1:
          if (!(_i < rollupConfigs_1.length)) return [3 /*break*/, 4];
          rollupConfig = rollupConfigs_1[_i];
          return [5 /*yield**/, _loop_1(rollupConfig)];
        case 2:
          _a.sent();
          _a.label = 3;
        case 3:
          _i++;
          return [3 /*break*/, 1];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
function _default(opts) {
  return (0, _tslib.__awaiter)(this, void 0, void 0, function () {
    var entries, _i, entries_1, entry;
    return (0, _tslib.__generator)(this, function (_a) {
      switch (_a.label) {
        case 0:
          if (!Array.isArray(opts.entry)) return [3 /*break*/, 5];
          entries = opts.entry;
          _i = 0, entries_1 = entries;
          _a.label = 1;
        case 1:
          if (!(_i < entries_1.length)) return [3 /*break*/, 4];
          entry = entries_1[_i];
          return [4 /*yield*/, build(entry, opts)];
        case 2:
          _a.sent();
          _a.label = 3;
        case 3:
          _i++;
          return [3 /*break*/, 1];
        case 4:
          return [3 /*break*/, 7];
        case 5:
          return [4 /*yield*/, build(opts.entry, opts)];
        case 6:
          _a.sent();
          _a.label = 7;
        case 7:
          if (opts.watch) {
            opts.log(_chalk.default.magentaBright("Rebuild ".concat(opts.type, " since file changed \uD83D\uDC40")));
          }
          return [2 /*return*/];
      }
    });
  });
}