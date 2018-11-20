#!/usr/bin/node

let http = require("http");
let express = require("express");
let bodyParser = require("body-parser");
let ecstatic = require("ecstatic");
let Game = require("./OnlineGame");

let app = express();

app.use(bodyParser.json());
app.use(express.static(`${__dirname}/www`));

let server = http.createServer(
  // {
  //   key: fs.readFileSync(__dirname + "/ca/privkey.pem"),
  //   cert: fs.readFileSync(__dirname + "/ca/fullchain.pem")
  // },
  app
);

let expressWs = require('express-ws')(app, server);
server.listen(80);
console.log(`listening on 80!`);

let gameList = {};
let lobby = [];

app.ws("/server", handler);
app.post("/server/game", function (req, res) {
  let game = gameList[req.body.gameId];
  if (game) {
    let s = JSON.stringify(game, (key, value) => {
      if (!key.startsWith("$")) return value;
    });
    res.send(200, s);
  } else res.send(404, "Game not found.");
});

function handler(ws) {
  let player = {};
  ws.$sendJSON = data => {
    if (ws.readyState === ws.OPEN)
      ws.send(
        JSON.stringify(data, (key, value) => {
          if (!key.startsWith("$")) return value;
        })
      );
  };

  ws.on("message", function (message) {
    data = JSON.parse(message);

    switch (data.event) {
      case "new-turn":
        gameList[data.gameId].newTurn(data.cellId, data.playerSecret);
        break;
      case "game-enter":
        gameList[data.gameId].setPlayerSocket(data, ws);
        break;
      case "lobby-enter":
        player = {
          gameStarted: false,
          declinedOpps: [],
          playerId: data.playerId,
          $playerSecret: data.playerSecret,
          name: data.playerName,
          $socket: ws
        };
        enterLobby(player);
        break;

      case "accept":
        if (player.pairedOpp.pairAccepted) {
          createGame(player.pairedOpp, player);
        } else {
          player.pairAccepted = true;
        }
        break;

      case "decline":
        player.declinedOpps.push(player.pairedOpp.playerId);
        enterLobby(player.pairedOpp);
        enterLobby(player);
        break;

      default:
        break;
    }
  });

  ws.on("close", () => {
    if (!player.gameStarted && player.pairedOpp) enterLobby(player.pairedOpp);
    leaveLobby(player);
    leaveGame(player);
  });
}

function createGame(...players) {
  console.log(
    `Creating new game for ${players[0].name} and ${players[1].name}.`
  );
  let game = new Game(players);
  gameList[game.id] = game;
  players.forEach(player => {
    player.gameStarted = true;
    player.$socket.$sendJSON({
      event: "game-created",
      gameId: game.id
    });
  });
}

function enterLobby(player) {
  player.pairAccepted = false;
  player.pairedOpp = "";
  if (!findPair(player)) {
    lobby.push(player);
    player.$socket.$sendJSON({
      event: "in-lobby",
      count: lobby.length
    });
    console.log(`${player.name} (${player.playerId}) entered lobby.`);
  }
}

function leaveGame(player) {}

function leaveLobby(player) {
  let i = lobby.findIndex(_player => _player.playerId === player.playerId);
  if (i > -1) {
    lobby.splice(i, 1);
    console.log(`${player.name} (${player.playerId}) left lobby.`);
  }
}

function findPair(player) {
  let opp = lobby.find(_pl => {
    return (
      player.declinedOpps.indexOf(_pl.playerId) < 0 &&
      _pl.declinedOpps.indexOf(player.playerId) < 0
    );
  });
  if (opp) {
    pairPlayers(opp, player);
    return true;
  }
}

function pairPlayers(...players) {
  players.forEach((player, i) => {
    leaveLobby(player);
    let opp = players[1 - i];
    player.pairedOpp = opp;
    opp.pairedOpp = player;
    player.$socket.$sendJSON({
      event: "opponent-found",
      oppId: opp.playerId,
      oppName: opp.name
    });
  });
}
