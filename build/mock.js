'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetchieMock;

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

var _constants = require('./constants');

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_request2.default.prototype.mockError = function () {
  this._returnError = true;

  return this;
};

/**
 * Mock fetchie data
 * @param {Object} mockData - data
 * @param {number} delayMs - mock server delay
 * @returns {Function}
 */
/**
 * Created by AshZhang on 15/12/25.
 */

function fetchieMock(mockData) {
  var delayMs = arguments.length <= 1 || arguments[1] === undefined ? 200 : arguments[1];

  var pathMap = Object.getOwnPropertyNames(mockData).map(function (path) {
    return {
      path: path,
      reg: (0, _pathToRegexp2.default)(path)
    };
  });

  return function () {

    this._fetch = function (_ref) {
      var _this = this;

      var resolve = _ref.resolve;
      var reject = _ref.reject;
      var timeout = _ref.timeout;
      var url = this.url;
      var method = this.method;
      var _queries = this._queries;
      var data = this.data;
      var urlTrimmed = url.replace(/^\/|\/$/, '');
      var pathMatched = pathMap.filter(function (item) {
        return item.reg.test(urlTrimmed);
      });
      var resource = pathMatched[0] ? mockData[pathMatched[0].path] : {};

      var res = resource[this._returnError ? 'error' : method.toLocaleLowerCase()] || {};

      if (typeof res === 'function') {
        (function () {
          var keys = [],
              reg = (0, _pathToRegexp2.default)(pathMatched[0].path, keys),
              params = reg.exec(urlTrimmed).slice(1);

          res = res(_queries, keys.reduce(function (result, key, i) {
            result[key.name] = params[i];
            return result;
          }, {}));
        })();
      }

      console.info('[Mock]', this.toString(), res);

      // Mock server delay
      if (delayMs > this._timeout) {
        reject(_constants.TIMEOUT_ERROR);
      } else {
        setTimeout(function () {
          _this._returnError ? reject(res) : resolve(res);
        }, delayMs || 0);
      }

      clearTimeout(timeout);
    };

    return this;
  };
}