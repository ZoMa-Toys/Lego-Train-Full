#!/usr/bin/env node
const PoweredUP = require("node-poweredup");
const http = require('http');
const WebSocket = require('ws');
const url = require('url');

function getPort(Folder){
    const fs = require('fs');
    var p = "";
    fs.readdirSync(Folder).forEach(file => {
        if (file.includes("ttyUSB")){
            p = file;
        }
    });
    return Folder + "/" + p;
};

const port = getPort('/dev');

const server = http.createServer();
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
        onReceive(data);
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

// Serial port
var SerialPort = require("serialport");

var serialPort = new SerialPort(port, {
    baudRate: 9600
});

function onReceive(msg)
{
  console.log("ws msg:" + msg);
  serialPort.write(msg);
}

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
    console.log(data);
    let message = {};
    if (data.action == "scan"){
        poweredUP.stop();
        poweredUP.scan(); // Start scanning for Hubs
        // console.log("Scanning for Hubs...");
        message = {
            "Status":"Scanning for Hubs...",
            "Message":"..."
        };
	}
    else if (data.action == "getHubs"){
        message = getHubs();
	}
	else if (data.action == "setPower"){
        const hub = poweredUP.getHubsByName(data.train)[0]; // Get an array of all connected hubs
        // console.log(`hub: ${hub.name}`)
        const motor = hub.getDeviceAtPort(data.MotorPort);
        motor.setPower(data.speed); // Run a motor attached to port A for 2 seconds at maximum speed (100) then stop
        message = {
            "Status":"Setting Speed...",
            "Message":data
        };
        if (data.distance){
            hub.on("distance", (device, { distance }) => {
                // console.log(distance)
                if (distance < data.distance){
                    motor.brake();
                }
            });
        }
        if (data.color){
            hub.on("color", (device, { color }) => {
                if (color == Color[data.color]){
                    motor.brake();
                }
            });
        }
        sleep(data.duration).then(() => {
            motor.brake();
        });
    }
	else if (data.action == "disconnectHub"){
        poweredUP.stop();
        poweredUP.getHubsByName(data.train)[0].disconnect(); // Get an array of all connected hubs
        message = {
            "Status":"Disconnecting Hub...",
            "Message":data.train
        };
    }
	else if (data.action == "disconnectHubs"){
        poweredUP.stop();
        const hubs = poweredUP.getHubs();
        hubs.forEach(async (hub) => {
            hub.disconnect();
        });
    }
	else if (data.action == "stop"){
        poweredUP.stop();
        message = {
            "Status":"Stop scanning...",
            "Message":"..."
        };
    };
    console.log(message);
    return JSON.stringify(message);
}
  
server.listen(8088);
const poweredUP = new PoweredUP.PoweredUP();
 
poweredUP.on("discover", async (hub) => { // Wait to discover hubs
    await hub.connect(); // Connect to hub
    console.log(`Connected to ${hub.name}!`);
});

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
};

function getHubs(){
    const hubs = poweredUP.getHubs();
    var hubs_names =[];
    hubs.forEach(async (hub) => {
        // var hubname = {};
        var d = {};
        d["NAME"]=hub.name;
        hub.getDevices().forEach(async (device) => {
                d[device.typeName]=device.portName;
        });
        // hubname[hub.name] = d;
        hubs_names.push(d);
    });
    const message = {
        "Status":"Connected Hubs:",
        "Message":hubs_names
    };
    return message;
};

const Color ={
    BLACK: 0,
    PINK: 1,
    PURPLE: 2,
    BLUE: 3,
    LIGHT_BLUE: 4,
    CYAN: 5,
    GREEN: 6,
    YELLOW: 7,
    ORANGE: 8,
    RED: 9,
    WHITE: 10,
    NONE: 255
};

poweredUP.scan(); // Start scanning for Hubs
console.log("Scanning for Hubs...");