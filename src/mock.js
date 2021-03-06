/**
 * Created by AshZhang on 15/12/25.
 */


import pathToExp from 'path-to-regexp';
import { TIMEOUT_ERROR } from './constants';
import Request from './request';


Request.prototype.mockError = function () {
  this._returnError = true;

  return this;
};


/**
 * Mock fetchie data
 * @param {Object} mockData - data
 * @param {number} delayMs - mock server delay
 * @returns {Function}
 */
export default function fetchieMock(mockData, delayMs = 200) {
  const pathMap = Object.getOwnPropertyNames(mockData).map(path => {
    return {
      path,
      reg: pathToExp(path)
    };
  });

  return function () {

    this._fetch = function ({
      resolve,
      reject,
      timeout
    }) {
      const {
          url,
          method,
          _queries,
          data
        } = this,
        urlTrimmed = url.replace(/^\/|\/$/, ''),
        pathMatched = pathMap.filter(item => {
          return item.reg.test(urlTrimmed);
        }),
        resource = pathMatched[0] ? mockData[pathMatched[0].path] : {};

      let res = resource[this._returnError ? 'error': method.toLocaleLowerCase()] || {};

      if (typeof res === 'function') {
        const keys = [],
            reg = pathToExp(pathMatched[0].path, keys),
            params = reg.exec(urlTrimmed).slice(1);

        res = res(_queries, keys.reduce((result, key, i) => {
          result[key.name] = params[i];
          return result;
        }, {}));
      }

      console.info('[Mock]', this.toString(), res);

      // Mock server delay
      if (delayMs > this._timeout) {
        reject(TIMEOUT_ERROR);
      } else {
        setTimeout(() => {
          this._returnError
            ? reject(res)
            : resolve(res);
        }, delayMs || 0);
      }

      clearTimeout(timeout);
    };

    return this;
  }
}
