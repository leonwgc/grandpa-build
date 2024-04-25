"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CONFIG_FILES = void 0;
exports.default = _default;
var _ajv = _interopRequireDefault(require("ajv"));
var _slash = _interopRequireDefault(require("slash2"));
var _path = require("path");
var _signale = _interopRequireDefault(require("signale"));
var _fs = require("fs");
var _schema = _interopRequireDefault(require("./schema"));
var _utils = require("./utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function testDefault(obj) {
  return obj.default || obj;
}
var CONFIG_FILES = exports.CONFIG_FILES = ['.fatherrc.js', '.fatherrc.jsx', '.fatherrc.ts', '.fatherrc.tsx', '.umirc.library.js', '.umirc.library.jsx', '.umirc.library.ts', '.umirc.library.tsx'];
var CLASSES = {
  Function: Function
};
var extendAjv = function extendAjv(ajv) {
  ajv.addKeyword('instanceof', {
    compile: function compile(schema) {
      var Class = CLASSES[schema];
      return function (data) {
        return data instanceof Class;
      };
    }
  });
  return ajv;
};
function _default(_a) {
  var cwd = _a.cwd,
    customPath = _a.customPath;
  var finalPath = '';
  if (customPath) {
    finalPath = (0, _path.isAbsolute)(customPath) ? customPath : (0, _path.resolve)(process.cwd(), customPath);
    if (!(0, _fs.existsSync)(finalPath)) {
      throw new Error("can't found config file: ".concat(customPath));
    }
  }
  var configFile = finalPath || (0, _utils.getExistFile)({
    cwd: cwd,
    files: CONFIG_FILES,
    returnRelative: false
  });
  if (configFile) {
    if (configFile.includes('.umirc.library.')) {
      _signale.default.warn(".umirc.library.js is deprecated, please use .fatherrc.js instead.");
    }
    var userConfig = testDefault(require(configFile)); // eslint-disable-line
    var userConfigs = Array.isArray(userConfig) ? userConfig : [userConfig];
    userConfigs.forEach(function (userConfig) {
      var ajv = extendAjv(new _ajv.default({
        allErrors: true
      }));
      var isValid = ajv.validate(_schema.default, userConfig);
      if (!isValid) {
        var errors = ajv.errors.map(function (_a, index) {
          var dataPath = _a.dataPath,
            message = _a.message;
          return "".concat(index + 1, ". ").concat(dataPath).concat(dataPath ? ' ' : '').concat(message);
        });
        throw new Error("\nInvalid options in ".concat((0, _slash.default)((0, _path.relative)(cwd, configFile)), "\n\n").concat(errors.join('\n'), "\n").trim());
      }
    });
    return userConfig;
  } else {
    return {};
  }
}