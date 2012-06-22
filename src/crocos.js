/**
 * crocos.js
 *
 * @author  Keisuke SATO <sato@crocos.co.jp>
 * @license MIT License
 */
(function(global, $, undefined){
  var crocos = global.crocos = {};
  var logs = [];

  /**
   * crocos.util
   */
  crocos.util = crocos.utils = {};

  /**
   * crocos.util.nl2br
   *
   * @param String str
   * @return String
   */
  crocos.util.nl2br = function(str) {
    return str.replace(/\n/g, "<br />\n");
  };

  /**
   * crocos.util.truncate
   *
   * @param String str
   * @param Integer width
   * @param String trimmaker
   * @return String
   */
  crocos.util.truncate = function(str, width, trimmarker) {
    trimmarker = trimmarker != null ? trimmarker : "..";
    if (str.length <= width) {
      trimmarker = "";
    }
    return str.slice(0, width - trimmarker.length) + trimmarker;
  };

  /**
   * crocos.util.redirect
   *
   * @param String url
   * @return void
   */
  crocos.util.redirect = function(url) {
    if (window.location != null) {
      return window.location = url;
    }
  };


  /**
   * crocos.wait
   * for async load
   *
   * @param String name
   * @return Deferred
   */
  crocos.wait = function(name) {
    var dfd = new $.Deferred();
    var check_variable = function() {
      if (name == "FB" && name in global && "crocos_facebook_initialized" in global && global.crocos_facebook_initialized) {
        return dfd.resolve(global[name]);
      } else if (name in global && name != "FB") {
        return dfd.resolve(global[name]);
      } else {
        return setTimeout(function() {
          return check_variable();
        }, 100);
      }
    };
    check_variable();

    return dfd.promise();
  };

  /**
   * crocos.logger
   *
   * @param String message
   * @return void
   */
  crocos.logger = function(message) {
    if (arguments.length === 1) {
      logs[logs.length] = message;
    } else {
      logs[logs.length] = arguments;
    }
  };

  /**
   * crocos.logger.flush
   *
   * @param Boolean clean
   * @return void
   */
  crocos.logger.flush = function(clean) {
    if (console !== undefined && console.log !== undefined) {
      console.log(logs);
    }
    if (clean) {
      return logs = [];
    }
  };

  /**
   * crocos.cache
   */
  crocos.cache = {};
  crocos.cache.enabled = global.localStorage !== undefined;

  /**
   * crocos.cache.get
   *
   * @param String key
   * @param Object options
   * @return mixed
   */
  crocos.cache.get = function(key, options) {
    if (!crocos.cache.enabled) {
      throw "localStorage is not enabled";
    }

    var now, val;
    val = global.localStorage.getItem(key);
    options = $.extend({}, options);
    if (val) {
      val = JSON.parse(val);
      if (!('data' in val)) {
        throw "cache. " + key + " not found";
      }
      if (options.expire) {
        now = new Date;
        if (!(val.created_at != null) || new Date(now.getTime() - (options.expire * 1000)) > val.created_at) {
          throw "cache. " + key + " was expired";
        }
      }

      return val.data;
    } else {
      throw "cache. " + key + " not found";
    }
  };

  /**
   * crocos.cache.set
   *
   * @param String key
   * @param mixed value
   * @return void
   */
  crocos.cache.set = function(key, value) {
    if (!crocos.cache.enabled) {
      throw "localStorage is not enabled";
    }

    var val;
    val = JSON.stringify({
      created_at: (new Date()).getTime(),
      data: value
    });
    try {
      return global.localStorage.setItem(key, val);
    } catch (e) {
      crocos.logger("cache. reflesh cache");
      global.localStorage.clear();
      return global.localStorage.setItem(key, val);
    }
  };

  /**
   * crocos.cache.has
   *
   * @param String key
   * @param Object options
   * @return mixed
   */
  crocos.cache.has = function(key, options) {
    try {
      crocos.cache.get(key, options);
      return true;
    } catch (e) {
      return false;
    }
  };

  /**
   * crocos.cache.with
   *
   * @param String key
   * @param Callback callback
   * @param Object options
   * @return Deferred
   */
  crocos.cache["with"] = function(key, callback, options) {
    var dfd;
    dfd = new $.Deferred();
    setTimeout(function() {
      if (crocos.cache.has(key)) {
        dfd.resolve(crocos.cache.get(key));
      } else {
        callback(new $.Deferred()).done(function(data) {
          crocos.cache.set(key, data);
          return dfd.resolve(data);
        });
      }
    }, 0);

    return dfd.promise();
  };

  /**
   * facebook
   */
  crocos.facebook = {};

  /**
   * crocos.facebook.ready
   * @deprecated
   */
  crocos.facebook.ready = function() {
    return crocos.wait('FB');
  };

  var fbx = {};

  fbx.setText = function(elem, text) {
    elem.text(text);
    return elem.addClass('fbx-processed');
  };

  fbx.graph_do = function() {
    var target, to_fetch_ids;
    target = $('.fbx-graph:not(.fbx-processed)');
    to_fetch_ids = [];
    target.each(function() {
      var cache_key, data, field, id, self;
      self = $(this);
      id = self.data('fbx-id');
      field = self.data('fbx-field');
      cache_key = "fbx_graph_" + id;
      if (cache.has(cache_key, {
        expire: 3600
      })) {
        data = cache.get(cache_key);
        if ((data != null) && field in data) {
          return fbx.setText(self, data[field]);
        }
      } else if (id != null) {
        return to_fetch_ids[to_fetch_ids.length] = id;
      }
    });
    if (to_fetch_ids.length) {
      return FB.api("?locale=ja_JP&ids=" + (to_fetch_ids.join(',')), function(response) {
        $.each(response, function(i, val) {
          return cache.set("fbx_graph_" + i, val);
        });
        return target.each(function() {
          var field, id, self;
          self = $(this);
          id = self.data('fbx-id');
          field = self.data('fbx-field');
          if (id in response && field in response[id]) {
            return fbx.setText(self, response[id][field]);
          }
        });
      });
    }
  };

  fbx.like_count_do = function() {
    var like_count_list, target, to_fetch_urls;
    target = $('.fbx-like-count:not(.fbx-processed)');
    to_fetch_urls = [];
    like_count_list = {};
    target.each(function() {
      var self;
      self = $(this);
      return to_fetch_urls[to_fetch_urls.length] = self.data('fbx-url');
    });
    if (to_fetch_urls.length) {
      return FB.api({
        method: "fql.query",
        query: "SELECT url, like_count FROM link_stat WHERE url IN ('" + (to_fetch_urls.join('\',\'')) + "')"
      }, function(response) {
        var row, _i, _len;
        for (_i = 0, _len = response.length; _i < _len; _i++) {
          row = response[_i];
          if ('url' in row && 'like_count' in row) {
            like_count_list[row.url] = row.like_count;
          }
        }
        return target.each(function() {
          var self, url;
          self = $(this);
          url = self.data('fbx-url');
          if (url in like_count_list) {
            fbx.setText(self, like_count_list[url]);
            if (parseInt(like_count_list[url], 10) === 0) {
              return self.addClass('fbx-like-count-zero');
            }
          }
        });
      });
    }
  };

  /**
   * crocos.facebook.fbx
   *
   * @return void
   */
  crocos.facebook.fbx = function() {
    fbx.graph_do();
    fbx.like_count_do();
  };


  /**
   * jQuery
   */
  $(function(){
    $('html').addClass(window.top === window.self ? 'self-frame' : 'in-frame');

    crocos.wait("FB").done(function(FB) {
      crocos.facebook.fbx();

      return FB.getLoginStatus(function(response) {
        if ('status' in response) {
          return $('html').addClass("fbstatus-" + response.status);
        }
      });
    });

    setTimeout(function(){
      global.crocos_facebook_initialized = true;
    }, 5000);
  });

})(this, jQuery);
