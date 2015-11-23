module.exports={
  registerDevice:registerDevice,
  deleteDevice:deleteDevice
}

var request=require("request");
var env=require("./env");
var log=require("./log");
var comm=require("./comm");
function registerDevice(device,cb){
    log.info("Register device:", JSON.stringify(device));
    var args={
      url:host()+"/api/session/"+comm.getSessionId()+"/registerDevice",
      body:device,
      json:true,
      method:"POST"
    }
    request(args,function(err,res,body){
      if (res.statusCode===200){
        log.info("Device registered successfuly");
      }else{
        log.info("Device registration failed.",body);
      }
      cb();
    });
}
function deleteDevice(deviceId,cb){
    log.info("Unregister device:", deviceId);
    var args={
      url:host()+"/api/session/"+comm.getSessionId()+"/device/"+deviceId,
      method:"DELETE"
    }
    request(args,function(err,res,body){
      if (res.statusCode===200){
        log.info("Device removed successfuly");
      }else{
        log.info("Device removed failed.",body);
      }
      cb();
    });
}
function host(){
    return "http://"+env.get("TEST_SERVER");
}
