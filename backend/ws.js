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


function broadcastMessage(data){
    WSserver.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        };
    });
}

function CheckInput(data,ws){
    try {
        JSON.parse(data);
    } catch (e) {
        ws.send(JSON.stringify({"notJSON": data.toString()}));
        return 0;
    };
    return 1;
}


WSserver.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        console.log('Received Message: ' + data);
        if (CheckInput(data,ws)){
            let payload = mainTrain(JSON.parse(data))
            broadcastMessage(payload);
        }
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
                "Status":"TrackConfig:",
                "Message": trackConfig
            };
            broadcastMessage(JSON.stringify({"Status":"TrackConfig:","Message": conf4ESP()}));
        }
        else if (data.action == "CardMap"){
            cardMap=data.message;
            message = {
                "Status":"CardMap:",
                "Message": data.message
            };
        }
        else if (data.action == "getCardMap"){
            message = {
                "Status":"CardMap:",
                "Message": cardMap
            };
        }
        else if (data.action == "resetCardMap"){
            cardMap={};
            message = {
                "Status":"CardMap:",
                "Message": cardMap
            };
        }
        else if (data.action == "cardChecked"){
            if (hubs.hasOwnProperty(data.message.train)){
                let thishub = hubs[data.message.train];
                let cardIndex = data.message.cardIndex;
                if (sectionInUse.includes(cardIndex)){
                    for(trainame of Object.keys(hubs)){
                        let hub = hubs[trainame];
                        if (hub != thishub){
                            if (hub.lastCard == trackConfig.cardPairs[cardIndex][1]){
                                thishub.speed=0;
                                hub.speed=0;
                                setPower(thishub);
                                setPower(hub);
                            }
                        }
                    }
                }
                if (trackConfig.cardPairs[cardIndex][1] == thishub.lastCard){
                    thishub.lastCard=-1;
                    modifySectionInUse(cardIndex,false)
                }
                else{
                    switchIfYouCan(cardIndex);
                    modifySectionInUse(cardIndex,true)
                    thishub.lastCard=cardIndex;
                }
                message={"action":"trainOnCard","message":{"train":data.message.train,"cardIndex":cardIndex}}
            }
            else{
                message={"error":"train not found with name " +data.message.train }
            }
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
    else if(data.hasOwnProperty("Status")){
        message = data;
        if (data.Status === 'Connected Hubs:'){
            getTrains(data.Message);
        }
    }
    else{
        message = {
            "UnknownMessage":data
        };
    }
    return JSON.stringify(message);
}
  
server.listen(process.env.API_PORT);

function conf4ESP(){
    var ESPswitchConfig = [];
    for (var id in trackConfig.conf){
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
function changeDirection(current,to){
    if (to.includes("Turn")){
      return current.replace("Straight","Turn")
    }
    else{
      return current.replace("Turn","Straight")
    }
}

function setPower(hub) {
    const payload = {};
    payload["message"] = hub;
    payload["action"]="setPower";
    broadcastMessage(JSON.stringify(payload));
}

function updateSwitchState(data){
    for (id in trackConfig.conf){
        if(trackConfig.conf[id].hasOwnProperty("switch")){
            if (trackConfig.conf[id].switch.index==data.motor){
                trackConfig.conf[id].switch.switched = getKeyByValue(trackConfig.conf[id].switch.pulse,data.pulse);
                trackConfig.conf[id].img[0].src=changeDirection(trackConfig.conf[id].img[0].src,trackConfig.conf[id].switch.switched);
            }
        }
    }
}

function getTrains(Message){
    hubs={};
    trains = Message;
    trains.forEach(train => {
        if ("TRAIN_MOTOR" in train){
            hubs[train.NAME]= {
                speed: 0,
                train: train.NAME,
                MotorPort: train.TRAIN_MOTOR,
                distanceSlow:0,
                colorSlow: 255,
                distance:0,
                color: 255,
                lastCard: -1};
        }
    });
}


function switchIfYouCan(cardID){
    let neighbourSwitchs = trackConfig.cardPairs[cardID];
    neighbourSwitchs.forEach(neighbourSwitch => {
        let sw= trackConfig.conf[neighbourSwitch[2][1]].switch;
        let pulse=-1;
        if (neighbourSwitch[0]="s"){
            pulse = sw.pulse["Turn"]
        }
        else if (neighbourSwitch[0]="t"){
            pulse = sw.pulse["Straight"]
        }
        if(pulse!=-1){
            const printed = sw.printed=="Original"?false:true;
            const payload = JSON.stringify({"action":"swtichMotor","message":{ motor: sw.index, pulse: pulse, printed }});
            broadcastMessage(payload);
        }
    });
}

function modifySectionInUse(cardIndex,add){
    trackConfig.cardPairs[cardIndex].forEach(pair => {
        let cardPairIndex = pair[1];
        if (add){
            sectionInUse.push(cardIndex);
            sectionInUse.push(cardPairIndex);
        }
        else{
            let index = sectionInUse.indexOf(cardIndex);
            if (index > -1) {
                sectionInUse.splice(index, 1);
            }
            index = sectionInUse.indexOf(cardPairIndex);
            if (index > -1) {
                sectionInUse.splice(index, 1);
            }
        }
    });
}
    

let hubs = {};
let trains = {};
let sectionInUse = [];
let cardMap = {};
let trackConfigDefault = 
{
    "conf": {
      "6,0": {
        "img": [
          {
            "data": "leftSwitchStraight",
            "src": "leftSwitchStraight.png",
            "transform": "rotate(90deg)",
            "width": 100,
            "height": 100,
            "bgcolor": "#ba2121",
            "id": "leftSwitchStraight - address:6,0"
          }
        ],
        "neighbours": {
          "i": "5,0",
          "t": "8,1",
          "s": "8,0"
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
        },
        "card_index": {
          "i": 13,
          "s": 14,
          "t": 15
        }
      },
      "2,0": {
        "img": [
          {
            "data": "rightSwitchStraight",
            "src": "rightSwitchStraight.png",
            "transform": "rotate(90deg)",
            "width": 100,
            "height": 100,
            "bgcolor": "#245bff",
            "id": "rightSwitchStraight - address:2,0"
          }
        ],
        "neighbours": {
          "s": "1,0",
          "t": "1,1",
          "i": "4,0"
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
        },
        "card_index": {
          "i": 12,
          "s": 11,
          "t": 10
        }
      },
      "2,11": {
        "img": [
          {
            "data": "leftSwitchStraight",
            "src": "leftSwitchStraight.png",
            "transform": "rotate(270deg)",
            "width": 100,
            "height": 100,
            "bgcolor": "#3aba21",
            "id": "leftSwitchStraight - address:2,11"
          }
        ],
        "neighbours": {
          "t": "1,11",
          "s": "1,12",
          "i": "4,12"
        },
        "switch": {
          "index": 2,
          "type": "left",
          "pulse": {
            "Straight": 240,
            "Turn": 420
          },
          "switched": "Straight",
          "printed": "Original"
        },
        "card_index": {
          "i": 2,
          "s": 0,
          "t": 1
        }
      },
      "6,11": {
        "img": [
          {
            "data": "rightSwitchStraight",
            "src": "rightSwitchStraight.png",
            "transform": "rotate(270deg)",
            "width": 100,
            "height": 100,
            "bgcolor": "#ff2424",
            "id": "rightSwitchStraight - address:6,11"
          }
        ],
        "neighbours": {
          "i": "5,12",
          "s": "8,12",
          "t": "8,11"
        },
        "switch": {
          "index": 3,
          "type": "right",
          "pulse": {
            "Straight": 420,
            "Turn": 240
          },
          "switched": "Straight",
          "printed": "Original"
        },
        "card_index": {
          "i": 3,
          "s": 4,
          "t": 5
        }
      },
      "5,8": {
        "img": [
          {
            "data": "rightSwitchStraight",
            "src": "rightSwitchStraight.png",
            "transform": "rotate(0deg)",
            "width": 100,
            "height": 100,
            "bgcolor": "#cccccc",
            "id": "rightSwitchStraight - address:5,8"
          }
        ],
        "neighbours": {
          "i": "6,10",
          "s": "6,7",
          "t": "5,7"
        },
        "switch": {
          "index": 4,
          "type": "right",
          "pulse": {
            "Straight": 380,
            "Turn": 280
          },
          "switched": "Straight",
          "printed": "Printed"
        },
        "card_index": {
          "i": 7,
          "s": 23,
          "t": 22
        }
      },
      "3,8": {
        "img": [
          {
            "data": "leftSwitchStraight",
            "src": "leftSwitchStraight.png",
            "transform": "rotate(180deg)",
            "width": 100,
            "height": 100,
            "bgcolor": "#cccccc",
            "id": "leftSwitchStraight - address:3,8"
          }
        ],
        "neighbours": {
          "i": "3,10",
          "t": "4,7",
          "s": "3,7"
        },
        "switch": {
          "index": 5,
          "type": "left",
          "pulse": {
            "Straight": 280,
            "Turn": 380
          },
          "switched": "Straight",
          "printed": "Printed"
        },
        "card_index": {
          "i": 6,
          "s": 20,
          "t": 21
        }
      },
      "5,3": {
        "img": [
          {
            "data": "leftSwitchStraight",
            "src": "leftSwitchStraight.png",
            "transform": "rotate(0deg)",
            "width": 100,
            "height": 100,
            "bgcolor": "#cccccc",
            "id": "leftSwitchStraight - address:5,3"
          }
        ],
        "neighbours": {
          "t": "5,5",
          "s": "6,5",
          "i": "6,2"
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
        },
        "card_index": {
          "i": 9,
          "s": 16,
          "t": 17
        }
      },
      "3,3": {
        "img": [
          {
            "data": "rightSwitchStraight",
            "src": "rightSwitchStraight.png",
            "transform": "rotate(180deg)",
            "width": 100,
            "height": 100,
            "bgcolor": "#cccccc",
            "id": "rightSwitchStraight - address:3,3"
          }
        ],
        "neighbours": {
          "s": "3,5",
          "t": "4,5",
          "i": "3,2"
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
        },
        "card_index": {
          "i": 8,
          "s": 19,
          "t": 18
        }
      },
      "3,5": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "",
            "width": 50,
            "height": 50,
            "bgcolor": "#cccccc",
            "id": "Straight - address:3,5"
          },
          {
            "index": 19,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:3,5",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "3,6",
          "o": "3,4"
        }
      },
      "3,6": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "",
            "width": 50,
            "height": 50,
            "bgcolor": "#cccccc",
            "id": "Straight - address:3,6"
          }
        ],
        "neighbours": {
          "i": "3,7",
          "o": "3,5"
        }
      },
      "3,7": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "",
            "width": 50,
            "height": 50,
            "bgcolor": "#cccccc",
            "id": "Straight - address:3,7"
          },
          {
            "index": 20,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:3,7",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "3,8",
          "o": "3,6"
        }
      },
      "6,5": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "",
            "width": 50,
            "height": 50,
            "bgcolor": "#cccccc",
            "id": "Straight - address:6,5"
          },
          {
            "index": 16,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:6,5",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "6,6",
          "o": "6,4"
        }
      },
      "6,6": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "",
            "width": 50,
            "height": 50,
            "bgcolor": "#cccccc",
            "id": "Straight - address:6,6"
          }
        ],
        "neighbours": {
          "i": "6,7",
          "o": "6,5"
        }
      },
      "6,7": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "",
            "width": 50,
            "height": 50,
            "bgcolor": "#cccccc",
            "id": "Straight - address:6,7"
          },
          {
            "index": 23,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:6,7",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "6,8",
          "o": "6,6"
        }
      },
      "4,6": {
        "img": [
          {
            "data": "cross",
            "src": "cross.png",
            "transform": "rotate(90deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#cccccc",
            "id": "cross - address:4,6"
          }
        ],
        "neighbours": {
          "r": "4,7",
          "i": "5,6",
          "l": "4,5"
        }
      },
      "5,6": {
        "img": [
          {
            "data": "cross",
            "src": "cross.png",
            "transform": "rotate(270deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#cccccc",
            "id": "cross - address:5,6"
          }
        ],
        "neighbours": {
          "i": "4,6",
          "l": "5,7",
          "r": "5,5"
        }
      },
      "4,5": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "",
            "width": 50,
            "height": 50,
            "bgcolor": "#cccccc",
            "id": "Straight - address:4,5"
          },
          {
            "index": 18,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:4,5",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "4,6",
          "o": "4,4"
        }
      },
      "5,5": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "",
            "width": 50,
            "height": 50,
            "bgcolor": "#cccccc",
            "id": "Straight - address:5,5"
          },
          {
            "index": 17,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:5,5",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "5,6",
          "o": "5,4"
        }
      },
      "4,7": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "",
            "width": 50,
            "height": 50,
            "bgcolor": "#cccccc",
            "id": "Straight - address:4,7"
          },
          {
            "index": 21,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:4,7",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "4,8",
          "o": "4,6"
        }
      },
      "5,7": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "",
            "width": 50,
            "height": 50,
            "bgcolor": "#cccccc",
            "id": "Straight - address:5,7"
          },
          {
            "index": 22,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:5,7",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "5,8",
          "o": "5,6"
        }
      },
      "1,0": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(90deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffd6d6",
            "id": "Straight - address:1,0"
          },
          {
            "index": 11,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:1,0",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "o": "0,0",
          "i": "2,0"
        }
      },
      "0,0": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffd6d6",
            "id": "curve - address:0,0"
          }
        ],
        "neighbours": {
          "i": "0,1",
          "o": "1,0"
        }
      },
      "0,12": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "rotate(90deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffd6d6",
            "id": "curve - address:0,12"
          }
        ],
        "neighbours": {
          "i": "1,12",
          "o": "0,11"
        }
      },
      "0,1": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(180deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffd6d6",
            "id": "Straight - address:0,1"
          }
        ],
        "neighbours": {
          "o": "0,2",
          "i": "0,0"
        }
      },
      "0,2": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(180deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffd6d6",
            "id": "Straight - address:0,2"
          }
        ],
        "neighbours": {
          "o": "0,3",
          "i": "0,1"
        }
      },
      "0,3": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(180deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffd6d6",
            "id": "Straight - address:0,3"
          }
        ],
        "neighbours": {
          "o": "0,4",
          "i": "0,2"
        }
      },
      "0,4": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(180deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffd6d6",
            "id": "Straight - address:0,4"
          }
        ],
        "neighbours": {
          "o": "0,5",
          "i": "0,3"
        }
      },
      "0,5": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(180deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffd6d6",
            "id": "Straight - address:0,5"
          }
        ],
        "neighbours": {
          "o": "0,6",
          "i": "0,4"
        }
      },
      "0,6": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(180deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffd6d6",
            "id": "Straight - address:0,6"
          }
        ],
        "neighbours": {
          "o": "0,7",
          "i": "0,5"
        }
      },
      "0,7": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(180deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffd6d6",
            "id": "Straight - address:0,7"
          }
        ],
        "neighbours": {
          "o": "0,8",
          "i": "0,6"
        }
      },
      "0,8": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(180deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffd6d6",
            "id": "Straight - address:0,8"
          }
        ],
        "neighbours": {
          "o": "0,9",
          "i": "0,7"
        }
      },
      "0,9": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(180deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffd6d6",
            "id": "Straight - address:0,9"
          }
        ],
        "neighbours": {
          "o": "0,10",
          "i": "0,8"
        }
      },
      "0,10": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(180deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffd6d6",
            "id": "Straight - address:0,10"
          }
        ],
        "neighbours": {
          "o": "0,11",
          "i": "0,9"
        }
      },
      "0,11": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(180deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffd6d6",
            "id": "Straight - address:0,11"
          }
        ],
        "neighbours": {
          "o": "0,12",
          "i": "0,10"
        }
      },
      "1,12": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(270deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffd6d6",
            "id": "Straight - address:1,12"
          },
          {
            "index": 0,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:1,12",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "0,12",
          "o": "2,12"
        }
      },
      "1,1": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "rotate(0deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#d7d6ff",
            "id": "curve - address:1,1"
          },
          {
            "index": 10,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:curve - address:1,1",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "1,2",
          "o": "2,1"
        }
      },
      "1,2": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "rotate(90deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#d7d6ff",
            "id": "curve - address:1,2"
          }
        ],
        "neighbours": {
          "i": "2,2",
          "o": "1,1"
        }
      },
      "3,2": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "rotate(270deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#d7d6ff",
            "id": "curve - address:3,2"
          },
          {
            "index": 8,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:curve - address:3,2",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "2,2",
          "o": "3,3"
        }
      },
      "2,2": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(270deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#d7d6ff",
            "id": "Straight - address:2,2"
          }
        ],
        "neighbours": {
          "i": "1,2",
          "o": "3,2"
        }
      },
      "1,11": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "rotate(90deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7d7aff",
            "id": "curve - address:1,11"
          },
          {
            "index": 1,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:curve - address:1,11",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "2,11",
          "o": "1,10"
        }
      },
      "3,10": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "rotate(180deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7d7aff",
            "id": "curve - address:3,10"
          },
          {
            "index": 6,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:curve - address:3,10",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "o": "2,10",
          "i": "3,9"
        }
      },
      "1,10": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "rotate(0deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7d7aff",
            "id": "curve - address:1,10"
          }
        ],
        "neighbours": {
          "i": "1,11",
          "o": "2,10"
        }
      },
      "2,10": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(270deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7d7aff",
            "id": "Straight - address:2,10"
          }
        ],
        "neighbours": {
          "i": "1,10",
          "o": "3,10"
        }
      },
      "4,12": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(270deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7afff6",
            "id": "Straight - address:4,12"
          },
          {
            "index": 2,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:4,12",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "3,12",
          "o": "5,12"
        }
      },
      "5,12": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(270deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7afff6",
            "id": "Straight - address:5,12"
          },
          {
            "index": 3,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:5,12",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "4,12",
          "o": "6,12"
        }
      },
      "9,12": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "rotate(180deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7affa2",
            "id": "curve - address:9,12"
          }
        ],
        "neighbours": {
          "o": "8,12",
          "i": "9,11"
        }
      },
      "8,12": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(270deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7affa2",
            "id": "Straight - address:8,12"
          },
          {
            "index": 4,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:8,12",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "7,12",
          "o": "9,12"
        }
      },
      "8,0": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(270deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7affa2",
            "id": "Straight - address:8,0"
          },
          {
            "index": 14,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:8,0",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "7,0",
          "o": "9,0"
        }
      },
      "9,0": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "rotate(270deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7affa2",
            "id": "curve - address:9,0"
          }
        ],
        "neighbours": {
          "i": "8,0",
          "o": "9,1"
        }
      },
      "9,1": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(0deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7affa2",
            "id": "Straight - address:9,1"
          }
        ],
        "neighbours": {
          "i": "9,2",
          "o": "9,0"
        }
      },
      "9,2": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(0deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7affa2",
            "id": "Straight - address:9,2"
          }
        ],
        "neighbours": {
          "i": "9,3",
          "o": "9,1"
        }
      },
      "9,3": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(0deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7affa2",
            "id": "Straight - address:9,3"
          }
        ],
        "neighbours": {
          "i": "9,4",
          "o": "9,2"
        }
      },
      "9,4": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(0deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7affa2",
            "id": "Straight - address:9,4"
          }
        ],
        "neighbours": {
          "i": "9,5",
          "o": "9,3"
        }
      },
      "9,5": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(0deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7affa2",
            "id": "Straight - address:9,5"
          }
        ],
        "neighbours": {
          "i": "9,6",
          "o": "9,4"
        }
      },
      "9,6": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(0deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7affa2",
            "id": "Straight - address:9,6"
          }
        ],
        "neighbours": {
          "i": "9,7",
          "o": "9,5"
        }
      },
      "9,7": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(0deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7affa2",
            "id": "Straight - address:9,7"
          }
        ],
        "neighbours": {
          "i": "9,8",
          "o": "9,6"
        }
      },
      "9,8": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(0deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7affa2",
            "id": "Straight - address:9,8"
          }
        ],
        "neighbours": {
          "i": "9,9",
          "o": "9,7"
        }
      },
      "9,9": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(0deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7affa2",
            "id": "Straight - address:9,9"
          }
        ],
        "neighbours": {
          "i": "9,10",
          "o": "9,8"
        }
      },
      "9,10": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(0deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7affa2",
            "id": "Straight - address:9,10"
          }
        ],
        "neighbours": {
          "i": "9,11",
          "o": "9,9"
        }
      },
      "9,11": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(0deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#7affa2",
            "id": "Straight - address:9,11"
          }
        ],
        "neighbours": {
          "i": "9,12",
          "o": "9,10"
        }
      },
      "8,10": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "rotate(270deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#e9ff7a",
            "id": "curve - address:8,10"
          }
        ],
        "neighbours": {
          "i": "7,10",
          "o": "8,11"
        }
      },
      "6,10": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "rotate(90deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#e9ff7a",
            "id": "curve - address:6,10"
          },
          {
            "index": 7,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:curve - address:6,10",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "7,10",
          "o": "6,9"
        }
      },
      "8,11": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "rotate(180deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#e9ff7a",
            "id": "curve - address:8,11"
          },
          {
            "index": 5,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:curve - address:8,11",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "o": "7,11",
          "i": "8,10"
        }
      },
      "7,10": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(90deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#e9ff7a",
            "id": "Straight - address:7,10"
          }
        ],
        "neighbours": {
          "o": "6,10",
          "i": "8,10"
        }
      },
      "7,2": {
        "img": [
          {
            "data": "Straight",
            "src": "Straight.png",
            "transform": "rotate(90deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffaf7a",
            "id": "Straight - address:7,2"
          }
        ],
        "neighbours": {
          "o": "6,2",
          "i": "8,2"
        }
      },
      "8,2": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "rotate(180deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffaf7a",
            "id": "curve - address:8,2"
          }
        ],
        "neighbours": {
          "o": "7,2",
          "i": "8,1"
        }
      },
      "8,1": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "rotate(270deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffaf7a",
            "id": "curve - address:8,1"
          },
          {
            "index": 15,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:curve - address:8,1",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "7,1",
          "o": "8,2"
        }
      },
      "6,2": {
        "img": [
          {
            "data": "curve",
            "src": "curve.png",
            "transform": "rotate(0deg)",
            "width": 50,
            "height": 50,
            "bgcolor": "#ffaf7a",
            "id": "curve - address:6,2"
          },
          {
            "index": 9,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:curve - address:6,2",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "i": "6,3",
          "o": "7,2"
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
            "bgcolor": "#ff7a7a",
            "id": "Straight - address:5,0"
          },
          {
            "index": 13,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:5,0",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "o": "4,0",
          "i": "6,0"
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
            "bgcolor": "#ff7a7a",
            "id": "Straight - address:4,0"
          },
          {
            "index": 12,
            "data": "card",
            "src": "card.png",
            "width": 25,
            "height": 25,
            "bgcolor": "#57ff5a",
            "id": "card - address:Straight - address:4,0",
            "position": "absolute",
            "top": "0px",
            "right": "0px"
          }
        ],
        "neighbours": {
          "o": "3,0",
          "i": "5,0"
        }
      }
    },
    "rows": 10,
    "columns": 13,
    "switchPairs": {
      "6,0": {
        "i": [
          [
            "i",
            "2,0"
          ]
        ],
        "s": [
          [
            "s",
            "6,11"
          ]
        ],
        "t": [
          [
            "i",
            "5,3"
          ]
        ]
      },
      "2,0": {
        "i": [
          [
            "i",
            "6,0"
          ]
        ],
        "s": [
          [
            "s",
            "2,11"
          ]
        ],
        "t": [
          [
            "i",
            "3,3"
          ]
        ]
      },
      "2,11": {
        "i": [
          [
            "i",
            "6,11"
          ]
        ],
        "s": [
          [
            "s",
            "2,0"
          ]
        ],
        "t": [
          [
            "i",
            "3,8"
          ]
        ]
      },
      "6,11": {
        "i": [
          [
            "i",
            "2,11"
          ]
        ],
        "s": [
          [
            "s",
            "6,0"
          ]
        ],
        "t": [
          [
            "i",
            "5,8"
          ]
        ]
      },
      "5,8": {
        "i": [
          [
            "t",
            "6,11"
          ]
        ],
        "s": [
          [
            "s",
            "5,3"
          ]
        ],
        "t": [
          [
            "t",
            "3,8"
          ],
          [
            "t",
            "3,3"
          ],
          [
            "t",
            "5,3"
          ]
        ]
      },
      "3,8": {
        "i": [
          [
            "t",
            "2,11"
          ]
        ],
        "s": [
          [
            "s",
            "3,3"
          ]
        ],
        "t": [
          [
            "t",
            "5,8"
          ],
          [
            "t",
            "5,3"
          ],
          [
            "t",
            "3,3"
          ]
        ]
      },
      "5,3": {
        "i": [
          [
            "t",
            "6,0"
          ]
        ],
        "s": [
          [
            "s",
            "5,8"
          ]
        ],
        "t": [
          [
            "t",
            "3,8"
          ],
          [
            "t",
            "3,3"
          ],
          [
            "t",
            "5,8"
          ]
        ]
      },
      "3,3": {
        "i": [
          [
            "t",
            "2,0"
          ]
        ],
        "s": [
          [
            "s",
            "3,8"
          ]
        ],
        "t": [
          [
            "t",
            "3,8"
          ],
          [
            "t",
            "5,8"
          ],
          [
            "t",
            "5,3"
          ]
        ]
      }
    },
    "cardPairs": [
      [
        [
          [
            "s",
            "2,11"
          ],
          11,
          [
            "s",
            "2,0"
          ]
        ]
      ],
      [
        [
          [
            "t",
            "2,11"
          ],
          6,
          [
            "i",
            "3,8"
          ]
        ]
      ],
      [
        [
          [
            "i",
            "2,11"
          ],
          3,
          [
            "i",
            "6,11"
          ]
        ]
      ],
      [
        [
          [
            "i",
            "6,11"
          ],
          2,
          [
            "i",
            "2,11"
          ]
        ]
      ],
      [
        [
          [
            "s",
            "6,11"
          ],
          14,
          [
            "s",
            "6,0"
          ]
        ]
      ],
      [
        [
          [
            "t",
            "6,11"
          ],
          7,
          [
            "i",
            "5,8"
          ]
        ]
      ],
      [
        [
          [
            "i",
            "3,8"
          ],
          1,
          [
            "t",
            "2,11"
          ]
        ]
      ],
      [
        [
          [
            "i",
            "5,8"
          ],
          5,
          [
            "t",
            "6,11"
          ]
        ]
      ],
      [
        [
          [
            "i",
            "3,3"
          ],
          10,
          [
            "t",
            "2,0"
          ]
        ]
      ],
      [
        [
          [
            "i",
            "5,3"
          ],
          15,
          [
            "t",
            "6,0"
          ]
        ]
      ],
      [
        [
          [
            "t",
            "2,0"
          ],
          8,
          [
            "i",
            "3,3"
          ]
        ]
      ],
      [
        [
          [
            "s",
            "2,0"
          ],
          0,
          [
            "s",
            "2,11"
          ]
        ]
      ],
      [
        [
          [
            "i",
            "2,0"
          ],
          13,
          [
            "i",
            "6,0"
          ]
        ]
      ],
      [
        [
          [
            "i",
            "6,0"
          ],
          12,
          [
            "i",
            "2,0"
          ]
        ]
      ],
      [
        [
          [
            "s",
            "6,0"
          ],
          4,
          [
            "s",
            "6,11"
          ]
        ]
      ],
      [
        [
          [
            "t",
            "6,0"
          ],
          9,
          [
            "i",
            "5,3"
          ]
        ]
      ],
      [
        [
          [
            "s",
            "5,3"
          ],
          23,
          [
            "s",
            "5,8"
          ]
        ]
      ],
      [
        [
          [
            "t",
            "5,3"
          ],
          21,
          [
            "t",
            "3,8"
          ]
        ],
        [
          [
            "t",
            "5,3"
          ],
          18,
          [
            "t",
            "3,3"
          ]
        ],
        [
          [
            "t",
            "5,3"
          ],
          22,
          [
            "t",
            "5,8"
          ]
        ]
      ],
      [
        [
          [
            "t",
            "3,3"
          ],
          21,
          [
            "t",
            "3,8"
          ]
        ],
        [
          [
            "t",
            "3,3"
          ],
          22,
          [
            "t",
            "5,8"
          ]
        ],
        [
          [
            "t",
            "3,3"
          ],
          17,
          [
            "t",
            "5,3"
          ]
        ]
      ],
      [
        [
          [
            "s",
            "3,3"
          ],
          20,
          [
            "s",
            "3,8"
          ]
        ]
      ],
      [
        [
          [
            "s",
            "3,8"
          ],
          19,
          [
            "s",
            "3,3"
          ]
        ]
      ],
      [
        [
          [
            "t",
            "3,8"
          ],
          22,
          [
            "t",
            "5,8"
          ]
        ],
        [
          [
            "t",
            "3,8"
          ],
          17,
          [
            "t",
            "5,3"
          ]
        ],
        [
          [
            "t",
            "3,8"
          ],
          18,
          [
            "t",
            "3,3"
          ]
        ]
      ],
      [
        [
          [
            "t",
            "5,8"
          ],
          21,
          [
            "t",
            "3,8"
          ]
        ],
        [
          [
            "t",
            "5,8"
          ],
          18,
          [
            "t",
            "3,3"
          ]
        ],
        [
          [
            "t",
            "5,8"
          ],
          17,
          [
            "t",
            "5,3"
          ]
        ]
      ],
      [
        [
          [
            "s",
            "5,8"
          ],
          16,
          [
            "s",
            "5,3"
          ]
        ]
      ]
    ]
  }
;
var trackConfig = trackConfigDefault;
 