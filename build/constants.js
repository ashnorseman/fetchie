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