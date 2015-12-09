module.exports = {
  init: init,
  reply: reply,
  getSessionId: getSessionId
}
var log = require("./log");
var env = require("./env");
var agent = require("./deviceAgent");
var conn = null;
var sessionId = null;
var initCb = null;

function getSessionId() {
  return sessionId;
}

function init(cb) {
  var svrUrl = env.get("TEST_SERVER");
  log.info("Start to connect server: ", svrUrl);
  var wsClient = require('socket.io-client')("http://" + svrUrl);
  // var wsClient = new WebSocketClient();
  wsClient.on("connect", onConnection);
  wsClient.on("connect_error", onConnectionFailed);
  wsClient.on("connect_timeout", onConnectionFailed);
  wsClient.on("close", onClose);
  conn = wsClient;
  initCb = cb;
}

var eventRegistered=false;
function onConnection() {
  log.info("Connection made.");
  if (!eventRegistered){
  conn.on("ping", onPing);
  conn.on("message", onMessage);
  eventRegistered=true;
  }
}

function onClose(connection, reason) {
  log.info("Connection is closed due to: ", reason);
}

function onConnectionFailed(err) {
  log.error("Connection failed");
  log.error(err);
}

function onPing(data) {
  data = data.toString("utf8");
  if (data.length > 0) {
    log.info("Get session id: ", data);
    sessionId = data;
    require("./deviceAgent").updateDevices();
  }
  if (initCb) {
    initCb();
    initCb = null;
  }
}

function onMessage(msg) {
  var data = msg.toString("utf8");
  try {
    var obj = JSON.parse(data);
    var reqData = obj.data;
    var msgId = obj.msgId;
    agent.forwardMsg(reqData, function(err, body) {
      if (err) {
        log.error(err);
        reply(msgId,err,true);
      } else {
        reply(msgId, body);
      }
    });
  } catch (e) {
    log.error(e);
  }
}

function reply(msgId, data,isError) {
  var msg = {
    msgId: msgId,
    data: data,
    isReply: true,
    isError:!!isError
  }
  conn.emit("message",JSON.stringify(msg));
}
