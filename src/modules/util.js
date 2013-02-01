/**
 * util.js
 *
 * @author Keisuke SATO <sato@crocos.co.jp>
 * @package crocos-js
 * @license BSD License
 */
(function(exports) {

  'use strict';

  var util = {};

  // ==================================================
  // nl2br
  // @param String str
  // @return String
  // ==================================================
  util.nl2br = function(str) {
    return str.replace(/\n/g, "<br />\n");
  };

  // ==================================================
  // truncate
  //
  // @param String str
  // @param Integer width
  // @param String trimmaker
  // @return String
  // ==================================================
  util.truncate = function(str, width, trimmarker) {
    trimmarker = trimmarker != null ? trimmarker : "..";
    if (str.length <= width) {
      trimmarker = "";
    }
    return str.slice(0, width - trimmarker.length) + trimmarker;
  };

  // ==================================================
  // redirect
  //
  // @param String url
  // @return void
  // ==================================================
  util.redirect = function(url) {
    if (window.location != null) {
      return window.location = url;
    }
  };

  // ==================================================
  // wait
  //
  // @param String name
  // @return Deferred
  // ==================================================
  util.wait = function(name, container) {
    var dfd = crocos.Deferred()
      , check_variable = function() {
        if (
          name == "FB"
          && name in container
          && "crocos_facebook_initialized" in container
          && container.crocos_facebook_initialized
        ) {
          return dfd.resolve(container[name]);
        } else if (name in container && name != "FB") {
          return dfd.resolve(container[name]);
        } else {
          return setTimeout(function() {
            return check_variable();
          }, 100);
        }
      };

    check_variable();

    return dfd.promise();
  };

  util.arrayAdd = function(a, v) {
    if (a.indexOf(v) == -1) {
      a[a.length] = v;
    }
  };


  util.arrayChunk = function(a, n) {
    if (!a.length) {
      return [];
    }

    return [a.slice(0, n)].concat(util.arrayChunk(a.slice(n), n));
  };

  exports.util = exports.utils = util;

  if (typeof window !== 'undefined') {
    exports.wait = function(name) {
      return util.wait(name, window);
    };
  }
}(crocos));

