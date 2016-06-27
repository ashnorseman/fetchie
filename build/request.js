'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by AshZhang on 15/12/24.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('./constants');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Extend object
 * @param {Object} dist
 * @param {Object} src
 * @returns {Object}
 */
function extend(dist) {
  var src = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  Object.getOwnPropertyNames(src).forEach(function (key) {
    dist[key] = src[key];
  });

  return dist;
}

/**
 * Extend object using its `append` api
 * @param {Object} dist
 * @param {Object} src
 * @returns {Object}
 */
function extendAppend(dist) {
  var src = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  Object.getOwnPropertyNames(src).forEach(function (key) {
    if (src[key] !== undefined) {
      dist.append(key, src[key]);
    }
  });

  return dist;
}

/**
 * Make a query string
 * @param {object} query
 * @returns {string}
 */
function makeQueryString() {
  var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return Object.getOwnPropertyNames(query).map(function (key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
  }).join('&');
}

/**
 * Request object
 * @param {string} url
 * @param {method} method
 * @param {object} data
 * @constructor
 */

var Request = function () {
  function Request(_ref) {
    var _ref$url = _ref.url;
    var url = _ref$url === undefined ? '' : _ref$url;
    var _ref$method = _ref.method;
    var method = _ref$method === undefined ? 'GET' : _ref$method;

    _classCallCheck(this, Request);

    this.url = url;
    this.method = method;
    this.data = {};
    this.formData = null;
    this.headers = new Headers();

    this._urlPrefix = '';
    this._queries = {};
    this._type = 'json';
    this._accept = 'json';
    this._cors = false;
    this._timeout = 100000;
    this._errorHandler = null;
  }

  /**
   * toString
   * @returns {string}
   */


  _createClass(Request, [{
    key: 'toString',
    value: function toString() {
      var result = this.method + ': ' + this.url;

      if (Object.getOwnPropertyNames(this._queries).length) {
        result += ' ' + JSON.stringify(this._queries);
      }

      if (this.data && Object.getOwnPropertyNames(this.data).length) {
        result += ' ' + JSON.stringify(this.data);
      }

      return result;
    }

    /**
     * Append a query string
     * @param {object} query
     */

  }, {
    key: 'query',
    value: function query() {
      var _query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      extend(this._queries, _query);

      return this;
    }

    /**
     * Send JSON data
     * @param {object} data
     * @returns {Request}
     */

  }, {
    key: 'send',
    value: function send() {
      var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      extend(this.data, data);

      return this;
    }

    /**
     * Append a file
     * - must be used after all `send` methods
     * @param {string} name
     * @param {*} file
     * @param {string} [fileName]
     * @returns {Request}
     */

  }, {
    key: 'append',
    value: function append(name, file, fileName) {
      this.formData || (this.formData = new FormData());

      this.formData.append(name, file, fileName);

      extendAppend(this.formData, this.data);

      this.data = {};

      return this;
    }

    /**
     * Set headers
     * @param {Object} headers
     * @returns {Request}
     */

  }, {
    key: 'set',
    value: function set() {
      var headers = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      extendAppend(this.headers, headers);

      return this;
    }

    /**
     * Set content type
     * @param {string} type - json, form, html, xml
     * @returns {Request}
     */

  }, {
    key: 'setType',
    value: function setType(type) {
      this._type = type;

      return this;
    }

    /**
     * Set types to  accept
     * @param {string} type
     * @returns {Request}
     */

  }, {
    key: 'accept',
    value: function accept(type) {
      this._accept = type;

      return this;
    }

    /**
     * Set cors mode
     * @param {boolean} needCors
     * @returns {Request}
     */

  }, {
    key: 'cors',
    value: function cors(needCors) {
      this._cors = needCors;

      return this;
    }

    /**
     * Add a url prefix
     * @param {string} prefix
     * @returns {Request}
     */

  }, {
    key: 'prefix',
    value: function prefix(_prefix) {
      this._urlPrefix = _prefix;

      return this;
    }

    /**
     * Use catch
     * @returns {Request}
     */

  }, {
    key: 'cache',
    value: function cache() {
      this._cache = true;

      return this;
    }

    /**
     * Set timeout
     * @param {number} ms
     * @returns {Request}
     */

  }, {
    key: 'timeout',
    value: function timeout(ms) {
      this._timeout = ms;

      return this;
    }

    /**
     * Error callback
     * @param {Function} cb - cb(error<Object>)
     * @returns {Request}
     */

  }, {
    key: 'handleError',
    value: function handleError(cb) {
      this._errorHandler = cb;

      return this;
    }

    /**
     * Success callback
     * - executed after global success callbacks
     * @param {Function} cb
     * @returns {Promise}
     */

  }, {
    key: 'then',
    value: function then(cb) {
      var _this = this;

      return this._sendRequest().then(function (res) {
        if (_this._status < 200 || _this._status >= 400) {
          throw res;
        } else {
          cb.call(_this, res);
        }
      }).catch(function (error) {

        // Global error handlers
        Request._fetchie._errorHandlers.forEach(function (cb) {
          cb.call(_this, error);
        });

        // Local error handler
        if (_this._errorHandler) {
          _this._errorHandler(error);
        }

        // Errors should be properly handled!
        // DO NOT THROW!
      });
    }

    /**
     * Send a fetch request
     * @returns {Promise}
     * @private
     */

  }, {
    key: '_sendRequest',
    value: function _sendRequest() {
      var _this2 = this;

      var fetchie = Request._fetchie,
          method = this.method.toLocaleLowerCase();

      // Global middleware
      fetchie._middleware.forEach(function (cb) {
        cb.call(_this2);
      });

      // Change default Content-Type
      if (this.formData) {
        this.setType('form');
      }

      // Request with GET/HEAD method cannot have body
      if (method === 'get' || method === 'head') {
        this.data = null;
        this.formData = null;
      }

      return new Promise(function (resolve, reject) {
        var timeout = setTimeout(function () {
          if (!_this2._resolved) {
            reject(new Error('TIMEOUT_ERROR'));
          }
        }, _this2._timeout);

        // Send `fetch`
        _this2._fetch({
          resolve: resolve,
          reject: reject,
          timeout: timeout
        });
      }).then(function (res) {

        // Global success handlers
        fetchie._successHandlers.forEach(function (cb) {
          cb.call(_this2, res);
        });

        return res;
      });
    }

    /**
     * Fetch method
     * @param {Function} resolve
     * @param {Function} reject
     * @param {number} timeout
     * @private
     */

  }, {
    key: '_fetch',
    value: function _fetch(_ref2) {
      var _this3 = this;

      var resolve = _ref2.resolve;
      var reject = _ref2.reject;
      var timeout = _ref2.timeout;

      var queryString = makeQueryString(this._queries),
          url = this._urlPrefix + this.url + (queryString ? (~this.url.indexOf('?') ? '&' : '?') + queryString : '');

      if (this._cache && _constants.CACHE[url]) {
        resolve(_constants.CACHE[url].data);

        this._status = _constants.CACHE[url].status;
        this._resolved = true;
        clearTimeout(timeout);
      } else {
        fetch(url, {
          method: this.method,
          headers: extendAppend(this.headers, {
            'Accept': _constants.TYPES[this._accept] || this._accept,
            'Content-Type': _constants.TYPES[this._type]
          }),
          body: this.formData || (this.data ? JSON.stringify(this.data) : null),
          credentials: this._cors ? 'include' : 'same-origin'
        }).then(function (res) {
          var data = _this3._parseResponse(res);

          // Cache result
          if (_this3._cache && (_this3.method.toLocaleLowerCase() === 'get' || _this3.method.toLocaleLowerCase() === 'head')) {
            _constants.CACHE[url] = {
              data: data,
              status: res.status
            };
          }

          resolve(data);

          _this3._status = res.status;
          _this3._resolved = true;
          clearTimeout(timeout);
        }).catch(function (res) {
          reject(res);
          _this3._resolved = true;
          clearTimeout(timeout);
        });
      }
    }

    /**
     * Parse response body
     * @param {Object} res
     * @returns {*}
     */

  }, {
    key: '_parseResponse',
    value: function _parseResponse(res) {
      switch (this._accept) {
        case 'json':
          return res.json().catch(function () {
            return null;
          });
        case 'html':
        case 'text':
          return res.text();
        default:
          return res.blob();
      }
    }
  }]);

  return Request;
}();

exports.default = Request;