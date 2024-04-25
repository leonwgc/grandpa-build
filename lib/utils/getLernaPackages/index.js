"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLernaPackages = getLernaPackages;
exports.getStreamPackages = getStreamPackages;
var _tslib = require("tslib");
var _project = require("@lerna/project");
var _queryGraph = require("@lerna/query-graph");
var _filterPackages = require("@lerna/filter-packages");
/**
 * 获取lerna项目包集合
 * @param cwd
 */
function getLernaPackages(cwd, ops) {
  var _a;
  if (ops === void 0) {
    ops = {};
  }
  return (0, _tslib.__awaiter)(this, void 0, Promise, function () {
    var _b, include, _c, exclude, _d, skipPrivate, allPkgs, pkgs;
    return (0, _tslib.__generator)(this, function (_e) {
      switch (_e.label) {
        case 0:
          _b = ops.include, include = _b === void 0 ? [] : _b, _c = ops.exclude, exclude = _c === void 0 ? [] : _c, _d = ops.skipPrivate, skipPrivate = _d === void 0 ? false : _d;
          allPkgs = (_a = (0, _project.getPackagesSync)(cwd)) !== null && _a !== void 0 ? _a : [];
          pkgs = (0, _filterPackages.filterPackages)(allPkgs, include, exclude, !skipPrivate, true);
          return [4 /*yield*/, getStreamPackages(pkgs)];
        case 1:
          return [2 /*return*/, _e.sent()];
      }
    });
  });
}
function getStreamPackages(pkgs) {
  var graph = new _queryGraph.QueryGraph(pkgs, 'allDependencies', true);
  return new Promise(function (resolve) {
    var returnValues = [];
    var queueNextAvailablePackages = function queueNextAvailablePackages() {
      return graph.getAvailablePackages()
      // @ts-ignore
      .forEach(function (_a) {
        var pkg = _a.pkg,
          name = _a.name;
        graph.markAsTaken(name);
        Promise.resolve(pkg).then(function (value) {
          return returnValues.push(value);
        }).then(function () {
          return graph.markAsDone(pkg);
        }).then(function () {
          return queueNextAvailablePackages();
        });
      });
    };
    queueNextAvailablePackages();
    setTimeout(function () {
      resolve(returnValues);
    }, 0);
  });
}