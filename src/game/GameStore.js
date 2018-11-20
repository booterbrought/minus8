import Vue from "vue";
import Vuex from "Vuex";
import onlineActionsController from "./GameOnlineActions.js";
Vue.use(Vuex);

function otherAxis(axis) {
  return axis === "x" ? "y" : "x";
}

function random(maxVal) {
  if (Number.isInteger(maxVal)) {
    return Math.floor(Math.random() * maxVal);
  }
  return maxVal[random(maxVal.length)];
}

function randomCellValue(maxVal) {
  return random(maxVal * 2) - maxVal + 1 || -maxVal;
}

export default function (settings) {
  return new Vuex.Store({
    state() {
      return {
        boardSize: 8,
        gameId: "",
        playerId: "",
        playerSecret: "",
        gameMode: "",
        gameStarted: false,
        boardMap: [],
        cellsById: {},
        turnHistory: [],
        firstPlayerId: "",
        firstCell: {},
        players: {
          x: {
            axis: "x"
          },
          y: {
            axis: "y"
          }
        },
        playerLeft: false
      };
    },
    actions: {
      makeTurn(context, payload) {
        if (context.state.gameMode !== "online") {
          context.commit("makeTurn", payload.cellId);
        }
      },
      createNewMap(context) {
        context.commit("createNewMap");
      },
      restartGame(context) {
        if (context.state.gameStarted) context.commit("createNewMap");
        context.commit("restart");
      }
    },
    mutations: {
      restart(state) {
        state.gameStarted = true;
        state.firstCell = random(random(state.boardMap));
        state.turnHistory = [];
        state.players.x.score = 0;
        state.players.y.score = 0;
        state.firstPlayerId = random(["x", "y"]);
      },
      disconnect(state) {

      },
      makeTurn(state, cellId) {
        state.turnHistory.push(cellId);
      },
      createNewMap(state) {
        for (let y = 0; y < state.boardSize; y++) {
          Vue.set(state.boardMap, y, []);
          for (let x = 0; x < state.boardSize; x++) {
            let cell = {
              id: "x" + x + "y" + y,
              x,
              y,
              value: randomCellValue(state.boardSize)
            };
            Vue.set(state.boardMap[y], x, cell);
            Vue.set(state.cellsById, cell.id, cell);
          }
        }
      },
      setGameMode(state, payload) {
        state.gameMode = payload.mode;
        state.gameId = payload.id;
        state.playerId = payload.playerId;
        state.playerSecret = payload.playerSecret;
      },
      setPlayer(state, player) {
        state.players[player.axis] = player;
      },
      setBoardSize(state, boardSize) {
        state.boardSize = boardSize;
      }
    },
    getters: {
      activeCells(state, getters) {
        let row = otherAxis(getters.currentPlayer.axis);
        let rowId = row + state.cellsById[getters.lastCellId][row];
        return Object.keys(state.cellsById)
          .filter(
            id =>
            state.gameStarted &&
            id.indexOf(rowId) > -1 &&
            state.turnHistory.indexOf(id) < 0
          )
          .map(id => state.cellsById[id]);
      },
      gameInProgress(state, getters) {
        return state.gameStarted && !getters.gameFinished;
      },
      gameFinished(state, getters) {
        return (
          (state.gameStarted && getters.activeCells.length === 0) ||
          state.playerLeft
        );
      },
      firstPlayer(state) {
        return state.players[state.firstPlayerId];
      },
      secondPlayer(state, getters) {
        return state.players[otherAxis(state.firstPlayerId)];
      },
      currentPlayer(state, getters) {
        return state.gameStarted ?
          state.turnHistory.length % 2 ?
          getters.secondPlayer :
          getters.firstPlayer :
          "";
      },
      lastCellId(state, getters) {
        return state.turnHistory.length ?
          state.turnHistory[state.turnHistory.length - 1] :
          state.firstCell.id;
      },
      winner(state, getters) {
        return getters.gameFinished ?
          getters.firstPlayer.score > getters.secondPlayer.score ?
          getters.firstPlayer :
          getters.secondPlayer :
          "";
      }
    },
    plugins: [onlineActionsController]
  });
}
