"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getExistFile = getExistFile;
Object.defineProperty(exports, "getLernaPackages", {
  enumerable: true,
  get: function get() {
    return _getLernaPackages.getLernaPackages;
  }
});
var _fs = require("fs");
var _path = require("path");
var _getLernaPackages = require("./getLernaPackages");
function getExistFile(_a) {
  var cwd = _a.cwd,
    files = _a.files,
    returnRelative = _a.returnRelative;
  for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
    var file = files_1[_i];
    var absFilePath = (0, _path.join)(cwd, file);
    if ((0, _fs.existsSync)(absFilePath)) {
      return returnRelative ? file : absFilePath;
    }
  }
}