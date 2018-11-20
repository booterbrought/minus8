let uuid = require("uuid");

function random(val) {
  if (Number.isInteger(val)) {
    return Math.floor(Math.random() * val);
  }
  return val[random(val.length)];
}

function randomBoardMap(boardSize, cellsById) {
  let map = [];
  for (let y = 0; y < boardSize; y++) {
    map.push([]);
    for (let x = 0; x < boardSize; x++) {
      let cell = {
        id: "x" + x + "y" + y,
        x,
        y,
        value: randomCellValue(boardSize)
      };
      map[y].push(cell);
      cellsById[cell.id] = cell;
    }
  }
  return map;
}

function randomCellValue(max) {
  return random(max * 2) - max + 1 || -max;
}

module.exports = class {
  constructor(players, boardSize = 8) {
    if (Number.isInteger(boardSize)) {
      this.id = uuid.v4();
      this.date = new Date();
      this.cellsById = {};
      this.board = randomBoardMap(boardSize, this.cellsById);
      this.firstPlayer = random(["x", "y"]);
      this.firstCell = random(random(this.board)).id;
      this.turnHistory = [];
      this.players = {
        x: {
          axis: "x",
          playerId: players[0].playerId,
          name: players[0].name,
          $playerSecret: players[0].$playerSecret,
          $socket: "",
          score: 0
        },
        y: {
          axis: "y",
          playerId: players[1].playerId,
          name: players[1].name,
          $playerSecret: players[1].$playerSecret,
          $socket: "",
          score: 0
        }
      };
    }
  }

  newTurn(cellId, secret) {
    if (this.checkTurn(cellId, secret)) {
      this.turnHistory.push(cellId);
      let msg = {
        event: "new-turn",
        cellId: cellId
      };

      if (this.players.x.$socket) this.players.x.$socket.$sendJSON(msg);
      if (this.players.y.$socket) this.players.y.$socket.$sendJSON(msg);
    } else {
      console.log(`Wrong turn!`, cellId);
    }
  }

  setPlayerSocket(data, socket) {
    ["x", "y"].forEach(axis => {
      if (this.players[axis].playerId === data.playerId) {
        this.players[axis].$socket = socket;
        console.log(
          `${this.players[axis].name} (${
            this.players[axis].playerId
          }) entered game.`
        );
      }
    });
  }

  checkTurn(id, secret) {
    return (
      secret === this.players[this.currentPlayer].$playerSecret &&
      this.turnHistory.indexOf(id) < 0 &&
      this.lastCell[this.otherPlayer] === this.cellsById[id][this.otherPlayer]
    );
  }

  get currentPlayer() {
    return this.turnHistory.length % 2 ? this.secondPlayer : this.firstPlayer;
  }

  get otherPlayer() {
    return this.currentPlayer === "x" ? "y" : "x";
  }

  get lastCell() {
    return (
      this.cellsById[this.turnHistory[this.turnHistory.length - 1]] ||
      this.cellsById[this.firstCell]
    );
  }

  get lastPlayer() {
    return this.players[
      this.turnHistory.length % 2 ? this.secondPlayer : this.firstPlayer
    ];
  }

  get secondPlayer() {
    return this.firstPlayer === "x" ? "y" : "x";
  }
};
