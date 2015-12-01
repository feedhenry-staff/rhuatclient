var Device = require("./Device");
var util = require("util");


var _ = require("lodash");
var spawn = require("child_process").spawn;
var async = require("async");
var deviceInfo ="ideviceinfo";
var deviceUdid = "idevice_id";

function IOS() {
  Device.call(this);
}
util.inherits(IOS, Device);
IOS.prototype.getConnectedDevices = function(cb) {
  async.waterfall([
    function(scb) {
      runDeviceUdid(["-l"], function(err, d) {
        if (err) {
          scb(err);
        } else {
          scb(null, d.split("\n"));
        }
      });
    },
    function(idArr, scb) {
      var rtn=[];
      async.each(idArr, function(udid,udidCb) {
        if (udid.length === 0){
          return udidCb();
        }
        async.parallel({
          name:function(sscb) {
            runDeviceInfo(udid,["-k", "DeviceName"], sscb);
          },
          id:function(sscb) {
            runDeviceInfo(udid,["-k", "UniqueDeviceID"], sscb);
          },
          class:function(sscb) {
            runDeviceInfo(udid,["-k", "DeviceClass"], sscb);
          },
          version:function(sscb) {
            runDeviceInfo(udid,["-k", "ProductVersion"], sscb);
          }
        },function(err,res){
          if (err){
            udidCb(err);
          }else{
            res.type="ios";
            rtn.push(res);
            udidCb();
          }
        });
      }, function(err){
        scb(err,rtn);
      });
    }
  ], cb);
}

function runDeviceInfo(udid,args, cb) {
  args.push("-u");
  args.push(udid);
  run(deviceInfo, args, cb);
}

function runDeviceUdid(args, cb) {
  run(deviceUdid, args, cb);
}

function run(path, args, cb) {
  var cp = spawn(path, args);
  var output="";
  var error=false;
  cp.stdout.on("data", function(d) {
    output+=d.toString("utf8");
  });
  cp.stderr.on("data", function(d) {
    output+=d.toString("utf8");
    error=true;
    cp.kill();
  });
  cp.on("exit",function(){
    if (output.lastIndexOf("\n") === output.length-1){
      output=output.substr(0,output.length-1);
    }
    if (error){
      cb(output);
    }else{
      cb(null,output);
    }
  });
}

module.exports = new IOS();
