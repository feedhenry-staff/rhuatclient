var async = require("async");
var device = module.exports = {
  android: require("./android"),
  ios: require("./ios"),
  getAllDevices: function(cb) {
    async.parallel([
      device.android.getConnectedDevices.bind(device.android),
      device.ios.getConnectedDevices.bind(device.ios)
    ], function(err, res) {
      if (err) {
        cb(err);
      } else {
        var rtn = [];
        res.forEach(function(r) {
          rtn = rtn.concat(r);
        });
        cb(null, rtn);
      }
    });
  }
}
