module("crocos-util");

test("loaded", function() {
  equal("object", typeof crocos.util);
});

test("nl2br", function() {
  var str_from = "hoge\nfuga\n",
      str_to   = "hoge<br />\nfuga<br />\n";

  equal(str_to, crocos.util.nl2br(str_from));
});

test("truncate", function() {
  var str_from    = "abcdefghijklmnopqrstuvwxyz",
      str_from_ja = "いろはにほへと";

  equal("abc..", crocos.util.truncate(str_from, 5));
  equal("いろは...", crocos.util.truncate(str_from_ja, 6, "..."));
  equal(str_from, crocos.util.truncate(str_from, str_from.length));
});
