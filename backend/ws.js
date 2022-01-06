#!/usr/bin/env node

process.chdir(__dirname);
var static = require('node-static');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');

var file = new(static.Server)("./static");

const server = http.createServer(function (req, res) {
    file.serve(req, res);
  })
/* const wss1 = new WebSocket.Server({ noServer: true }); */
const WSserver = new WebSocket.Server({ noServer: true });


WSserver.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        console.log('Received Message: ' + data);
        WSserver.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(mainTrain(JSON.parse(data)));
                } catch (e) {
                    let message = {
                        "UnknownMessage": data.toString()
                    };
                        client.send(JSON.stringify(message));
                    }
            };
        });
    });
});

server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname;
  
    if (pathname === '/ws') {
        WSserver.handleUpgrade(request, socket, head, function done(ws) {
            WSserver.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

function mainTrain(data){
    // console.log(data);
    let message = {};
    if(data.hasOwnProperty("action")){
        if (data.action == "getConfig"){
            message = {
                "Status":"TrackConfig:",
                "Message": trackConfig
            };
        }
        else if (data.action == "getDefaultConfig"){
            message = {
                "Status":"TrackConfig:",
                "Message": trackConfigDefault
            };
        }
        else if (data.action == "getConfigESP"){
            message = {
                "Status":"SwitchConfigESP:",
                "Message": conf4ESP()
            };
        }
        else if (data.action == "setConfig"){
            trackConfig = data.config;
            message = {
                "Status":"Updated",
                "Message": conf4ESP()
            };
        }
        else if (data.action == "swtichMotor"){
            message = data.message;
        }
        else {
            message = data;
        };
    }
    else if(data.hasOwnProperty("motor")){
        message = {
            "Status":"swtiched",
            "Message": data
        };
    }
    else{
        message = {
            "UnknownMessage":data
        };
    }
    console.log(message);
    return JSON.stringify(message);
}
  
server.listen(process.env.API_PORT);

function conf4ESP(){
    var ESPswitchConfig = [];
    for (var id in trackConfig.conf){
        console.log(id,trackConfig.conf[id])
        if ("switch" in trackConfig.conf[id]){
            sw = trackConfig.conf[id].switch;
            var swmin = {
                pulse: sw.pulse,
                switched: sw.switched,
                printed: sw.printed,
            };
            ESPswitchConfig.push(swmin)
        }
    }
    return ESPswitchConfig;
}


var trackConfigDefault = {
    "rows":14,
    "columns":6,
	"conf": {
        "0,5": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(90deg)",
                "width": 50,
                "id": "curve - address:0,5"
            },
            "bgcolor": "#d6ffec"
        },
        "0,0": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "id": "curve - address:0,0"
            },
            "bgcolor": "#d6ffec"
        },
        "0,1": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "id": "Straight - address:0,1"
            },
            "bgcolor": "#d6ffec"
        },
        "0,2": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "id": "Straight - address:0,2"
            },
            "bgcolor": "#d6ffec"
        },
        "0,3": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "id": "Straight - address:0,3"
            },
            "bgcolor": "#d6ffec"
        },
        "0,4": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "id": "Straight - address:0,4"
            },
            "bgcolor": "#d6ffec"
        },
        "1,0": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "id": "Straight - address:1,0"
            },
            "bgcolor": "#d6ffec"
        },
        "1,5": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "id": "Straight - address:1,5"
            },
            "bgcolor": "#d6ffec"
        },
        "2,5": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "id": "Straight - address:2,5"
            },
            "bgcolor": "#d6ffec"
        },
        "2,0": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "id": "Straight - address:2,0"
            },
            "bgcolor": "#d6ffec"
        },
        "3,0": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "id": "Straight - address:3,0"
            },
            "bgcolor": "#d6ffec"
        },
        "3,5": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "id": "Straight - address:3,5"
            },
            "bgcolor": "#d6ffec"
        },
        "4,5": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "id": "Straight - address:4,5"
            },
            "bgcolor": "#d6ffec"
        },
        "4,0": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "id": "Straight - address:4,0"
            },
            "bgcolor": "#d6ffec"
        },
        "1,1": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "id": "curve - address:1,1"
            },
            "bgcolor": "#ffb3b3"
        },
        "2,1": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "id": "Straight - address:2,1"
            },
            "bgcolor": "#ffb3b3"
        },
        "2,4": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "id": "Straight - address:2,4"
            },
            "bgcolor": "#ffb3b3"
        },
        "1,4": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(90deg)",
                "width": 50,
                "id": "curve - address:1,4"
            },
            "bgcolor": "#ffb3b3"
        },
        "1,2": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "id": "Straight - address:1,2"
            },
            "bgcolor": "#ffb3b3"
        },
        "1,3": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "id": "Straight - address:1,3"
            },
            "bgcolor": "#ffb3b3"
        },
        "2,3": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(90deg)",
                "width": 50,
                "id": "curve - address:2,3"
            },
            "bgcolor": "#d6d6d6"
        },
        "2,2": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "id": "curve - address:2,2"
            },
            "bgcolor": "#d6d6d6"
        },
        "3,1": {
            "img": {
                "data": "rightSwitchStraight",
                "src": "rightSwitchStraight.png",
                "transform": "rotate(90deg)",
                "width": 100,
                "id": "rightSwitchStraight - address:3,1"
            },
            "bgcolor": "#ff4242",
            "switch": {
                "index": 0,
                "type": "right",
                "pulse": {
                    "Straight": 420,
                    "Turn": 240
                },
                "switched": "Straight",
                "printed": "Original"
            }
        },
        "3,3": {
            "img": {
                "data": "leftSwitchStraight",
                "src": "leftSwitchStraight.png",
                "transform": "rotate(270deg)",
                "width": 100,
                "id": "leftSwitchStraight - address:3,3"
            },
            "bgcolor": "#7bff42",
            "switch": {
                "index": 1,
                "type": "left",
                "pulse": {
                    "Straight": 240,
                    "Turn": 420
                },
                "switched": "Straight",
                "printed": "Original"
            }
        },
        "5,0": {
            "img": {
                "data": "rightSwitchStraight",
                "src": "rightSwitchStraight.png",
                "transform": "rotate(90deg)",
                "width": 100,
                "id": "rightSwitchStraight - address:5,0"
            },
            "bgcolor": "#4262ff",
            "switch": {
                "index": 2,
                "type": "right",
                "pulse": {
                    "Straight": 420,
                    "Turn": 240
                },
                "switched": "Straight",
                "printed": "Original"
            }
        },
        "5,4": {
            "img": {
                "data": "leftSwitchStraight",
                "src": "leftSwitchStraight.png",
                "transform": "rotate(270deg)",
                "width": 100,
                "id": "leftSwitchStraight - address:5,4"
            },
            "bgcolor": "#ab2626",
            "switch": {
                "index": 3,
                "type": "left",
                "pulse": {
                    "Straight": 240,
                    "Turn": 420
                },
                "switched": "Straight",
                "printed": "Original"
            }
        },
        "7,0": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "id": "curve - address:7,0"
            },
            "bgcolor": "#ab2686"
        },
        "7,1": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(90deg)",
                "width": 50,
                "id": "curve - address:7,1"
            },
            "bgcolor": "#ab2686"
        },
        "7,5": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "id": "curve - address:7,5"
            },
            "bgcolor": "#26ab8c"
        },
        "7,4": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "id": "curve - address:7,4"
            },
            "bgcolor": "#26ab8c"
        },
        "8,1": {
            "img": {
                "data": "leftSwitchStraight",
                "src": "leftSwitchStraight.png",
                "transform": "rotate(90deg)",
                "width": 100,
                "id": "leftSwitchStraight - address:8,1"
            },
            "bgcolor": "#e8e8e8",
            "switch": {
                "index": 4,
                "type": "left",
                "pulse": {
                    "Straight": 280,
                    "Turn": 380
                },
                "switched": "Straight",
                "printed": "Printed"
            }
        },
        "8,3": {
            "img": {
                "data": "rightSwitchStraight",
                "src": "rightSwitchStraight.png",
                "transform": "rotate(270deg)",
                "width": 100,
                "id": "rightSwitchStraight - address:8,3"
            },
            "bgcolor": "#e8e8e8",
            "switch": {
                "index": 5,
                "type": "right",
                "pulse": {
                    "Straight": 380,
                    "Turn": 280
                },
                "switched": "Straight",
                "printed": "Printed"
            }
        },
        "10,1": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(90deg)",
                "width": 50,
                "id": "Straight - address:10,1"
            },
            "bgcolor": "#e8e8e8"
        },
        "10,4": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(90deg)",
                "width": 50,
                "id": "Straight - address:10,4"
            },
            "bgcolor": "#e8e8e8"
        },
        "10,2": {
            "img": {
                "data": "cross",
                "src": "cross.png",
                "transform": "",
                "width": 50,
                "id": "cross - address:10,2"
            },
            "bgcolor": "#e8e8e8"
        },
        "10,3": {
            "img": {
                "data": "cross",
                "src": "cross.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "id": "cross - address:10,3"
            },
            "bgcolor": "#e8e8e8"
        },
        "11,3": {
            "img": {
                "data": "leftSwitchStraight",
                "src": "leftSwitchStraight.png",
                "transform": "rotate(270deg)",
                "width": 100,
                "id": "leftSwitchStraight - address:11,3"
            },
            "bgcolor": "#e8e8e8",
            "switch": {
                "index": 6,
                "type": "left",
                "pulse": {
                    "Straight": 280,
                    "Turn": 380
                },
                "switched": "Straight",
                "printed": "Printed"
            }
        },
        "11,1": {
            "img": {
                "data": "rightSwitchStraight",
                "src": "rightSwitchStraight.png",
                "transform": "rotate(90deg)",
                "width": 100,
                "id": "rightSwitchStraight - address:11,1"
            },
            "bgcolor": "#e8e8e8",
            "switch": {
                "index": 7,
                "type": "right",
                "pulse": {
                    "Straight": 380,
                    "Turn": 280
                },
                "switched": "Straight",
                "printed": "Printed"
            }
        },
        "13,4": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "id": "curve - address:13,4"
            },
            "bgcolor": "#fde26d"
        },
        "13,1": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "id": "curve - address:13,1"
            },
            "bgcolor": "#fde26d"
        },
        "13,2": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "id": "Straight - address:13,2"
            },
            "bgcolor": "#fde26d"
        },
        "13,3": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "id": "Straight - address:13,3"
            },
            "bgcolor": "#fde26d"
        }
    }
};
var trackConfig = trackConfigDefault;
 