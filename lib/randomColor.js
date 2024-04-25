"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _chalk = _interopRequireDefault(require("chalk"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'gray', 'redBright', 'greenBright', 'yellowBright', 'blueBright', 'magentaBright', 'cyanBright'];
var index = 0;
var cache = {};
function _default(pkg) {
  if (!cache[pkg]) {
    var color = colors[index];
    var str = _chalk.default[color].bold(pkg);
    cache[pkg] = str;
    if (index === colors.length - 1) {
      index = 0;
    } else {
      index += 1;
    }
  }
  return cache[pkg];
}