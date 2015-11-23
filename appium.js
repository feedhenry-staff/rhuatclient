module.exports = {
  init: init,
  getHost:getHost
}
var spawn = require("child_process").spawn;
var nodeSh = process.argv[0];
var bin = __dirname + "/node_modules/.bin/";
var log = require("./log");
var freeport = require("freeport");
var port=null;
function init(cb) {
  log.info("Start to check local environment");
  runDoctor(function() {
    log.info("check finished. Start appium server");
    startAppiumServer(cb);
  })
}


function runDoctor(cb) {
  var c = spawn(bin + "appium-doctor", [], {
    stdio: [0, 1, 2]
  });
  c.on("exit", function() {
    cb();
  });
}
function getHost(){
  return "http://127.0.0.1:"+port;
}

function startAppiumServer(cb) {
  freeport(function(err, p) {
    if (err) {
      throw (err);
    } else {
      port=p;
      log.info("Start appium server at port: ", port);
      var c = spawn(bin + "appium", ["-p",port], {
        stdio: [0, 1, 2]
      });
      c.on("exit", function() {
        log.error("Appium server terminated.", arguments);
        process.exit();
      });
      cb();
    }
  });
}
