"use strict";

var express = require("express");

var path = require("path");

var app = express();
var server = app.listen(3000, function () {
  console.log("Listen on port 3000");
});

var io = require("socket.io")(server, {
  allowEI03: true
});

app.use(express["static"](path.join(__dirname, "")));
var userConnections = [];
io.on("connection", function (socket) {
  console.log("Socket id is: " + socket.id);
  socket.on("userconnect", function (data) {
    console.log(data.displayName, data.meeting_id);
    var other_users = userConnections.filter(function (p) {
      return p.meeting_id == data.meeting_id;
    });
    userConnections.push({
      connectionId: socket.id,
      userId: data.displayName,
      meeting_id: data.meeting_id
    });
    other_users.forEach(function (v) {
      socket.to(v.connectionId).emit("inform_others_about_me", {
        other_user_id: data.displayName,
        connId: socket.id
      });
    });
    socket.emit("imform_me_about_other_user", other_users);
  });
  socket.on("SDPProcess", function (data) {
    socket.to(data.to_connid).emit("SDPProcess", {
      message: data.message,
      from_connid: socket.id
    });
  });
  socket.on("disconnect", function () {
    console.log("Disconnected");
    var divUser = userConnections.find(function (p) {
      return p.connectionId == socket.id;
    });

    if (divUser) {
      var meetingId = divUser.meeting_id;
      userConnections = userConnections.filter(function (p) {
        return p.connectionId != socket.id;
      });
      var list = userConnections.filter(function (p) {
        return p.meeting_id == meetingId;
      });
      list.forEach(function (v) {
        socket.to(v.connectionId).emit("inform_about_connection_end", {
          connId: socket.id
        });
      });
    }
  });
});