# ZoMa Lego Train projcet

This is a home project for the kids, playing with lego train.

I deployed the main project on a RaspberryPi4 but it's not a must have. The submodules are documented in there own repo.


## Prerequisit

First install [Node](https://nodejs.org/en/download/) on the target system.
Then clone the project:
```
git clone https://github.com/GuBee33/ZoMa-Lego-Train.git
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
