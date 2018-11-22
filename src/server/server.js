#!/usr/bin/node

let http = require("http");
// let https = require("https");
let express = require("express");
let GameServer = require("./GameServer");
let {
  LobbyServer
} = require("./Lobby");
let app = express();
let expressws = require('express-ws');

app.use(express.static(`${__dirname}/www`));
let server = http.createServer(app);
expressws(app, server);
server.listen(80);
console.log(`listening on 80!`);

// let fs = require("fs");
// let servers = https.createServer({
//   key: fs.readFileSync(__dirname + "/ca/privkey.pem"),
//   cert: fs.readFileSync(__dirname + "/ca/fullchain.pem")
// }, app);

// expressws(app, servers);
// servers.listen(443);
// console.log(`listening on 443!`);

let gameServer = new GameServer(app);
let lobbyServer = new LobbyServer(app, gameServer);
