/**
 * facebook.js
 *
 * @author Keisuke SATO <sato@crocos.co.jp>
 * @package crocos-js
 * @license BSD License
 */
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
        facebook.api('/', { ids: ids, fields: fetchQueue.fields }).done(function(response) {
          console.log(response);
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

