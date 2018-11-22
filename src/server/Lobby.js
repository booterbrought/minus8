let $sendJSON = require("./sendJSON");

class LobbyServer {
  constructor(app, gameServer) {
    this.gameServer = gameServer;
    this.waitingPlayers = [];
    app.ws("/lobby", ws => {
      ws.$sendJSON = $sendJSON;

      ws.on("message", message => {
        let data = JSON.parse(message);

        switch (data.event) {
          case "lobby-enter":
            let player = new Player({
                playerId: data.playerId,
                playerName: data.playerName,
                $playerSecret: data.playerSecret
              },
              ws
            );
            this.enterLobby(player);
            ws.on("close", () => {
              this.leaveLobby(player);
            });
            break;
          case "accept":
            ws.emit("accept");
            break;
          case "decline":
            ws.emit("decline");
            break;
          default:
            break;
        }
      });
    });
  }

  enterLobby(player) {
    player.$ws.emit("in-lobby", this);
    if (!this.waitingPlayers.includes(player) && !this.findPair(player)) {
      this.waitingPlayers.push(player);
      console.log(`${player.playerName} (${player.playerId}) entered lobby.`);
    }
  }

  leaveLobby(player) {
    let i = this.waitingPlayers.findIndex(
      _pl => _pl.playerId === player.playerId
    );
    if (i > -1) {
      this.waitingPlayers.splice(i, 1);
      console.log(`${player.playerName} (${player.playerId}) left lobby.`);
    }
  }

  findPair(p1) {
    let p2 = this.waitingPlayers.find(
      p2 =>
      !p1.$declinedOpps.includes(p2.playerId) &&
      !p2.$declinedOpps.includes(p1.playerId)
    );
    if (p2) {
      p1.$ws.emit("opponent-found", p2, this);
      p2.$ws.emit("opponent-found", p1, this);
      this.leaveLobby(p2);
      return true;
    }
  }
}

class Player {
  constructor(creds, ws) {
    Object.assign(this, {
      $ws: ws,
      ...creds,
      $gameStarted: false,
      $pairAccepted: false,
      $declinedOpps: [],
    });

    ws.on("in-lobby", lobby => {
      this.$pairAccepted = false;
      ws.$sendJSON({
        event: "in-lobby"
      });
    });

    ws.on("opponent-found", (opp, lobby) => {
      ws.$sendJSON({
        event: "opponent-found",
        oppId: opp.playerId,
        oppName: opp.playerName
      });

      let cancelListener = () => {
        opp.$ws.emit("opp-decline");
      };
      let oppDeclineListener = () => {
        ws.removeListener("close", cancelListener);
        lobby.enterLobby(this);
      };
      let declineListener = () => {
        ws.removeListener("close", cancelListener);
        this.$declinedOpps.push(opp.playerId);
        lobby.enterLobby(this);
        opp.$ws.emit("opp-decline");
      };
      let acceptListener = () => {
        ws.removeListener("close", cancelListener);
        if (opp.$pairAccepted) {
          lobby.gameServer.createGame(opp, this);
        } else {
          this.$pairAccepted = true;
        }
      };

      [
        "opp-decline",
        "decline",
        "accept",
      ].forEach(listenerName => {
        ws.removeAllListeners(listenerName);
      });

      ws.on("close", cancelListener);
      ws.once("opp-decline", oppDeclineListener);
      ws.once("decline", declineListener);
      ws.once("accept", acceptListener);
    });

    ws.on("game-created", gameId => {
      this.$gameStarted = true;
      ws.$sendJSON({
        event: "game-created",
        gameId
      });
    });
  }
}

module.exports = {
  LobbyServer,
  Player
};
