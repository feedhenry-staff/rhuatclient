module.exports = Device;
var EventEmitter = require("events").EventEmitter;
var util = require("util");

function Device() {
  EventEmitter.call(this);
  this.timer = null;
  this.devices = [];
}
util.inherits(Device, EventEmitter);
var _ = require("lodash");
var log=require("../log");
Device.prototype.getConnectedDevices = function(cb) {
  throw ("not implemented");
}
Device.prototype.startCheckDevice = function() {
  if (!this.timer) {
    var running = false;
    this.timer = setInterval(function() {
      if (running) {
        log.info("Previous device check is still running. skip now.");
        return;
      }
      running = true;
      var timeout=setTimeout(function(){
        log.warn("device list timeout");
        running=false;
      },5000);
      this.getConnectedDevices(function(err, curDes) {
        clearTimeout(timeout);
        curDes=_.filter(curDes,function(curDe){
          return curDe.name !="-";
        });
        if (curDes.length != this.devices.length) {
          this.emit("device_changed", curDes);
          this.devices = curDes;
          running = false;
          return;
        }
        for (var i = 0; i < curDes.length; i++) {
          var de = _.find(this.devices, function(d) {
            return d.id == curDes[i].id;
          });
          if (!de) {
            this.emit("device_changed", curDes);
            this.devices = curDes;
            running = false;
            return;
          }
        }
        running = false;
        return;
      }.bind(this));
    }.bind(this), 5000);
  }
}
