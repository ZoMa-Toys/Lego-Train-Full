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
/*         else if (data.action == "swtichMotor"){
            message = data.message;
        } */
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
        "1,1": {
            "img": [
                {
                    "data": "leftSwitchStraight",
                    "src": "leftSwitchStraight.png",
                    "transform": "rotate(90deg)",
                    "width": 100,
                    "height": 100,
                    "bgcolor": "#f5001d",
                    "id": "leftSwitchStraight - address:1,1"
                }
            ],
            "neighbours": {
                "i": "0,1",
                "t": "3,2",
                "s": "3,1"
            },
            "switch": {
                "index": 0,
                "type": "left",
                "pulse": {
                    "Straight": 240,
                    "Turn": 420
                },
                "switched": "Straight",
                "printed": "Original"
            }
        },
        "1,3": {
            "img": [
                {
                    "data": "rightSwitchStraight",
                    "src": "rightSwitchStraight.png",
                    "transform": "rotate(270deg)",
                    "width": 100,
                    "height": 100,
                    "bgcolor": "#1d29d3",
                    "id": "rightSwitchStraight - address:1,3"
                }
            ],
            "neighbours": {
                "i": "0,4",
                "s": "3,4",
                "t": "3,3"
            },
            "switch": {
                "index": 1,
                "type": "right",
                "pulse": {
                    "Straight": 420,
                    "Turn": 240
                },
                "switched": "Straight",
                "printed": "Original"
            }
        },
        "5,1": {
            "img": [
                {
                    "data": "leftSwitchStraight",
                    "src": "leftSwitchStraight.png",
                    "transform": "rotate(90deg)",
                    "width": 100,
                    "height": 100,
                    "bgcolor": "#a1a2a5",
                    "id": "leftSwitchStraight - address:5,1"
                }
            ],
            "neighbours": {
                "i": "4,1",
                "t": "7,2",
                "s": "7,1"
            },
            "switch": {
                "index": 2,
                "type": "left",
                "pulse": {
                    "Straight": 280,
                    "Turn": 380
                },
                "switched": "Straight",
                "printed": "Printed"
            }
        },
        "5,3": {
            "img": [
                {
                    "data": "rightSwitchStraight",
                    "src": "rightSwitchStraight.png",
                    "transform": "rotate(270deg)",
                    "width": 100,
                    "height": 100,
                    "bgcolor": "#a1a2a5",
                    "id": "rightSwitchStraight - address:5,3"
                }
            ],
            "neighbours": {
                "i": "4,4",
                "s": "7,4",
                "t": "7,3"
            },
            "switch": {
                "index": 3,
                "type": "right",
                "pulse": {
                    "Straight": 380,
                    "Turn": 280
                },
                "switched": "Straight",
                "printed": "Printed"
            }
        },
        "8,3": {
            "img": [
                {
                    "data": "leftSwitchStraight",
                    "src": "leftSwitchStraight.png",
                    "transform": "rotate(270deg)",
                    "width": 100,
                    "height": 100,
                    "bgcolor": "#a1a2a5",
                    "id": "leftSwitchStraight - address:8,3"
                }
            ],
            "neighbours": {
                "t": "7,3",
                "s": "7,4",
                "i": "10,4"
            },
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
        "8,1": {
            "img": [
                {
                    "data": "rightSwitchStraight",
                    "src": "rightSwitchStraight.png",
                    "transform": "rotate(90deg)",
                    "width": 100,
                    "height": 100,
                    "bgcolor": "#a1a2a5",
                    "id": "rightSwitchStraight - address:8,1"
                }
            ],
            "neighbours": {
                "s": "7,1",
                "t": "7,2",
                "i": "10,1"
            },
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
        "12,3": {
            "img": [
                {
                    "data": "leftSwitchStraight",
                    "src": "leftSwitchStraight.png",
                    "transform": "rotate(270deg)",
                    "width": 100,
                    "height": 100,
                    "bgcolor": "#c91818",
                    "id": "leftSwitchStraight - address:12,3"
                }
            ],
            "neighbours": {
                "t": "11,3",
                "s": "11,4",
                "i": "14,4"
            },
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
        "12,1": {
            "img": [
                {
                    "data": "rightSwitchStraight",
                    "src": "rightSwitchStraight.png",
                    "transform": "rotate(90deg)",
                    "width": 100,
                    "height": 100,
                    "bgcolor": "#18c964",
                    "id": "rightSwitchStraight - address:12,1"
                }
            ],
            "neighbours": {
                "s": "11,1",
                "t": "11,2",
                "i": "14,1"
            },
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
        "0,1": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(0deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#77e4a6",
                    "id": "curve - address:0,1"
                },
                {
                    "index": 0,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:curve - address:0,1",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "i": "0,2",
                "o": "1,1"
            }
        },
        "0,4": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#77e4a6",
                    "id": "curve - address:0,4"
                },
                {
                    "index": 1,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:curve - address:0,4",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "i": "1,4",
                "o": "0,3"
            }
        },
        "0,2": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#77e4a6",
                    "id": "Straight - address:0,2"
                }
            ],
            "neighbours": {
                "i": "0,3",
                "o": "0,1"
            }
        },
        "0,3": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#77e4a6",
                    "id": "Straight - address:0,3"
                }
            ],
            "neighbours": {
                "i": "0,4",
                "o": "0,2"
            }
        },
        "3,1": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(180deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#7792e4",
                    "id": "curve - address:3,1"
                },
                {
                    "index": 2,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:curve - address:3,1",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "o": "2,1",
                "i": "3,0"
            }
        },
        "3,0": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(0deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#7792e4",
                    "id": "curve - address:3,0"
                }
            ],
            "neighbours": {
                "i": "3,1",
                "o": "4,0"
            }
        },
        "4,0": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#7792e4",
                    "id": "Straight - address:4,0"
                }
            ],
            "neighbours": {
                "o": "3,0",
                "i": "5,0"
            }
        },
        "5,0": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#7792e4",
                    "id": "Straight - address:5,0"
                }
            ],
            "neighbours": {
                "o": "4,0",
                "i": "6,0"
            }
        },
        "6,0": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#7792e4",
                    "id": "Straight - address:6,0"
                }
            ],
            "neighbours": {
                "o": "5,0",
                "i": "7,0"
            }
        },
        "7,0": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#7792e4",
                    "id": "Straight - address:7,0"
                }
            ],
            "neighbours": {
                "o": "6,0",
                "i": "8,0"
            }
        },
        "8,0": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#7792e4",
                    "id": "Straight - address:8,0"
                }
            ],
            "neighbours": {
                "o": "7,0",
                "i": "9,0"
            }
        },
        "9,0": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#7792e4",
                    "id": "Straight - address:9,0"
                }
            ],
            "neighbours": {
                "o": "8,0",
                "i": "10,0"
            }
        },
        "10,0": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#7792e4",
                    "id": "Straight - address:10,0"
                }
            ],
            "neighbours": {
                "o": "9,0",
                "i": "11,0"
            }
        },
        "11,1": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#7792e4",
                    "id": "curve - address:11,1"
                },
                {
                    "index": 10,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:curve - address:11,1",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "i": "12,1",
                "o": "11,0"
            }
        },
        "11,0": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(270deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#7792e4",
                    "id": "curve - address:11,0"
                }
            ],
            "neighbours": {
                "i": "10,0",
                "o": "11,1"
            }
        },
        "3,4": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(270deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#e477a2",
                    "id": "curve - address:3,4"
                },
                {
                    "index": 5,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:curve - address:3,4",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "i": "2,4",
                "o": "3,5"
            }
        },
        "11,4": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(0deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#e477a2",
                    "id": "curve - address:11,4"
                },
                {
                    "index": 13,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:curve - address:11,4",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "i": "11,5",
                "o": "12,4"
            }
        },
        "3,5": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#e477a2",
                    "id": "curve - address:3,5"
                }
            ],
            "neighbours": {
                "i": "4,5",
                "o": "3,4"
            }
        },
        "11,5": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(180deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#e477a2",
                    "id": "curve - address:11,5"
                }
            ],
            "neighbours": {
                "o": "10,5",
                "i": "11,4"
            }
        },
        "4,5": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#e477a2",
                    "id": "Straight - address:4,5"
                }
            ],
            "neighbours": {
                "o": "3,5",
                "i": "5,5"
            }
        },
        "5,5": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#e477a2",
                    "id": "Straight - address:5,5"
                }
            ],
            "neighbours": {
                "o": "4,5",
                "i": "6,5"
            }
        },
        "6,5": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#e477a2",
                    "id": "Straight - address:6,5"
                }
            ],
            "neighbours": {
                "o": "5,5",
                "i": "7,5"
            }
        },
        "7,5": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#e477a2",
                    "id": "Straight - address:7,5"
                }
            ],
            "neighbours": {
                "o": "6,5",
                "i": "8,5"
            }
        },
        "8,5": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#e477a2",
                    "id": "Straight - address:8,5"
                }
            ],
            "neighbours": {
                "o": "7,5",
                "i": "9,5"
            }
        },
        "9,5": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#e477a2",
                    "id": "Straight - address:9,5"
                }
            ],
            "neighbours": {
                "o": "8,5",
                "i": "10,5"
            }
        },
        "10,5": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#e477a2",
                    "id": "Straight - address:10,5"
                }
            ],
            "neighbours": {
                "o": "9,5",
                "i": "11,5"
            }
        },
        "7,2": {
            "img": [
                {
                    "data": "cross",
                    "src": "cross.png",
                    "transform": "rotate(0deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#a1a2a5",
                    "id": "cross - address:7,2"
                }
            ],
            "neighbours": {
                "l": "6,2",
                "r": "8,2",
                "i": "7,1"
            }
        },
        "7,3": {
            "img": [
                {
                    "data": "cross",
                    "src": "cross.png",
                    "transform": "rotate(180deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#a1a2a5",
                    "id": "cross - address:7,3"
                }
            ],
            "neighbours": {
                "l": "6,3",
                "r": "8,3",
                "i": "7,2"
            }
        },
        "7,1": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#a1a2a5",
                    "id": "Straight - address:7,1"
                }
            ],
            "neighbours": {
                "o": "6,1",
                "i": "8,1"
            }
        },
        "7,4": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#a1a2a5",
                    "id": "Straight - address:7,4"
                }
            ],
            "neighbours": {
                "o": "6,4",
                "i": "8,4"
            }
        },
        "14,4": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(180deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#905151",
                    "id": "curve - address:14,4"
                },
                {
                    "index": 15,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:curve - address:14,4",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "o": "13,4",
                "i": "14,3"
            }
        },
        "14,3": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(180deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#905151",
                    "id": "Straight - address:14,3"
                }
            ],
            "neighbours": {
                "o": "14,4",
                "i": "14,2"
            }
        },
        "14,2": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(180deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#905151",
                    "id": "Straight - address:14,2"
                }
            ],
            "neighbours": {
                "o": "14,3",
                "i": "14,1"
            }
        },
        "14,1": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(270deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#905151",
                    "id": "curve - address:14,1"
                },
                {
                    "index": 14,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:curve - address:14,1",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "i": "13,1",
                "o": "14,2"
            }
        },
        "4,1": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(0deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#518890",
                    "id": "curve - address:4,1"
                },
                {
                    "index": 6,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:curve - address:4,1",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "i": "4,2",
                "o": "5,1"
            }
        },
        "4,2": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(180deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#518890",
                    "id": "curve - address:4,2"
                }
            ],
            "neighbours": {
                "o": "3,2",
                "i": "4,1"
            }
        },
        "3,2": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(270deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#518890",
                    "id": "Straight - address:3,2"
                },
                {
                    "index": 3,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:Straight - address:3,2",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "i": "2,2",
                "o": "4,2"
            }
        },
        "4,3": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(270deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#c0d671",
                    "id": "curve - address:4,3"
                }
            ],
            "neighbours": {
                "i": "3,3",
                "o": "4,4"
            }
        },
        "4,4": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#c0d671",
                    "id": "curve - address:4,4"
                },
                {
                    "index": 7,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:curve - address:4,4",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "i": "5,4",
                "o": "4,3"
            }
        },
        "3,3": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(270deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#c0d671",
                    "id": "Straight - address:3,3"
                },
                {
                    "index": 4,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:Straight - address:3,3",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "i": "2,3",
                "o": "4,3"
            }
        },
        "11,2": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(270deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#71d6ca",
                    "id": "Straight - address:11,2"
                },
                {
                    "index": 11,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:Straight - address:11,2",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "i": "10,2",
                "o": "12,2"
            }
        },
        "10,2": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(90deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#71d6ca",
                    "id": "curve - address:10,2"
                }
            ],
            "neighbours": {
                "i": "11,2",
                "o": "10,1"
            }
        },
        "10,1": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(270deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#71d6ca",
                    "id": "curve - address:10,1"
                },
                {
                    "index": 8,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:curve - address:10,1",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "i": "9,1",
                "o": "10,2"
            }
        },
        "11,3": {
            "img": [
                {
                    "data": "Straight",
                    "src": "Straight.png",
                    "transform": "rotate(270deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#fd94ff",
                    "id": "Straight - address:11,3"
                },
                {
                    "index": 12,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:Straight - address:11,3",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "i": "10,3",
                "o": "12,3"
            }
        },
        "10,3": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(0deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#fd94ff",
                    "id": "curve - address:10,3"
                }
            ],
            "neighbours": {
                "i": "10,4",
                "o": "11,3"
            }
        },
        "10,4": {
            "img": [
                {
                    "data": "curve",
                    "src": "curve.png",
                    "transform": "rotate(180deg)",
                    "width": 50,
                    "height": 50,
                    "bgcolor": "#fd94ff",
                    "id": "curve - address:10,4"
                },
                {
                    "index": 9,
                    "data": "card",
                    "src": "card.png",
                    "width": 25,
                    "height": 25,
                    "bgcolor": "#fd94ff",
                    "id": "card - address:curve - address:10,4",
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                }
            ],
            "neighbours": {
                "o": "9,4",
                "i": "10,3"
            }
        }
    },
    "rows": 15,
    "columns": 6,
    "switchPairs": {
        "1,1": {
            "i": [
                "i",
                "1,3"
            ],
            "s": [
                "s",
                "12,1"
            ],
            "t": [
                "i",
                "5,1"
            ]
        },
        "1,3": {
            "i": [
                "i",
                "1,1"
            ],
            "s": [
                "s",
                "12,3"
            ],
            "t": [
                "i",
                "5,3"
            ]
        },
        "5,1": {
            "i": [
                "t",
                "1,1"
            ],
            "s": [
                "s",
                "8,1"
            ],
            "t": [
                "s",
                "8,1"
            ]
        },
        "5,3": {
            "i": [
                "t",
                "1,3"
            ],
            "s": [
                "s",
                "8,3"
            ],
            "t": [
                "s",
                "8,1"
            ]
        },
        "8,3": {
            "i": [
                "t",
                "12,3"
            ],
            "s": [
                "s",
                "5,3"
            ],
            "t": [
                "s",
                "8,1"
            ]
        },
        "8,1": {
            "i": [
                "t",
                "12,1"
            ],
            "s": [
                "s",
                "5,1"
            ],
            "t": [
                "s",
                "8,1"
            ]
        },
        "12,3": {
            "i": [
                "i",
                "12,1"
            ],
            "s": [
                "s",
                "1,3"
            ],
            "t": [
                "i",
                "8,3"
            ]
        },
        "12,1": {
            "i": [
                "i",
                "12,3"
            ],
            "s": [
                "s",
                "1,1"
            ],
            "t": [
                "i",
                "8,1"
            ]
        }
    }
}
;
var trackConfig = trackConfigDefault;
 