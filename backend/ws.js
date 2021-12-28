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
const wss1 = new WebSocket.Server({ noServer: true });
const wss2 = new WebSocket.Server({ noServer: true });

wss1.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        console.log('Received Message: ' + data);
        wss1.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(data);
            };
        });
    });
});

wss2.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        console.log('Received Message: ' + data);
        wss2.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
            client.send(mainTrain(JSON.parse(data)));
            };
        });
    });
});

server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname;
  
    if (pathname === '/switch') {
        wss1.handleUpgrade(request, socket, head, function done(ws) {
            wss1.emit('connection', ws, request);
        });
    } else if (pathname === '/train') {
        wss2.handleUpgrade(request, socket, head, function done(ws) {
            wss2.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

function mainTrain(data){
    // console.log(data);
    let message = {};
    if (data.action == "getConfig"){
        message = {
            "Status":"SwitchConfig:",
            "Message": switchConfig
        };
    }
	else if (data.action == "getConfigESP"){
        message = {
            "Status":"SwitchConfigESP:",
            "Message": conf4ESP()
        };
    }
	else if (data.action == "setConfig"){
        switchConfig = data.config;
        message = {
            "Status":"Updated",
            "Message": conf4ESP()
        };
    }
    else {
        message = data;
    };
    console.log(message);
    return JSON.stringify(message);
}
  
server.listen(process.env.API_PORT);

function conf4ESP(){
    var ESPswitchConfig = [];
    switchConfig.forEach(sw => {
        var swmin = {
            pulse: sw.pulse,
            switched: sw.switched,
            printed: sw.printed,
        };
        ESPswitchConfig.push(swmin)
    });
    return ESPswitchConfig;
}


var switchConfig = [
        {
          type: "left",
          pulse: { Straight: 240, Turn: 420 },
          switched: "Straight",
          printed: "Original",
          img_style: {
            backgroundColor: "#4CAF50",
            transform: "rotate(0deg)",
            maxWidth: "100%",
            height: "auto",
          },
        },
        {
          type: "right",
          pulse: { Straight: 420, Turn: 240 },
          switched: "Straight",
          printed: "Original",
          img_style: {
            backgroundColor: "#008CBA",
            transform: "rotate(0deg)",
            maxWidth: "100%",
            height: "auto",
          },
        },
        {
          type: "left",
          pulse: { Straight: 240, Turn: 420 },
          switched: "Straight",
          printed: "Original",
          img_style: {
            backgroundColor: "#f44336",
            transform: "rotate(0deg)",
            maxWidth: "100%",
            height: "auto",
          },
        },
        {
          type: "right",
          pulse: { Straight: 420, Turn: 240 },
          switched: "Straight",
          printed: "Original",
          img_style: {
            backgroundColor: "#e7e7e7",
            transform: "rotate(0deg)",
            maxWidth: "100%",
            height: "auto",
          },
        },
        {
          type: "left",
          pulse: { Straight: 280, Turn: 380 },
          switched: "Straight",
          printed: "Printed",
          img_style: {
            backgroundColor: "#FFBF00",
            transform: "rotate(180deg)",
            maxWidth: "100%",
            height: "auto",
          },
        },
        {
          type: "right",
          pulse: { Straight: 380, Turn: 280 },
          switched: "Straight",
          printed: "Printed",
          img_style: {
            backgroundColor: "#FFBF00",
            transform: "rotate(180deg)",
            maxWidth: "100%",
            height: "auto",
          },
        },
        {
          type: "right",
          pulse: { Straight: 380, Turn: 280 },
          switched: "Straight",
          printed: "Printed",
          img_style: {
            backgroundColor: "#FFBF00",
            transform: "rotate(0deg)",
            maxWidth: "100%",
            height: "auto",
          },
        },
        {
          type: "left",
          pulse: { Straight: 280, Turn: 380 },
          switched: "Straight",
          printed: "Printed",
          img_style: {
            backgroundColor: "#FFBF00",
            transform: "rotate(0deg)",
            maxWidth: "100%",
            height: "auto",
          },
        },
      ];
 
