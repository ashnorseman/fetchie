/**
 * Created by AshZhang on 15/12/24.
 */


import { SUPPORTED_METHODS } from './constants';
import Request from './request';


const fetchie = {

  _middleware: [],
  _successHandlers: [],
  _errorHandlers: [],


  /**
   * Apply global middleware before the request is sent
   * @param {Function} cb
   * @returns {Request}
   */
  use(cb) {
    this._middleware.push(cb);

    return this;
  },


  /**
   * Set a success callback
   * @param {Function} cb
   * @returns {Request}
   */
  success(cb) {
    this._successHandlers.push(cb);

    return this;
  },


  /**
   * Set a error callback
   * @param {Function} cb
   * @returns {Request}
   */
  error(cb) {
    this._errorHandlers.push(cb);

    return this;
  }
};


Request._fetchie = fetchie;


// HTTP Methods
// ---------------------------

function genRequest(method) {
  return url => new Request({
    url,
    method
  });
}

Object.getOwnPropertyNames(SUPPORTED_METHODS).forEach(method => {
  fetchie[method] = genRequest(SUPPORTED_METHODS[method]);
});


export default fetchie;
