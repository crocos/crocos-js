/**
 * beacon.js
 *
 * @author Keisuke SATO <sato@crocos.co.jp>
 * @package crocos-js
 * @license BSD License
 */
(function(exports) {

  'use strict';

  var backend = {}, beacon = (function() {
    var Beacon = function(backend) {
      this.backend = backend;
      this.data = {};
    };

    Beacon.prototype.push = function(data) {
      return this.backend.push($.extend({}, this.data, data));
    };

    Beacon.prototype.setData = function(data) {
      this.data = data;
    };

    Beacon.prototype.getData = function() {
      return this.data;
    };

    return Beacon;
  }());

  backend.WebAPI = (function() {
    var WebAPI = function(endpoint) {
      var options = $.extend({
        method: 'POST',
        format: 'json'
      }, (arguments.length > 1 ? arguments[1] : {}));

      this.endpoint = endpoint;
      this.method = options.method;
      this.format = options.format;
    };

    WebAPI.prototype.push = function(data) {
      return $.ajax({
        url: this.endpoint,
        data: data,
        dataType: this.format,
        type: this.method
      });
    };

    return WebAPI;
  }());

  exports.beacon = beacon;
  exports.beaconBackend = backend;

}(crocos));
