var Device = require("./Device");
var util = require("util");


var ADB = require("appium-adb").ADB;
var _ = require("lodash");

function Android() {
  Device.call(this);
}
util.inherits(Android, Device);

Android.prototype.getConnectedDevices = function (cb) {
  // ADB.logger.level = "error";
  var adb = new ADB();
  adb.getConnectedDevices()
    .then(function (des) {
      cb(null, _.map(des, function (de) {
        return {
          id: de.udid,
          name: de.state,
          type: "android"
        };
      }));
    }, cb);
}

module.exports = new Android();
