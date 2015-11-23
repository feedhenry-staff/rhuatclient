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
  var WebSocketClient = require('websocket').client
  var wsClient = new WebSocketClient();
  wsClient.on("connect", onConnection);
  wsClient.on("connectFailed", onConnectionFailed);
  wsClient.on("close", onClose);
  var svrUrl = env.get("TEST_SERVER");
  log.info("Start to connect server: ", svrUrl);
  wsClient.connect("ws://" + svrUrl);
  initCb = cb;
}

function onConnection(connection) {
  log.info("Connection made.");
  conn = connection;
  connection.on("ping", onPing);
  connection.on("message", onMessage);
}

function onClose(connection, reason) {
  log.info("Connection is closed due to: ", reason);
}

function onConnectionFailed(err) {
  log.error("Connection failed");
  log.error(err);
}

function onPing(cancel, data) {
  data = data.toString("utf8");
  if (data.length > 0) {
    log.info("Get session id: ", data);
    sessionId = data;
  }
  if (initCb) {
    initCb();
    initCb = null;
  }
}

function onMessage(msg) {
  var data = msg.utf8Data;
  try {
    var obj = JSON.parse(data);
    var reqData = obj.data;
    var msgId = obj.msgId;
    agent.forwardMsg(reqData, function(err, body) {
      if (err) {
        log.error(err);
        //TODO error should be sent back
      } else {
        reply(msgId, body);
      }
    });
  } catch (e) {
    log.error(e);
  }
}

function reply(msgId, data) {
  var msg = {
    msgId: msgId,
    data: data,
    isReply: true
  }
  conn.sendUTF(JSON.stringify(msg));
}
