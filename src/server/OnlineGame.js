let events = require("events");
let uuid = require("uuid");

class Game {
  constructor(p1, p2, boardSize = 8) {
    this.id = uuid.v4();
    this.date = new Date();
    this.cellsById = {};
    this.board = randomBoardMap(boardSize, this.cellsById);
    this.firstPlayer = random(["x", "y"]);
    this.firstCell = random(random(this.board)).id;
    this.turnHistory = [];
    this.$sockets = [];
    this.players = {
      x: {
        axis: "x",
        ...p1
      },
      y: {
        axis: "y",
        ...p2
      }
    };
  }

  newTurn(cellId, secret) {
    if (this.checkTurn(cellId, secret)) {
      this.turnHistory.push(cellId);
      this.$sockets.forEach(socket => socket.$sendJSON({
        event: "new-turn",
        cellId
      }));
    } else {
      // console.log(`Wrong turn!`, cellId);
    }
  }

  addSocket(socket) {
    if (!this.$sockets.includes(socket)) {
      this.$sockets.push(socket);
      socket.on("close", () => {
        this.$sockets.splice(this.$sockets.indexOf(socket), 1);
      });
    }
  }

  checkTurn(id, secret) {
    return (
      secret === this.players[this.currentPlayer].$playerSecret &&
      !this.turnHistory.includes(id) &&
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

module.exports = Game;

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
