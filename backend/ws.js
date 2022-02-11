#!/usr/bin/env node

const functions = require("./wsFunctions");

functions.DefultConfig();
functions.startServer(process.env.API_PORT);
