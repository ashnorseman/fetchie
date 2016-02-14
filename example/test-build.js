(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
  "gifts/:id?": {
    "get": [
      {
        "id": 1,
        "name": "Gift 1"
      },
      {
        "id": 2,
        "name": "Gift 2"
      }
    ],
    "post": {
      "name": "$$name$$"
    },
    "put": {
      "id": 3
    },
    "error": {
      "error": true
    }
  }
}

},{}],2:[function(require,module,exports){
'use strict';

var _fetchie = require('../src/fetchie');

var _fetchie2 = _interopRequireDefault(_fetchie);

var _mock = require('../src/mock');

var _mock2 = _interopRequireDefault(_mock);

var _mockData = require('./data/mock-data.json');

var _mockData2 = _interopRequireDefault(_mockData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_fetchie2.default.use(function () {
  this.prefix('//localhost:9000');
}).use(function () {
  this.timeout(1000);
}).use(function () {
  this.cors(true);
}).use((0, _mock2.default)(_mockData2.default)).success(function (res) {
  console.log('Global Success:', this.toString(), res);
}).success(function (res) {
  if (res && res.success === false) {
    throw res;
  }
}).error(function (error) {
  console.error('Global Error:', this.toString(), error);
}); /**
     * Created by AshZhang on 15/12/24.
     */

_fetchie2.default.get('/gifts').query({
  pageNum: 1,
  pageSize: 16
})
//.mockError()
.then(function (res) {
  console.log(this.toString(), res);
});

_fetchie2.default.post('/gifts').send({
  name: 'New Gift'
}).then(function (res) {
  console.log(this.toString(), res);
});

_fetchie2.default.put('/gifts').send({
  name: 'New Gift'
}).then(function (res) {
  console.log(this.toString(), res);
});

_fetchie2.default.del('/gifts').send({
  name: 'New Gift'
}).then(function (res) {
  console.log(this.toString(), res);
});

_fetchie2.default.head('/gifts').query({
  pageNum: 1,
  pageSize: 16
}).accept('text').then(function (res) {
  console.log(this.toString(), res);
});

document.getElementById('file').addEventListener('change', function (e) {
  var file = e.target.files[0];

  _fetchie2.default.post('/post').send({
    pageNum: 1,
    pageSize: 16
  }).append('file', file, file.name).then(function (res) {
    console.log('File sent:', res);
  });
});

},{"../src/fetchie":6,"../src/mock":7,"./data/mock-data.json":1}],3:[function(require,module,exports){
var isarray = require('isarray')

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp
module.exports.parse = parse
module.exports.compile = compile
module.exports.tokensToFunction = tokensToFunction
module.exports.tokensToRegExp = tokensToRegExp

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {String} str
 * @return {Array}
 */
function parse (str) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    var prefix = res[2]
    var name = res[3]
    var capture = res[4]
    var group = res[5]
    var suffix = res[6]
    var asterisk = res[7]

    var repeat = suffix === '+' || suffix === '*'
    var optional = suffix === '?' || suffix === '*'
    var delimiter = prefix || '/'
    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      pattern: escapeGroup(pattern)
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {String}   str
 * @return {Function}
 */
function compile (str) {
  return tokensToFunction(parse(str))
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^' + tokens[i].pattern + '$')
    }
  }

  return function (obj) {
    var path = ''
    var data = obj || {}

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      var value = data[token.name]
      var segment

      if (value == null) {
        if (token.optional) {
          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encodeURIComponent(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = encodeURIComponent(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {String} str
 * @return {String}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        pattern: null
      })
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function stringToRegexp (path, keys, options) {
  var tokens = parse(path)
  var re = tokensToRegExp(tokens, options)

  // Attach keys back to the regexp.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] !== 'string') {
      keys.push(tokens[i])
    }
  }

  return attachKeys(re, keys)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {Array}  tokens
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function tokensToRegExp (tokens, options) {
  options = options || {}

  var strict = options.strict
  var end = options.end !== false
  var route = ''
  var lastToken = tokens[tokens.length - 1]
  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
    } else {
      var prefix = escapeString(token.prefix)
      var capture = token.pattern

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*'
      }

      if (token.optional) {
        if (prefix) {
          capture = '(?:' + prefix + '(' + capture + '))?'
        } else {
          capture = '(' + capture + ')?'
        }
      } else {
        capture = prefix + '(' + capture + ')'
      }

      route += capture
    }
  }

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
  }

  if (end) {
    route += '$'
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)'
  }

  return new RegExp('^' + route, flags(options))
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp (path, keys, options) {
  keys = keys || []

  if (!isarray(keys)) {
    options = keys
    keys = []
  } else if (!options) {
    options = {}
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys, options)
  }

  if (isarray(path)) {
    return arrayToRegexp(path, keys, options)
  }

  return stringToRegexp(path, keys, options)
}

},{"isarray":4}],4:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by AshZhang on 15/12/24.
 */

var SUPPORTED_METHODS = exports.SUPPORTED_METHODS = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  del: 'DELETE',
  head: 'HEAD'
};

var TYPES = exports.TYPES = {
  html: 'text/html',
  json: 'application/json',
  text: 'text/plain',
  xml: 'application/xml'
};

var TIMEOUT_ERROR = exports.TIMEOUT_ERROR = {
  message: 'Timeout'
};

},{}],6:[function(require,module,exports){
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

},{"./constants":5,"./mock":7,"./request":8}],7:[function(require,module,exports){
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

      // Insert client data
      Object.getOwnPropertyNames(res).forEach(function (key) {
        var test = /\$\$(\w+)\$\$/.exec(res[key]);

        if (test) {
          res[key] = data[test[1]];
        }
      });

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

},{"./constants":5,"./request":8,"path-to-regexp":3}],8:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /**
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

var Request = (function () {
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
    this._timeout = 1000;
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
            reject(TIMEOUT_ERROR);
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

      var queryString = makeQueryString(this._queries);

      fetch(this._urlPrefix + this.url + (queryString ? (~this.url.indexOf('?') ? '&' : '?') + queryString : ''), {
        method: this.method,
        headers: extendAppend(this.headers, {
          'Accept': _constants.TYPES[this._accept] || this._accept,
          'Content-Type': _constants.TYPES[this._type]
        }),
        body: this.formData || (this.data ? JSON.stringify(this.data) : null),
        credentials: this._cors ? 'include' : 'same-origin'
      }).then(function (res) {
        resolve(_this3._parseResponse(res));

        _this3._status = res.status;
        _this3._resolved = true;
        clearTimeout(timeout);
      }).catch(function (res) {
        reject(res);
        _this3._resolved = true;
        clearTimeout(timeout);
      });
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
          return res.json();
        case 'html':
        case 'text':
          return res.text();
        default:
          return res.blob();
      }
    }
  }]);

  return Request;
})();

exports.default = Request;

},{"./constants":5}]},{},[2]);
