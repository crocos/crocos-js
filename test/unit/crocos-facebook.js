// Facebook 周りのテスト難しいなー
// そして qunit でやることなのかどうかはあやしい

module("crocos-facebook");

test("loaded", function() {
  equal("object", typeof crocos.facebook);
});

asyncTest("fb.init", function() {
  var loaded = false;

  crocos.wait("FB").done(function(){
    ok(loaded);
    start();
  });

  window.fbAsyncInit = function() {
    ok(!loaded);

    FB.init({
      appId      : '114052475334124', // App ID
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });

    // Additional initialization code here
    loaded = true;
    window.crocos_facebook_initialized = true;
  };

  // Load the SDK Asynchronously
  (function(d){
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "https://connect.facebook.net/en_US/all.js";
     ref.parentNode.insertBefore(js, ref);
   }(document));
});
