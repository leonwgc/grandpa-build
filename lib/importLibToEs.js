"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = require("path");
var _fs = _interopRequireDefault(require("fs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var cwd = process.cwd();
function replacePath(path) {
  if (path.node.source && /\/lib\//.test(path.node.source.value)) {
    var esModule = path.node.source.value.replace('/lib/', '/es/');
    var esPath = (0, _path.dirname)((0, _path.join)(cwd, "node_modules/".concat(esModule)));
    if (_fs.default.existsSync(esPath)) {
      console.log("[es build] replace ".concat(path.node.source.value, " with ").concat(esModule));
      path.node.source.value = esModule;
    }
  }
}
function replaceLib() {
  return {
    visitor: {
      ImportDeclaration: replacePath,
      ExportNamedDeclaration: replacePath
    }
  };
}
var _default = exports.default = replaceLib;