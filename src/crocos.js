/**
 * crocos.js
 *
 * @author  Keisuke SATO <sato@crocos.co.jp>
 * @license BSD License
 */
(function(exports) {

  "use strict";

  var crocos = {
    locale: 'ja_JP'
  };

  exports.crocos = crocos;

  $('html').addClass(window.top === window.self ? 'self-frame' : 'in-frame');

}(typeof exports === 'undefined'? this : exports));

