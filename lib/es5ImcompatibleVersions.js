"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPkgPath = getPkgPath;
exports.shouldTransform = shouldTransform;
var _path = require("path");
var _pkgUp = _interopRequireDefault(require("pkg-up"));
var _semver = require("semver");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// 参考：
// https://github.com/umijs/umi/blob/2.x/packages/af-webpack/src/getWebpackConfig/es5ImcompatibleVersions.js

var pkgPathCache = {};
var pkgCache = {};
var config = require('es5-imcompatible-versions/package.json').config["es5-imcompatible-versions"];
function getPkgPath(filePath) {
  var dir = (0, _path.dirname)(filePath);
  if (dir in pkgPathCache) return pkgPathCache[dir];
  pkgPathCache[dir] = _pkgUp.default.sync({
    cwd: filePath
  });
  return pkgPathCache[dir];
}
function shouldTransform(pkgPath) {
  if (pkgPath in pkgCache) return pkgCache[pkgPath];
  var _a = require(pkgPath),
    name = _a.name,
    version = _a.version;
  pkgCache[pkgPath] = isMatch(name, version);
  return pkgCache[pkgPath];
}
function isMatch(name, version) {
  if (config[name]) {
    return Object.keys(config[name]).some(function (sv) {
      return (0, _semver.satisfies)(version, sv);
    });
  } else {
    return false;
  }
}