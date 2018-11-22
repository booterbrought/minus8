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

let port = 8081;
//let ports = 443;

app.use(express.static(`${__dirname}/www`));
let server = http.createServer(app);
expressws(app, server);
server.listen(port);
console.log(`listening on ${port}!`);

// let fs = require("fs");
// let servers = https.createServer({
//   key: fs.readFileSync(__dirname + "/ca/privkey.pem"),
//   cert: fs.readFileSync(__dirname + "/ca/fullchain.pem")
// }, app);

// expressws(app, servers);
// server.listen(ports);
// console.log(`listening on ${ports}!`);

let gameServer = new GameServer(app);
let lobbyServer = new LobbyServer(app, gameServer);
