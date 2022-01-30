# ZoMa Lego Train project

This is a home project for the kids, playing with lego train.
It was boring to switch the track manually, and after we started the project we could not stop.
 
Now we have a web frontend in VueJS for building tracks and then switching the switches. You can Also control the trains.
The main control part is a NodeJS backend with websocket, this serves the static frontend page too.
On ESP side, for ESP32 there is a platformio project (Arduino based) for physically switching the tracks and also to connect to the PoweredUp HUBs and remote controls. It's using BLE for the lego Hubs and Websocket to connect with other components.
The rest are ESP8266s with RFID readers. They are on the trains and can read cards below the track, so the system will know where the trains are.
It also has some built in safety systems. You can't switch if a train is on the switch. It blocks the entry to a segment if a train is there. If the trains are on the same segment then it will stop them.
 
I deployed the main project on a RaspberryPi4 but it's not a must have. The submodules are documented in their own repo.
 
A big thank you goes for @NilremAlia for sponsoring and supporting the project which was his idea :) and also for the full HW infrastructure and development.





## Prerequisit

First install [Node](https://nodejs.org/en/download/) on the target system.
Then clone the project:
```
git clone --recursive https://github.com/ZoMa-Toys/Lego-Train-Full.git
```

For productive deployment you can use [pm2](https://www.npmjs.com/package/pm2) and then deploy the Webservice.
Please update the **ecosystem.config.js** file before deploying it. (if you reaname the WebSocket int he config you need to replace it in the command below)
```
npm install pm2 -g
cd frontend
npm install
npm run build
cd ../backend
npm install
cd ..
pm2 start WebSocket
```
