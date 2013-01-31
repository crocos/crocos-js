/**
 * cache.js
 *
 * @author Keisuke SATO <sato@crocos.co.jp>
 * @package crocos-js
 * @license BSD License
 */
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
