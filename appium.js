module.exports = {
  init: init,
  startAppiumServer:startAppiumServer
}
var spawn = require("child_process").spawn;
var nodeSh = process.argv[0];
var bin = __dirname + "/node_modules/.bin/";
var log = require("./log");
var freeport = require("freeport");
function init(cb) {
  log.info("Start to check local environment");
  runDoctor(function() {
    log.info("check finished. Please follow instructions above.");
    cb();
    // startAppiumServer(cb);
  });
}


function runDoctor(cb) {
  var c = spawn(bin + "appium-doctor", [], {
    stdio: [0, 1, 2]
  });
  c.on("exit", function() {
    cb();
  });
}

function startAppiumServer(cb) {
  freeport(function(err, p) {
    if (err) {
      throw (err);
    } else {
      var port=p;
      log.info("Starting a new appium session");
      var c = spawn(bin + "appium", ["-p",port], {
        stdio: ["pipe", "pipe", 2]
      });
      c.on("exit", function() {
        log.error("Appium server terminated.", arguments);
        process.exit();
      });
      c.stdout.on("data",function(d){
          var str=d.toString("utf8").toLowerCase();
          if (str.indexOf("listener started on")>-1){
            log.info("Dedicated appium session started");
            c.started=new Date();
            cb(null,c);
          }
          if (str.indexOf("shut down because no new commands came in")>-1){
            log.info("Session closed due to no command. Kill process.");
            c.kill();
          }
          process.stdout.write(d);
      });
      c.getHost=function(){
        return "http://127.0.0.1:"+port;
      }
      //TODO add starting timeout.
    }
  });
}
