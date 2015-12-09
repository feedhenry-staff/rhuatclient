module.exports = {
  forwardMsg: forwardMsg,
  init: init,
  updateDevices: updateDevices
}
var log = require("./log");
var timer = null;
var devices = [];
var api = require("./api");
var _ = require("lodash");
var async = require("async");
var request = require("request");
var appium = require("./appium");
var device = require("./device");
var appiumMap = {};
var url=require("url");
function forwardMsg(data, cb) {
  log.info(JSON.stringify(data));
  if (data.url === "/session" && data.method.toUpperCase() === "POST") { // new session
    appium.startAppiumServer(function(err, server) {
      prepareData(data, server.getHost());
      request(data, function(err, response, body) {
        if (!err && response && response.statusCode===303){
          var sessionId=response.headers.location.split("/session/")[1];
          appiumMap[sessionId]=server;
          server.on("exit",function(){
            delete appiumMap[sessionId];
          });
          cb(null,JSON.stringify({sessionId:sessionId}));
        }else{
          if (response && response.statusCode >=400){
            cb(body);
          }else{
            cb(err,body);
          }
        }
      });
    });
  } else {
    var sesId = getSessionId(data.url);
    if (sesId && appiumMap[sesId]) {
      var server=appiumMap[sesId];
      prepareData(data,server.getHost());
      request(data, function(err, response, body) {
        if (response && response.statusCode>=400){
          cb(body);
        }else{
          if (data.url.indexOf("session") > -1 && data.url.split("/").length === 3 && data.method.toUpperCase() === "DELETE") { // stop session
            server.kill();
          }
          cb(err, body);
        }
      });
    } else {
      cb(new Error("session not found."));
    }
  }
}

function prepareData(data, host) {
  data.baseUrl = host;
  data.url = "/wd/hub" + data.url;
}

function getSessionId(path) {
  var arr = path.split("/");
  if (arr[1] === "session") {
    return arr[2];
  }
  return null;
}

function init(cb) {
  log.info("Start to init Android device agent.");
  device.android.startCheckDevice();
  device.android.on("device_changed", function(android_devices) {
    log.info("Connected android device has changed. Update now.");
    updateDevices();
  });
  device.ios.startCheckDevice();
  device.ios.on("device_changed", function(ios_devices) {
    log.info("Connected ios device has changed. Update now.");
    updateDevices();
  });
  cb();
}

function updateDevices() {
  device.getAllDevices(function(err, devs) {
    if (err) {
      log.error(err);
    } else {
      api.setDevices(devs, function(err) {});
    }
  });
}
