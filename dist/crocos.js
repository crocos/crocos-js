/*! crocos-js - v1.1.1 - 2013-02-04
* Copyright (c) 2013 ; Licensed  */

(function(exports) {

  "use strict";

  var crocos = {
    locale: 'ja_JP'
  };

  exports.crocos = crocos;

  $(function() {
    $('html').addClass(window.top === window.self ? 'self-frame' : 'in-frame');
  });

}(typeof exports === 'undefined'? this : exports));


(function(exports) {

  'use strict';

  // Production steps of ECMA-262, Edition 5, 15.4.4.18
  // Reference: http://es5.github.com/#x15.4.4.18
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
      var T, k, O, len;

      if (this == null) {
        throw new TypeError(" this is null or not defined");
      }

      O = Object(this);
      len = O.length >>> 0; // Hack to convert O.length to a UInt32

      if ({}.toString.call(callback) != "[object Function]") {
        throw new TypeError(callback + " is not a function");
      }

      if (thisArg) {
        T = thisArg;
      }

      k = 0;

      while(k < len) {
        var kValue;

        if (k in O) {
          kValue = O[k];
          callback.call(T, kValue, k, O);
        }

        k++;
      }
    };
  }

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement) {
      if (this == null) {
        throw new TypeError();
      }

      var t = Object(this);
      var len = t.length >>> 0;

      if (len === 0) {
        return -1;
      }

      var n = 0;

      if (arguments.length > 0) {
        n = Number(arguments[1]);
        if (n != n) {
          n = 0;
        } else if (n != 0 && n != Infinity && n != -Infinity) {
          n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
      }

      if (n >= len) {
        return -1;
      }

      var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);

      for (; k < len; k++) {
        if (k in t && t[k] === searchElement) {
          return k;
        }
      }

      return -1;
    };
  }

}(crocos));

(function(exports) {

  'use strict';

  // hmm...
  exports.Deferred = $.Deferred;

}(crocos));

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


(function(exports) {

  'use strict';

  // variables
  var cache = {}
    , store
    , data = {};

  if (typeof localStorage === 'undefined') {
    store.setItem = function(key, value) {
      data[key] = value;
    };
    store.getItem = function(key) {
      if (key in data) {
        return data[key];
      }

      return null;
    };
    store.clear = function() {
      data = {};
    };
  } else {
    store = localStorage;
  }

  // ==================================================
  // set
  //
  // @param String key
  // @param Mixed value
  // ==================================================
  cache.set = function(key, value) {
    var val = JSON.stringify({
      created_at: (new Date()).getTime(),
      data: value
    });

    try {
      store.setItem(key, val);
    } catch (e) {
      store.clear();
      store.setItem(key, val);
    }
  };

  // ==================================================
  // get
  //
  // @param String key
  // @param Object options
  // ==================================================
  cache.get = function(key, options) {
    var now = new Date
      , options = options ? options : {}
      , val = store.getItem(key);


    if (val) {
      val = JSON.parse(val);

      if (!val || 'data' in val) {
        throw "no cache data";
      }

      if ('expire' in options) {
        if (!('created_at' in val)) {
          throw "invalid cache data";
        }
        if (now.getTime() > val.created_at + (options.expire * 1000)) {
          throw "cache expired";
        }
      }

      return val.data;
    }

    return null;
  };

  // ==================================================
  // has
  //
  // @param String key
  // @return boolean
  // ==================================================
  cache.has = function(key, options) {
    try {
      cache.get(key, options);
      return true;
    } catch(e) {
      return false;
    }
  };

  // ==================================================
  // on
  //
  // @param String key
  // @param Function callback
  // @param Options Object
  // @return Promised Deferred Object
  // ==================================================
  cache.on = function(key, callback, options) {
    var dfd = crocos.Deferred();

    setTimeout(function() {
      if (cache.has(key, options)) {
        dfd.resolve(cache.get(key, options));
      } else {
        callback.apply(null, [crocos.Deferred()]).done(function(data) {
          cache.set(key, data);
          dfd.resolve(data);
        });
      }
    }, 0);

    return dfd.promise();
  };

  // !deprecated
  cache['with'] = cache.on;

  exports.cache = cache;

}(crocos));

(function(exports) {

  'use strict';

  var facebook = {}
    , fbx = {}
    , fbxTimer;

  // ==================================================
  // ready
  // @return Promised Deferred Object
  // ==================================================
  facebook.ready = function() {
    var dfd = crocos.Deferred()
      , resolved = false;

    crocos.wait('FB').done(function() {
      FB.getLoginStatus(function(loginStatus) {
        dfd.resolve(loginStatus);
        resolved = true;
      });
    });

    // sandbox mode...
    setTimeout(function() {
      if (!resolved) {
        dfd.resolve({
          status: 'unknown'
        });
      }
    }, 7000);

    return dfd.promise();
  };

  // ==================================================
  // api
  // @return Promised Deferred Object
  // ==================================================
  facebook.api = function() {
    var dfd = crocos.Deferred()
      , args = [];

    $.each(arguments, function(i, arg) {
      args[args.length] = arg;
    });

    args[args.length] = function(response) {
      if (typeof response == 'object' && 'error' in response && response.error) {
        dfd.reject(response);
      } else {
        dfd.resolve(response);
      }
    };

    facebook.ready().done(function(loginStatus) {
      FB.api.apply(null, args);
    });

    return dfd.promise();
  };


  // ==================================================
  // fbx
  // ==================================================

  fbx.graph = function() {
    var $targets = $('.fbx-graph:not(.fbx-processed)')
      , fetchQueue = {
          ids: [],
          fields: []
        };

    facebook.ready().done(function(loginStatus) {
      $targets.each(function() {
        var $self = $(this)
          , fbxId = $self.attr('data-fbx-id')
          , fbxField = $self.attr('data-fbx-field');

        if (fbxId && fbxField) {
          crocos.util.arrayAdd(fetchQueue.ids, fbxId);
          crocos.util.arrayAdd(fetchQueue.fields, fbxField);
        }
      });

      crocos.util.arrayChunk(fetchQueue.ids, 50).forEach(function(ids) {
        if (!ids.length) {
          return;
        }
        facebook.api('/', { ids: ids, fields: fetchQueue.fields, locale: crocos.locale }).done(function(response) {
          $targets.each(function() {
            var $self = $(this)
              , fbxId = $self.attr('data-fbx-id')
              , fbxField = $self.attr('data-fbx-field');

            if (fbxId in response && fbxField in response[fbxId]) {
              $self.text(response[fbxId][fbxField]);
              $self.trigger({
                type: 'fbx:done',
                data: response[fbxId],
                response: response
              });
            } else {
              $self.trigger({
                type: 'fbx:fail',
                response: response
              });
            }
            $self.addClass('fbx-processed');
            $self.trigger({
              type: 'fbx:always',
              response: response
            });
          });
        });
      });
    });

  };

  fbx.likeCount = function() {
    var $targets = $('.fbx-like-count:not(.fbx-processed)')
      , fetchUrls = []
      , likeCounts = {};

    facebook.ready().done(function(loginStatus) {
      $targets.each(function() {
        var $self = $(this)
          , fbxUrl = $self.attr('data-fbx-url');

        if (fbxUrl) {
          crocos.util.arrayAdd(fetchUrls, fbxUrl);
        }
      });

      crocos.util.arrayChunk(fetchUrls, 30).forEach(function(urls) {
        if (!urls.length) {
          return;
        }

        facebook.api('/fql', {
          q: 'SELECT url, like_count FROM link_stat WHERE url IN (\'' + urls.join('\', \'') + '\')'
        }).done(function(response) {
          response.data.forEach(function(row) {
            if ('url' in row && 'like_count' in row) {
              likeCounts[row.url] = row.like_count;
            }
          });

          $targets.each(function() {
            var $self = $(this)
              , fbxUrl = $self.attr('data-fbx-url');

            if (fbxUrl in likeCounts) {
              $self.text(likeCounts[fbxUrl])
              $self.trigger({
                type: 'fbx:succeed',
                count: likeCounts[fbxUrl],
                response: response
              });
            } else {
              $self.trigger({
                type: 'fbx:fail',
                response: response
              });
            }
            $self.addClass('fbx-processed');
            $self.trigger({
              type: 'fbx:always',
              response: response
            });
          })
        });
      });
    });
  };

  facebook.fbx = function() {
    var wait = arguments.length > 0 ? arguments[1] : 10000;

    if (!wait) {
      return fbxTimer && clearInterval(fbxTimer);
    }

    fbx.graph();
    fbx.likeCount();

    fbxTimer = setInterval(function() {
      fbx.graph();
      fbx.likeCount();
    }, wait);
  };

  $(function() {
    facebook.fbx();
  });

  exports.facebook = facebook;

}(crocos));

