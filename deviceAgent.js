module.exports = {
  forwardMsg: forwardMsg,
  init: init,
  updateDevices:updateDevices
}
var log = require("./log");
var timer = null;
var devices = [];
var api = require("./api");
var _ = require("lodash");
var async = require("async");
var request = require("request");
var appium = require("./appium");
var device=require("./device");
function forwardMsg(data, cb) {
  log.info(JSON.stringify(data));
  var host = appium.getHost();
  data.baseUrl = host + "/wd/hub";
  request(data, function(err, response, body) {
    //TODO erro handle for http non 200 code
    cb(err, body);
  });
}


function init(cb) {
  log.info("Start to init Android device agent.");
  device.android.startCheckDevice();
  device.android.on("device_changed",function(android_devices){
    log.info("Connected android device has changed. Update now.");
    updateDevices();
  });
  device.ios.startCheckDevice();
  device.ios.on("device_changed",function(ios_devices){
    log.info("Connected ios device has changed. Update now.");
    updateDevices();
  });
  cb();
}
function updateDevices(){
  device.getAllDevices(function(err,devs){
    if (err){
      log.error(err);
    }else{
      api.setDevices(devs,function(err){});
    }
  });
}
