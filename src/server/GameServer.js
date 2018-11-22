let $sendJSON = require("./sendJSON");
let Game = require("./OnlineGame");

class GameServer {
  constructor(app) {
    this.gameList = [];
    app.get("/server/game/:gameId", (req, res) => {
      let game = this.gameList[req.params.gameId];
      if (game) {
        res.status(200).send(
          JSON.stringify(game, (key, value) => {
            if (!key.startsWith("$")) return value;
          })
        );
      } else res.status(404).send("Game not found.");
    });
    app.ws("/server", ws => {
      ws.$sendJSON = $sendJSON;
      ws.on("message", message => {
        let data = JSON.parse(message);
        switch (data.event) {
          case "game-enter":
            if (this.gameList[data.gameId])
              this.gameList[data.gameId].addSocket(ws);
            break;
          case "new-turn":
            if (this.gameList[data.gameId])
              this.gameList[data.gameId].newTurn(
                data.cellId,
                data.playerSecret
              );
            break;

          default:
            break;
        }
      });
    });
  }

  createGame(p1, p2) {
    console.log(`Creating new game for ${p1.playerName} and ${p2.playerName}.`);
    let game = new Game(p1, p2);
    this.gameList[game.id] = game;
    p1.$ws.emit("game-created", game.id);
    p2.$ws.emit("game-created", game.id);
    return game;
  }
}

module.exports = GameServer;
