crocos-js (1.2.0)
================================================================================


Build Status
--------------------------------------------------------------------------------

- master: [![Build Status](https://travis-ci.org/crocos/crocos-js.png?branch=master)](https://travis-ci.org/crocos/crocos-js)
- develop: [![Build Status](https://travis-ci.org/crocos/crocos-js.png?branch=develop)](https://travis-ci.org/crocos/crocos-js)


Getting Started
--------------------------------------------------------------------------------

jQuery のロード後に `dist/crocos.min.js` をロードしてください。

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
    <script src="crocos.min.js"></script>


Facebook 連携機能を使う場合は、`FB.init` 後に `window.crocos_facebook_initialized = true;` と記述してください。


Modules
--------------------------------------------------------------------------------

### crocos

#### iframe 内かどうか判定してスタイルを適用する

crocos-js をロードすると、frame の中かどうかを判定して `<html>` に、frame 内の場
合は `in-frame`、フレームに属していない場合は `self-frame` という class を追加し
ます。単純に CSS で `.in-frame .anyelements { .. }` と記述すると、スタイル適用で
きるようになってます。


#### Javascript Facebook SDK が初期化されたら任意のコードを実行する方法

(`crocos_facebook_initialized` の記述が必要です)

    crocos.wait('FB').done(function(){
      // here.
    });


### crocos-cache (beta)

対応ブラウザのみで動作するよ

    crocos.cache.on('cache_key', function(dfd) {
      // キャッシュがない場合の処理
      FB.api('/me', function(response) {
        dfd.resolve(response);
      });
      
      return dfd.promise();
    }, { expire: 3600 }).done(function(response){
      // キャッシュがあっても無くてもここで受け取れる
      console.log(response);
    });


### crocos-facebook

Facebook 系のライブラリ


#### fbx

噂の fbx を搭載

    <span class="fbx-graph" data-fbx-id="123456789" data-fbx-field="name"></span>さん、ようこそ！
    いいね！数: <span class="fbx-like-count" data-fbx-url="http://crocos.co.jp"></span>


### crocos-util

たまに欲しくなる系

- crocos.util.nl2br(text)
- crocos.util.truncate(text, length, trimmarker)
- crocos.util.redirect(url)


### crocos-beacon

あとでかく

    var beacon = new crocos.beacon(new crocos.beaconBackend.WebAPI(
      'http://example.com/beacon/endpoint'
    ));

    beacon.setData({
      userId: 12345,
      sessionId: 'c11e2c3dc57101640f1e842a3face454342a0355'
    });

    crocos.facebook.ready().done(function() {
      FB.ui({
        method: 'feed',
        // ...
      }, function(response) {
        if ('post_id' in response) {
          // POST http://example.com/beacon/endpoint
          // {
          //   userId    : 12345
          //   sessionId : 'c11e2c3dc57101640f1e842a3face454342a0355'
          //   postId    : response.post_id
          // }
          beacon.push({
            postId: response.post_id
          });
        }
      });
    });

