/**
 * Created by AshZhang on 15/12/24.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var SUPPORTED_METHODS = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  del: 'DELETE',
  head: 'HEAD'
};

exports.SUPPORTED_METHODS = SUPPORTED_METHODS;
var TYPES = {
  html: 'text/html',
  json: 'application/json',
  text: 'text/plain',
  xml: 'application/xml'
};

exports.TYPES = TYPES;
var TIMEOUT_ERROR = {
  message: 'Timeout'
};
exports.TIMEOUT_ERROR = TIMEOUT_ERROR;