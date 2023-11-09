"use strict";

var AppProcess = function () {
  var peers_connection = [];
  var peers_connection_ids = [];
  var remote_vid_stream = [];
  var remote_aud_stream = [];
  var serverProcess;
  var local_div;
  var audio;
  var isAudioMute = true;
  var rtp_aud_senders = [];
  var video_states = {
    None: 0,
    Camera: 1,
    ScreenShare: 2
  };
  var video_st = video_states.None;
  var videoCamTrack;

  function _init(SDP_function, my_connid) {
    return regeneratorRuntime.async(function _init$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            serverProcess = SDP_function;
            my_connection_id = my_connid;
            eventProcess();
            local_div = document.getElementById("locaVideoPlayer");

          case 4:
          case "end":
            return _context.stop();
        }
      }
    });
  }

  function eventProcess() {
    $("#miceMuteUnmute").on("click", function _callee() {
      return regeneratorRuntime.async(function _callee$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (audio) {
                _context2.next = 3;
                break;
              }

              _context2.next = 3;
              return regeneratorRuntime.awrap(loadAudio());

            case 3:
              if (audio) {
                _context2.next = 6;
                break;
              }

              alert("Audio do not granted");
              return _context2.abrupt("return");

            case 6:
              if (isAudioMute) {
                audio.enable = true;
                $(this).html("<span class='material-icons'>mic</span>");
                updateMediaSenders(audio, rtp_aud_senders);
              } else {
                audio.enable = false;
                $(this).html("<span class='material-icons'>mic-off</span>");
                removeMediaSenders(rtp_aud_senders);
              }

              isAudioMute = !isAudioMute;

            case 8:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    });
    $("#cameraOnOff").on("click", function _callee2() {
      return regeneratorRuntime.async(function _callee2$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!(video_st == video_states.Camera)) {
                _context3.next = 5;
                break;
              }

              _context3.next = 3;
              return regeneratorRuntime.awrap(videoProcess(video_states.None));

            case 3:
              _context3.next = 7;
              break;

            case 5:
              _context3.next = 7;
              return regeneratorRuntime.awrap(videoProcess(video_states.Camera));

            case 7:
            case "end":
              return _context3.stop();
          }
        }
      });
    });
    $("#screenshareOnOff").on("click", function _callee3() {
      return regeneratorRuntime.async(function _callee3$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (!(video_st == video_states.ScreenShare)) {
                _context4.next = 5;
                break;
              }

              _context4.next = 3;
              return regeneratorRuntime.awrap(videoProcess(video_states.None));

            case 3:
              _context4.next = 7;
              break;

            case 5:
              _context4.next = 7;
              return regeneratorRuntime.awrap(videoProcess(video_states.ScreenShare));

            case 7:
            case "end":
              return _context4.stop();
          }
        }
      });
    });
  }

  function videoProcess(newVideoState) {
    var vstream;
    return regeneratorRuntime.async(function videoProcess$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            vstream = null;

            if (!(newVideoState == video_states.Camera)) {
              _context5.next = 8;
              break;
            }

            _context5.next = 5;
            return regeneratorRuntime.awrap(navigator.mediaDevices.getUserMedia({
              video: {
                width: 1920,
                height: 1080
              },
              audio: false
            }));

          case 5:
            vstream = _context5.sent;
            _context5.next = 12;
            break;

          case 8:
            if (!(newVideoState == video_states.ScreenShare)) {
              _context5.next = 12;
              break;
            }

            _context5.next = 11;
            return regeneratorRuntime.awrap(navigator.mediaDevices.getDisplayMedia({
              video: {
                width: 1920,
                height: 1080
              },
              audio: false
            }));

          case 11:
            vstream = _context5.sent;

          case 12:
            if (vstream && vstream.getVideoTracks().length > 0) {
              videoCamTrack = vstream.getVideoTracks()[0];

              if (videoCamTrack) {
                local_div.srcObject = new MediaStream([videoCamTrack]);
              }
            }

            _context5.next = 19;
            break;

          case 15:
            _context5.prev = 15;
            _context5.t0 = _context5["catch"](0);
            console.log(_context5.t0);
            return _context5.abrupt("return");

          case 19:
            video_st = newVideoState;

          case 20:
          case "end":
            return _context5.stop();
        }
      }
    }, null, null, [[0, 15]]);
  }

  var iceConfiguration = {
    "iceServers": [{
      "url": "stun:stun.1.google.com:19302"
    }, {
      "url": "stun:stun.1.google.com:19302"
    }]
  };

  function setConnection(connid) {
    var connection;
    return regeneratorRuntime.async(function setConnection$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            connection = new RTCPeerConnection(iceConfiguration);

            connection.onnegotiationneeded = function _callee4(event) {
              return regeneratorRuntime.async(function _callee4$(_context6) {
                while (1) {
                  switch (_context6.prev = _context6.next) {
                    case 0:
                      _context6.next = 2;
                      return regeneratorRuntime.awrap(setOffer(connid));

                    case 2:
                    case "end":
                      return _context6.stop();
                  }
                }
              });
            };

            connection.onicecandidate = function (event) {
              if (event.candidate) {
                serverProcess(JSON.stringify({
                  icecandidate: event.candidate
                }), connid);
              }
            };

            connection.ontrack = function (event) {
              if (!remote_vid_stream[connid]) {
                remote_vid_stream[connid] = new MediaStream();
              }

              if (!remote_aud_stream[connid]) {
                remote_aud_stream[connid] = new MediaStream();
              }

              if (event.track.kind == "video") {
                remote_vid_stream[connid].getVideoTracks().forEach(function (t) {
                  return remote_vid_stream[connid].removeTrack(t);
                });
                remote_vid_stream[connid].addTrack(event.track);
                var remoteVideoPlayer = document.getElementById("v_" + connid);
                remoteVideoPlayer.srcObject = null;
                remoteVideoPlayer.srcObject = remote_vid_stream[connid];
                remoteVideoPlayer.load();
              } else if (event.track.kind == "audio") {
                remote_aud_stream[connid].getAudioTracks().forEach(function (t) {
                  return remote_aud_stream[connid].removeTrack(t);
                });
                remote_aud_stream[connid].addTrack(event.track);
                var remoteAudioPlayer = document.getElementById("a_" + connid);
                remoteAudioPlayer.srcObject = null;
                remoteAudioPlayer.srcObject = remote_aud_stream[connid];
                remoteAudioPlayer.load();
              }
            };

            peers_connection_ids[connid] = connid;
            peers_connection[connid] = connection;
            return _context7.abrupt("return", connection);

          case 8:
          case "end":
            return _context7.stop();
        }
      }
    });
  }

  function setOffer(connid) {
    var connection, offer;
    return regeneratorRuntime.async(function setOffer$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            connection = peers_connection[connid];
            _context8.next = 3;
            return regeneratorRuntime.awrap(connection.createOffer());

          case 3:
            offer = _context8.sent;
            _context8.next = 6;
            return regeneratorRuntime.awrap(connection.setLocalDescription(offer));

          case 6:
            serverProcess(JSON.stringify({
              offer: connection.LocalDescription
            }), connid);

          case 7:
          case "end":
            return _context8.stop();
        }
      }
    });
  }

  function SDPProcess(message, from_connid) {
    var answer;
    return regeneratorRuntime.async(function SDPProcess$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            console.log("SDPProcess is called");
            message = JSON.parse("message");

            if (!message.answer) {
              _context9.next = 7;
              break;
            }

            _context9.next = 5;
            return regeneratorRuntime.awrap(peers_connection[from_connid].setRemoteDescription(new RTCSessionDescription(message.answer)));

          case 5:
            _context9.next = 33;
            break;

          case 7:
            if (!message.offer) {
              _context9.next = 21;
              break;
            }

            if (peers_connection[from_connid]) {
              _context9.next = 11;
              break;
            }

            _context9.next = 11;
            return regeneratorRuntime.awrap(setConnection(from_connid));

          case 11:
            _context9.next = 13;
            return regeneratorRuntime.awrap(peers_connection[from_connid].setRemoteDescription(new RTCSessionDescription(message.offer)));

          case 13:
            _context9.next = 15;
            return regeneratorRuntime.awrap(peers_connection[from_connid].createAnswer());

          case 15:
            answer = _context9.sent;
            _context9.next = 18;
            return regeneratorRuntime.awrap(peers_connection[from_connid].setLocalDescription(answer));

          case 18:
            serverProcess(JSON.stringify({
              answer: answer
            }), from_connid);
            _context9.next = 33;
            break;

          case 21:
            if (!message.icecandidate) {
              _context9.next = 33;
              break;
            }

            if (peers_connection[from_connid]) {
              _context9.next = 25;
              break;
            }

            _context9.next = 25;
            return regeneratorRuntime.awrap(setConnection(from_connid));

          case 25:
            _context9.prev = 25;
            _context9.next = 28;
            return regeneratorRuntime.awrap(peers_connection[from_connid].addIceCandidate(message.icecandidate));

          case 28:
            _context9.next = 33;
            break;

          case 30:
            _context9.prev = 30;
            _context9.t0 = _context9["catch"](25);
            console.log(_context9.t0);

          case 33:
          case "end":
            return _context9.stop();
        }
      }
    }, null, null, [[25, 30]]);
  }

  return {
    setNewConnection: function setNewConnection(connid) {
      return regeneratorRuntime.async(function setNewConnection$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return regeneratorRuntime.awrap(setConnection(connid));

            case 2:
            case "end":
              return _context10.stop();
          }
        }
      });
    },
    processClientFunc: function processClientFunc(message, from_connid) {
      return regeneratorRuntime.async(function processClientFunc$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return regeneratorRuntime.awrap(SDPProcess(message, from_connid));

            case 2:
            case "end":
              return _context11.stop();
          }
        }
      });
    },
    init: function init(SDP_function, my_connid) {
      return regeneratorRuntime.async(function init$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return regeneratorRuntime.awrap(_init(SDP_function, my_connid));

            case 2:
            case "end":
              return _context12.stop();
          }
        }
      });
    }
  };
}();

var MyApp = function () {
  var socket = null;
  var user_id = "";
  var meeting_id = "";

  function init(uid, mid) {
    user_id = uid;
    meeting_id = mid;
    $("#meetingContainer").show();
    $("#me h2").text(user_id + "(ME)");
    document.title = user_id;
    event_process_for_signling_server();
  }

  function event_process_for_signling_server() {
    socket = io.connect();

    var SDP_function = function SDP_function(data, to_connid) {
      socket.emit("SDPProcess", {
        message: data,
        to_connid: to_connid
      });
    };

    AppProcess.init(SDP_function, socket.id);
    socket.on("connect", function () {
      if (socket.connected) {
        if (user_id != "" && meeting_id != "") {
          socket.emit("userconnect", {
            displayName: user_id,
            meeting_id: meeting_id
          });
        }
      }
    });
    socket.on("inform_others_about_me", function (data) {
      addUser(data.other_user_id, data.connId);
      AppProcess.setNewConnection(data.connId);
    });
    socket.on("imform_me_about_other_user", function (other_users) {
      if (other_users) {
        for (var i = 0; i < other_users.length; i++) {
          addUser(other_users[i].userId, other_users[i].connectionId);
          AppProcess.setNewConnection(other_users[i].connectionId);
        }
      }
    });
    socket.on("SDPProcess", function _callee5(data) {
      return regeneratorRuntime.async(function _callee5$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return regeneratorRuntime.awrap(AppProcess.processClientFunc(data.message, data.from_connid));

            case 2:
            case "end":
              return _context13.stop();
          }
        }
      });
    });
  }

  function addUser(other_user_id, connId) {
    var newDivId = $("#otherTemplate").clone();
    newDivId = newDivId.attr("id", connId).addClass("other");
    newDivId.find("h2").text(other_user_id);
    newDivId.find("video").attr("id", "v_" + connId);
    newDivId.find("audio").attr("id", "a_" + connId);
    newDivId.show();
    $("#divUsers").append(newDivId);
  }

  return {
    _init: function _init(uid, mid) {
      init(uid, mid);
    }
  };
}();