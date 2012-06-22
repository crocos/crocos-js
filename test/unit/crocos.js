test("crocos-js loaded", function() {
  ok(true, "crocos" in window);
});

asyncTest("crocos-js normal wait", function() {
  var find = false;

  crocos.wait("crocos_wait_test_000").done(function(){
    find = true;
  });

  setTimeout(function(){
    start();
    ok(!find);
    window['crocos_wait_test_000'] = "dummy";
    stop();
  }, 200);

  setTimeout(function(){
    start();
    ok(find);
  }, 800);
});

test("iframe class", function() {
  ok($('html').hasClass('self-frame'));
});
