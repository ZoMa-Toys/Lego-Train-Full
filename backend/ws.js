#!/usr/bin/env node

const functions = require("./wsFunctions");

functions.DefultConfig(false);
functions.startServer(process.env.API_PORT);
