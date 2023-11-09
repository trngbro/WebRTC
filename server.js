const express = require("express");
const path = require("path");
var app = express();
var server = app.listen(3000, function(){
    console.log("Listen on port 3000");
});

const io = require("socket.io")(server, {
    allowEI03: true,
});
app.use(express.static(path.join(__dirname, "")));

var userConnections = [];

io.on("connection", (socket) => {
    console.log("Socket id is: " + socket.id);

    socket.on("userconnect", (data) => {
        console.log(data.displayName, data.meeting_id);

        var other_users = userConnections.filter((p) => p.meeting_id == data.meeting_id)

        userConnections.push({
            connectionId: socket.id,
            userId: data.displayName,
            meeting_id: data.meeting_id
        })

        other_users.forEach((v) => {
            socket.to(v.connectionId).emit("inform_others_about_me", {
                other_user_id: data.displayName,
                connId: socket.id
            })
        })

        socket.emit("imform_me_about_other_user", other_users);
    })

    socket.on("SDPProcess", (data) => {
        socket.to(data.to_connid).emit("SDPProcess", {
            message: data.message,
            from_connid: socket.id
        })
    })

    socket.on("disconnect", function(){
        console.log("Disconnected");
        var divUser = userConnections.find((p) => p.connectionId == socket.id);
        if(divUser){
            var meetingId = divUser.meeting_id;
            userConnections = userConnections.filter((p) => p.connectionId != socket.id);
            var list = userConnections.filter((p) => p.meeting_id == meetingId);
            list.forEach((v) => {
                socket.to(v.connectionId).emit("inform_about_connection_end", {connId: socket.id});
            })
        }

    })
})

