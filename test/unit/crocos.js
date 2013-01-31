test("crocos-js loaded", function() {
  ok(true, "crocos" in window);
});

asyncTest("crocos-js normal wait", function() {
  var find = false;

  crocos.wait("crocos_wait_test_000").done(function(){
    find = true;
  });

  setTimeout(function(){
    ok(!find);
    window['crocos_wait_test_000'] = "dummy";
  }, 200);

  setTimeout(function(){
    ok(find);
    start();
  }, 800);
});

test("iframe class", function() {
  ok($('html').hasClass('self-frame'));
});
