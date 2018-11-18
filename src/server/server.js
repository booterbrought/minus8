let http = require("http");
let express = require("express");
let uuid = require("uuid");
let md5 = require("md5");
let port = 8081;

let WebSocketServer = require("ws").Server;
let app = express();
let server = http.createServer(app);

wsserver = new WebSocketServer({
  server,
  path: "/server"
});
server.listen(port);

console.log(`listening on ${port}!`);

let games = [];
let lobby = [];

app.get("/server/games/new", function (req, res) {
  game = new Game();
  games.push(game);
  res.send(game.id);
});

wsserver.on("connection", function (ws) {
  let player = {};
  ws.sendJSON = data => {
    ws.send(
      JSON.stringify(data)
    );
  };

  ws.on("message", function (message) {
    data = JSON.parse(message);
    // console.log(data);

    switch (data.event) {
      case "lobby-enter":
        player = {
          uid: data.uid,
          authToken: data.authToken,
          name: data.playerName,
          socket: ws,
        };
        enterLobby(player);
        break;
      case "accept":
        if (player.opp.pairAccepted) {
          startGame(player.opp, player);
        } else {
          player.pairAccepted = true;
        }
        break;
      case "decline":

        break;
      case "getGameData":
        let game = games.find(game => game.id === data.id);
        ws.sendJSON({
          event: "game-data",
          gameData: game
        });
        break;
      default:
        break;
    }
  });

  ws.on("close", () => {
    lobby.splice(lobby.findIndex(_player => _player.uid === player.uid), 1);
    console.log(`${player.name} (${player.uid}) has disconnected.`);
  });
});

class Game {
  constructor(players, boardSize = 8) {
    if (Number.isInteger(boardSize)) {
      this.id = uuid.v4();
      this.date = new Date();
      this.lastTurn = this.date;
      this.board = randomBoardMap(boardSize);
      this.startingPoint = random(random(this.board)).id;
      this.firstPlayer = random(["x", "y"]);
      this.turnHistory = [];
      this.players = players.map(player => player.uid);
    } else if (boardSize instanceof Object) {
      o = boardSize;
      this.id = o.id;
      this.date = o.date;
      this.lastTurn = o.lastTurn;
      this.board = o.board;
      this.startingPoint = o.startingPoint;
      this.firstPlayer = o.firstPlayer;
      this.turnHistory = o.turnHistory;
      this.players = players;
    }
  }

  get lastPlayer() {
    return this.turnHistory.length % 2 ? this.secondPlayer : this.firstPlayer;
  }

  get secondPlayer() {
    return this.firstPlayer === "x" ? "y" : "x";
  }
}

async function startGame(...players) {
  console.log(`Starting new game for ${players[0].name} and ${players[1].name}.`);
  let game = new Game(players);
  games.push(game);
  players.forEach(player => {
    player.socket.sendJSON({
      event: "game-started",
      gameId: game.id
    });
  });
}

async function enterLobby(player) {
  console.log(`${player.name} (${player.uid}) has connected.`);
  if (lobby.length) {
    pairPlayers(player, lobby.pop());
  } else {
    lobby.push(player);
    player.socket.sendJSON({
      event: "in-lobby",
      count: lobby.length
    });
  }
}

async function pairPlayers(...players) {
  players.forEach((player, i) => {
    let opp = players[1 - i];
    player.opp = opp;
    opp.opp = player;
    player.socket.sendJSON({
      event: "opponent-found",
      oppId: opp.uid,
      oppName: opp.name
    });
  });
}

function random(val) {
  if (Number.isInteger(val)) {
    return Math.floor(Math.random() * val);
  }
  return val[random(val.length)];
}

function randomBoardMap(boardSize) {
  let map = [];
  for (let y = 0; y < boardSize; y++) {
    map.push([]);
    for (let x = 0; x < boardSize; x++) {
      let cell = {
        id: "x" + x + "y" + y,
        value: randomCellValue(boardSize)
      };
      map[y].push(cell);
    }
  }
  return map;
}

function randomCellValue(max) {
  return random(max * 2) - max + 1 || -max;
}
