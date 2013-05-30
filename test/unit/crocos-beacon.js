module("crocos-beacon");

test("loaded", function() {
  equal("function", typeof crocos.beacon);
  equal("function", typeof crocos.beaconBackend.WebAPI);
});

test("backend", function() {
  var backend = (function() {
    var b = function(cb) {
      this.cb = cb;
    };

    b.prototype.push = function(data) {
      this.cb(data);
    };

    b.prototype.setCb = function(cb) {
      this.cb = cb;
    };

    return b;
  }());

  var backend = new backend(null)
    , beacon = new crocos.beacon(backend);

  backend.setCb(function(data) {
    deepEqual({}, data);
  });

  beacon.push({});

  backend.setCb(function(data) {
    deepEqual({
      test: 1
    }, data);
  });

  beacon.push({
    test: 1
  });

  backend.setCb(function(data) {
    deepEqual({
      hoge: 'fuga',
      crocos: 'marketing',
      test: 2
    }, data);
  });

  beacon.setData({
    hoge: 'fuga',
    crocos: 'marketing'
  });

  beacon.push({
    test: 2
  });
});

test("backendWebAPI", function() {
  var WebAPI = crocos.beaconBackend.WebAPI;

  WebAPI.prototype.push = function(data) {
    equal('url', this.endpoint)
    equal('GET', this.method)
    equal('json', this.format);

    deepEqual({
      hoge: 'fuga',
      test: 1
    }, data);
  };

  var backend = new WebAPI('url', { method: 'GET' })
    , beacon = new crocos.beacon(backend);

  beacon.setData({
    hoge: 'fuga'
  });

  beacon.push({
    test: 1
  });
});

