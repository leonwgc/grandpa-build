"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _tslib = require("tslib");
var _path = require("path");
var _slash = _interopRequireDefault(require("slash2"));
var _getBabelConfig = _interopRequireDefault(require("./getBabelConfig"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _default(opts) {
  var cwd = opts.cwd,
    only = opts.only;
  var babelConfig = (0, _getBabelConfig.default)({
    target: 'node',
    typescript: true
  }).opts;
  require('@babel/register')((0, _tslib.__assign)((0, _tslib.__assign)({}, babelConfig), {
    extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
    only: only.map(function (file) {
      return (0, _slash.default)((0, _path.isAbsolute)(file) ? file : (0, _path.join)(cwd, file));
    }),
    babelrc: false,
    cache: false
  }));
}