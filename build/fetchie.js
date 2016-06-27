'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchieMock = undefined;

var _constants = require('./constants');

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

var _mock = require('./mock');

var _mock2 = _interopRequireDefault(_mock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fetchie = {

  _middleware: [],
  _successHandlers: [],
  _errorHandlers: [],

  /**
   * Apply global middleware before the request is sent
   * @param {Function} cb
   * @returns {Request}
   */
  use: function use(cb) {
    this._middleware.push(cb);

    return this;
  },


  /**
   * Set a success callback
   * @param {Function} cb
   * @returns {Request}
   */
  success: function success(cb) {
    this._successHandlers.push(cb);

    return this;
  },


  /**
   * Set a error callback
   * @param {Function} cb
   * @returns {Request}
   */
  error: function error(cb) {
    this._errorHandlers.push(cb);

    return this;
  }
}; /**
    * Created by AshZhang on 15/12/24.
    */

_request2.default._fetchie = fetchie;

// HTTP Methods
// ---------------------------

function genRequest(method) {
  return function (url) {
    return new _request2.default({
      url: url,
      method: method
    });
  };
}

Object.getOwnPropertyNames(_constants.SUPPORTED_METHODS).forEach(function (method) {
  fetchie[method] = genRequest(_constants.SUPPORTED_METHODS[method]);
});

exports.fetchieMock = _mock2.default;
exports.default = fetchie;