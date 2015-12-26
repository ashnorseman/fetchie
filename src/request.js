/**
 * Created by AshZhang on 15/12/24.
 */


import { TYPES, TIMEOUT_R } from './constants';


/**
 * Extend object
 * @param {Object} dist
 * @param {Object} src
 * @returns {Object}
 */
function extend(dist, src = {}) {
  Object.getOwnPropertyNames(src).forEach(key => {
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
function extendAppend(dist, src = {}) {
  Object.getOwnPropertyNames(src).forEach(key => {
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
function makeQueryString(query = {}) {
  return Object.getOwnPropertyNames(query)
    .map(key => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
    })
    .join('&');
}


/**
 * Request object
 * @param {string} url
 * @param {method} method
 * @param {object} data
 * @constructor
 */
export default class Request {

  constructor({
    url = '',
    method = 'GET'
  }) {
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
  toString() {
    let result = `${this.method}: ${this.url}`;

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
  query(query = {}) {
    extend(this._queries, query);

    return this;
  }


  /**
   * Send JSON data
   * @param {object} data
   * @returns {Request}
   */
  send(data = {}) {
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
  append(name, file, fileName) {
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
  set(headers = {}) {
    extendAppend(this.headers, headers);

    return this;
  }


  /**
   * Set content type
   * @param {string} type - json, form, html, xml
   * @returns {Request}
   */
  setType(type) {
    this._type = type;

    return this;
  }


  /**
   * Set types to  accept
   * @param {string} type
   * @returns {Request}
   */
  accept(type) {
    this._accept = type;

    return this;
  }


  /**
   * Set cors mode
   * @param {boolean} needCors
   * @returns {Request}
   */
  cors(needCors) {
    this._cors = needCors;

    return this;
  }


  /**
   * Add a url prefix
   * @param {string} prefix
   * @returns {Request}
   */
  prefix(prefix) {
    this._urlPrefix = prefix;

    return this;
  }


  /**
   * Set timeout
   * @param {number} ms
   * @returns {Request}
   */
  timeout(ms) {
    this._timeout = ms;

    return this;
  }


  /**
   * Error callback
   * @param {Function} cb - cb(error<Object>)
   * @returns {Request}
   */
  handleError(cb) {
    this._errorHandler = cb;

    return this;
  }


  /**
   * Success callback
   * - executed after global success callbacks
   * @param {Function} cb
   * @returns {Promise}
   */
  then(cb) {
    return this._sendRequest()
      .then(res => {
        if (this._status < 200 || this._status >= 400) {
          throw res;
        } else {
          cb.call(this, res);
        }
      })
      .catch(error => {

        // Global error handlers
        Request._fetchie._errorHandlers.forEach(cb => {
          cb.call(this, error);
        });

        // Local error handler
        if (this._errorHandler) {
          this._errorHandler(error);
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
  _sendRequest() {
    const fetchie = Request._fetchie,
      method = this.method.toLocaleLowerCase();

    // Global middleware
    fetchie._middleware.forEach(cb => {
      cb.call(this);
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

    return new Promise((resolve, reject) => {
      let timeout = setTimeout(() => {
          if (!this._resolved) {
            reject(TIMEOUT_ERROR);
          }
        }, this._timeout);

      // Send `fetch`
      this._fetch({
        resolve,
        reject,
        timeout
      });
    })
      .then(res => {

        // Global success handlers
        fetchie._successHandlers.forEach(cb => {
          cb.call(this, res);
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
  _fetch({
    resolve,
    reject,
    timeout
  }) {
    let queryString = makeQueryString(this._queries);

    fetch(this._urlPrefix + this.url + (
        queryString
          ? (~this.url.indexOf('?') ? '&' : '?') + queryString
          : ''
      ), {
      method: this.method,
      headers: extendAppend(this.headers, {
        'Accept': TYPES[this._accept] || this._accept,
        'Content-Type': TYPES[this._type]
      }),
      body: this.formData || (this.data ? JSON.stringify(this.data) : null),
      credentials: this._cors ? 'include' : 'same-origin'
    })
      .then(res => {
        resolve(this._parseResponse(res));

        this._status = res.status;
        this._resolved = true;
        clearTimeout(timeout);
      })
      .catch(res => {
        reject(res);
        this._resolved = true;
        clearTimeout(timeout);
      });
  }


  /**
   * Parse response body
   * @param {Object} res
   * @returns {*}
   */
  _parseResponse(res) {
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
}
