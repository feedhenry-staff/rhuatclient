module.exports = {
  forwardMsg: forwardMsg,
  init: init
}
var log = require("./log");
var ADB = require("appium-adb");
var timer = null;
var devices = [];
var api = require("./api");
var _ = require("lodash");
var async = require("async");
var request = require("request");
var appium = require("./appium");

function forwardMsg(data, cb) {
  log.info(JSON.stringify(data));
  var host = appium.getHost();
  data.baseUrl = host + "/wd/hub";
  request(data, function(err, response, body) {
    //TODO erro handle for http non 200 code
    cb(err, body);
  });
}

function startCheckDevice() {
  timer = setInterval(function() {
    refreshDevice();
  }, 5000);
}

function refreshDevice() {
  ADB.logger.level="error";
  var adb = new ADB();
  adb.logger = log;
  adb.getConnectedDevices(function(err, des) {
    if (err) {
      throw (err);
    } else {
      var newDevices = [];
      var removedDevices = [];
      des.forEach(function(de) {
        if (!_.find(devices, function(d) {
            return d.id === de.udid;
          })) {
          newDevices.push({
            id: de.udid,
            name: de.state
          });
        }
      });
      devices.forEach(function(de) {
        if (!_.find(des, function(d) {
            return de.id === d.udid;
          })) {
          removedDevices.push(de.id);
        }
      });
      if (newDevices.length>0){
        log.info("Found new devices:", newDevices.length);
      }
      if (removedDevices.length>0){
        log.info("Found removed devices:", removedDevices);
      }
      async.each(newDevices, function(d, scb) {
        api.registerDevice(d, scb);
      }, function() {});
      async.each(removedDevices, function(d, scb) {
        api.deleteDevice(d, scb);
      }, function() {});
      devices = _.map(des, function(de) {
        return {
          id: de.udid,
          name: de.state
        }
      });
    }
  });
}

function init(cb) {
  startCheckDevice();
  cb();
}
