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
                    JSON.parse(data);
                } catch (e) {
                    let message = {
                        "notJSON": data.toString()
                    };
                    client.send(JSON.stringify(message));
                    return 0;
                }
                client.send(mainTrain(JSON.parse(data)));

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
        updateSwitchState(data);
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

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}
function changeDirection(str){
    if (str.includes("Turn")){
      return str.replace("Turn","Straight")
    }
    else{
      return str.replace("Straight","Turn")
    }
}

function updateSwitchState(data){
    console.log(data)
    for (id in trackConfig.conf){
        if(trackConfig.conf[id].hasOwnProperty("switch")){
            if (trackConfig.conf[id].switch.index==data.motor){
                trackConfig.conf[id].switch.switched = getKeyByValue(trackConfig.conf[id].switch.pulse,data.pulse);
                trackConfig.conf[id].img.src=changeDirection(trackConfig.conf[id].img.src);
            }
        }
    }



}


var trackConfigDefault = {
    "conf": {
        "1,12": {
            "img": {
                "data": "leftSwitchStraight",
                "src": "leftSwitchStraight.png",
                "transform": "rotate(180deg)",
                "width": 100,
                "height":100,
                "id": "leftSwitchStraight - address:1,12"
            },
            "bgcolor": "#dae2db",
            "neighbours": {
                "i": "1,14",
                "t": "2,11",
                "s": "1,11"
            },
            "switch": {
                "index": 9,
                "type": "left",
                "pulse": {
                    "Straight": 280,
                    "Turn": 380
                },
                "switched": "Straight",
                "printed": "Printed"
            }
        },
        "3,9": {
            "img": {
                "data": "leftSwitchStraight",
                "src": "leftSwitchStraight.png",
                "transform": "rotate(0deg)",
                "width": 100,
                "height":100,
                "id": "leftSwitchStraight - address:3,9"
            },
            "bgcolor": "#dae2db",
            "neighbours": {
                "t": "3,11",
                "s": "4,11",
                "i": "4,8"
            },
            "switch": {
                "index": 10,
                "type": "left",
                "pulse": {
                    "Straight": 280,
                    "Turn": 380
                },
                "switched": "Straight",
                "printed": "Printed"
            }
        },
        "1,9": {
            "img": {
                "data": "rightSwitchStraight",
                "src": "rightSwitchStraight.png",
                "transform": "rotate(180deg)",
                "width": 100,
                "height":100,
                "id": "rightSwitchStraight - address:1,9"
            },
            "bgcolor": "#dae2db",
            "neighbours": {
                "s": "1,11",
                "t": "2,11",
                "i": "1,8"
            },
            "switch": {
                "index": 11,
                "type": "right",
                "pulse": {
                    "Straight": 380,
                    "Turn": 280
                },
                "switched": "Straight",
                "printed": "Printed"
            }
        },
        "3,12": {
            "img": {
                "data": "rightSwitchStraight",
                "src": "rightSwitchStraight.png",
                "transform": "rotate(0deg)",
                "width": 100,
                "height":100,
                "id": "rightSwitchStraight - address:3,12"
            },
            "bgcolor": "#dae2db",
            "neighbours": {
                "i": "4,14",
                "s": "4,11",
                "t": "3,11"
            },
            "switch": {
                "index": 12,
                "type": "right",
                "pulse": {
                    "Straight": 380,
                    "Turn": 280
                },
                "switched": "Straight",
                "printed": "Printed"
            }
        },
        "1,3": {
            "img": {
                "data": "leftSwitchStraight",
                "src": "leftSwitchStraight.png",
                "transform": "rotate(180deg)",
                "width": 100,
                "height":100,
                "id": "leftSwitchStraight - address:1,3"
            },
            "bgcolor": "#2dd741",
            "neighbours": {
                "i": "1,5",
                "t": "2,2",
                "s": "1,2"
            },
            "switch": {
                "index": 13,
                "type": "left",
                "pulse": {
                    "Straight": 240,
                    "Turn": 420
                },
                "switched": "Straight",
                "printed": "Original"
            }
        },
        "0,6": {
            "img": {
                "data": "leftSwitchStraight",
                "src": "leftSwitchStraight.png",
                "transform": "rotate(180deg)",
                "width": 100,
                "height":100,
                "id": "leftSwitchStraight - address:0,6"
            },
            "bgcolor": "#a22525",
            "neighbours": {
                "i": "0,8",
                "t": "1,5",
                "s": "0,5"
            },
            "switch": {
                "index": 14,
                "type": "left",
                "pulse": {
                    "Straight": 240,
                    "Turn": 420
                },
                "switched": "Straight",
                "printed": "Original"
            }
        },
        "3,3": {
            "img": {
                "data": "rightSwitchStraight",
                "src": "rightSwitchStraight.png",
                "transform": "rotate(0deg)",
                "width": 100,
                "height":100,
                "id": "rightSwitchStraight - address:3,3"
            },
            "bgcolor": "#ff0000",
            "neighbours": {
                "i": "4,5",
                "s": "4,2",
                "t": "3,2"
            },
            "switch": {
                "index": 15,
                "type": "right",
                "pulse": {
                    "Straight": 420,
                    "Turn": 240
                },
                "switched": "Straight",
                "printed": "Original"
            }
        },
        "4,6": {
            "img": {
                "data": "rightSwitchStraight",
                "src": "rightSwitchStraight.png",
                "transform": "rotate(0deg)",
                "width": 100,
                "height":100,
                "id": "rightSwitchStraight - address:4,6"
            },
            "bgcolor": "#0011ff",
            "neighbours": {
                "i": "5,8",
                "s": "5,5",
                "t": "4,5"
            },
            "switch": {
                "index": 16,
                "type": "right",
                "pulse": {
                    "Straight": 420,
                    "Turn": 240
                },
                "switched": "Straight",
                "printed": "Original"
            }
        },
        "2,11": {
            "img": {
                "data": "cross",
                "src": "cross.png",
                "transform": "rotate(90deg)",
                "width": 50,
                "height":50,
                "id": "cross - address:2,11"
            },
            "bgcolor": "#bfbfbf",
            "neighbours": {
                "r": "2,12",
                "i": "3,11",
                "l": "2,10"
            }
        },
        "3,11": {
            "img": {
                "data": "cross",
                "src": "cross.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "height":50,
                "id": "cross - address:3,11"
            },
            "bgcolor": "#bfbfbf",
            "neighbours": {
                "i": "2,11",
                "l": "3,12",
                "r": "3,10"
            }
        },
        "4,11": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:4,11"
            },
            "bgcolor": "#bfbfbf",
            "neighbours": {
                "i": "4,12",
                "o": "4,10"
            }
        },
        "1,11": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:1,11"
            },
            "bgcolor": "#bfbfbf",
            "neighbours": {
                "i": "1,12",
                "o": "1,10"
            }
        },
        "5,5": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:5,5"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "i": "5,6",
                "o": "5,4"
            }
        },
        "4,5": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:4,5"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "i": "4,6",
                "o": "4,4"
            }
        },
        "5,4": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:5,4"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "i": "5,5",
                "o": "5,3"
            }
        },
        "5,3": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:5,3"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "i": "5,4",
                "o": "5,2"
            }
        },
        "5,2": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:5,2"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "i": "5,3",
                "o": "5,1"
            }
        },
        "5,1": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:5,1"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "i": "5,2",
                "o": "5,0"
            }
        },
        "0,0": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "height":50,
                "id": "curve - address:0,0"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "i": "0,1",
                "o": "1,0"
            }
        },
        "5,0": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "height":50,
                "id": "curve - address:5,0"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "i": "4,0",
                "o": "5,1"
            }
        },
        "4,0": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(90deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:4,0"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "o": "3,0",
                "i": "5,0"
            }
        },
        "3,0": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(90deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:3,0"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "o": "2,0",
                "i": "4,0"
            }
        },
        "2,0": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(90deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:2,0"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "o": "1,0",
                "i": "3,0"
            }
        },
        "1,0": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(90deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:1,0"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "o": "0,0",
                "i": "2,0"
            }
        },
        "0,1": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:0,1"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "o": "0,2",
                "i": "0,0"
            }
        },
        "0,2": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:0,2"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "o": "0,3",
                "i": "0,1"
            }
        },
        "0,3": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:0,3"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "o": "0,4",
                "i": "0,2"
            }
        },
        "0,4": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:0,4"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "o": "0,5",
                "i": "0,3"
            }
        },
        "0,5": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:0,5"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "o": "0,6",
                "i": "0,4"
            }
        },
        "1,5": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:1,5"
            },
            "bgcolor": "#9eefff",
            "neighbours": {
                "o": "1,6",
                "i": "1,4"
            }
        },
        "4,2": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:4,2"
            },
            "bgcolor": "#ff8080",
            "neighbours": {
                "o": "4,3",
                "i": "4,1"
            }
        },
        "4,1": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "height":50,
                "id": "curve - address:4,1"
            },
            "bgcolor": "#ff8080",
            "neighbours": {
                "i": "3,1",
                "o": "4,2"
            }
        },
        "1,1": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "height":50,
                "id": "curve - address:1,1"
            },
            "bgcolor": "#ff8080",
            "neighbours": {
                "i": "1,2",
                "o": "2,1"
            }
        },
        "1,2": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:1,2"
            },
            "bgcolor": "#ff8080",
            "neighbours": {
                "o": "1,3",
                "i": "1,1"
            }
        },
        "2,1": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:2,1"
            },
            "bgcolor": "#ff8080",
            "neighbours": {
                "i": "1,1",
                "o": "3,1"
            }
        },
        "3,1": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:3,1"
            },
            "bgcolor": "#ff8080",
            "neighbours": {
                "i": "2,1",
                "o": "4,1"
            }
        },
        "2,2": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "height":50,
                "id": "curve - address:2,2"
            },
            "bgcolor": "#e0e0e0",
            "neighbours": {
                "i": "2,3",
                "o": "3,2"
            }
        },
        "3,2": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "height":50,
                "id": "curve - address:3,2"
            },
            "bgcolor": "#e0e0e0",
            "neighbours": {
                "i": "2,2",
                "o": "3,3"
            }
        },
        "0,8": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(90deg)",
                "width": 50,
                "height":50,
                "id": "curve - address:0,8"
            },
            "bgcolor": "#d6ffd1",
            "neighbours": {
                "i": "1,8",
                "o": "0,7"
            }
        },
        "1,8": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "height":50,
                "id": "curve - address:1,8"
            },
            "bgcolor": "#d6ffd1",
            "neighbours": {
                "i": "0,8",
                "o": "1,9"
            }
        },
        "4,8": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(0deg)",
                "width": 50,
                "height":50,
                "id": "curve - address:4,8"
            },
            "bgcolor": "#aeffa3",
            "neighbours": {
                "i": "4,9",
                "o": "5,8"
            }
        },
        "5,8": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "height":50,
                "id": "curve - address:5,8"
            },
            "bgcolor": "#aeffa3",
            "neighbours": {
                "o": "4,8",
                "i": "5,7"
            }
        },
        "4,14": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(180deg)",
                "width": 50,
                "height":50,
                "id": "curve - address:4,14"
            },
            "bgcolor": "#fffcb3",
            "neighbours": {
                "o": "3,14",
                "i": "4,13"
            }
        },
        "3,14": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:3,14"
            },
            "bgcolor": "#fffcb3",
            "neighbours": {
                "i": "2,14",
                "o": "4,14"
            }
        },
        "2,14": {
            "img": {
                "data": "Straight",
                "src": "Straight.png",
                "transform": "rotate(270deg)",
                "width": 50,
                "height":50,
                "id": "Straight - address:2,14"
            },
            "bgcolor": "#fffcb3",
            "neighbours": {
                "i": "1,14",
                "o": "3,14"
            }
        },
        "1,14": {
            "img": {
                "data": "curve",
                "src": "curve.png",
                "transform": "rotate(90deg)",
                "width": 50,
                "height":50,
                "id": "curve - address:1,14"
            },
            "bgcolor": "#fffcb3",
            "neighbours": {
                "i": "2,14",
                "o": "1,13"
            }
        }
    },
    "rows": 6,
    "columns": 15,
    "switchPairs":{
        "1,12": {
            "i": [
                "i",
                "3,12"
            ],
            "s": [
                "s",
                "1,9"
            ],
            "t": [
                "t",
                "1,9"
            ]
        },
        "3,9": {
            "i": [
                "i",
                "4,6"
            ],
            "s": [
                "s",
                "3,12"
            ],
            "t": [
                "t",
                "3,12"
            ]
        },
        "1,9": {
            "i": [
                "i",
                "0,6"
            ],
            "s": [
                "s",
                "1,12"
            ],
            "t": [
                "t",
                "3,9"
            ]
        },
        "3,12": {
            "i": [
                "i",
                "1,12"
            ],
            "s": [
                "s",
                "3,9"
            ],
            "t": [
                "t",
                "3,9"
            ]
        },
        "1,3": {
            "i": [
                "t",
                "0,6"
            ],
            "s": [
                "s",
                "3,3"
            ],
            "t": [
                "t",
                "3,3"
            ]
        },
        "0,6": {
            "i": [
                "i",
                "1,9"
            ],
            "s": [
                "s",
                "4,6"
            ],
            "t": [
                "i",
                "1,3"
            ]
        },
        "3,3": {
            "i": [
                "t",
                "4,6"
            ],
            "s": [
                "s",
                "1,3"
            ],
            "t": [
                "t",
                "1,3"
            ]
        },
        "4,6": {
            "i": [
                "i",
                "3,9"
            ],
            "s": [
                "s",
                "0,6"
            ],
            "t": [
                "i",
                "3,3"
            ]
        }
    }
}
;
var trackConfig = trackConfigDefault;
 