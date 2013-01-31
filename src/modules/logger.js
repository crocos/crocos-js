/**
 * logger.js
 *
 * @author Keisuke SATO <sato@crocos.co.jp>
 * @package crocos-js
 * @license BSD License
 */
(function(exports) {

  'use strict';

  var logger = {}
    , logs = [];

  logger.debug = function(msg) {
    logs[logs.length] = msg;
  };

  logger.flush = function() {
    if (typeof console !== 'undefined') {
      logs.forEach(function(log) {
        console.log(log);
      });
    }
  };

  exports.logger = logger;

}(crocos));
