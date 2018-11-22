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

export default function(settings) {
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
          context.commit("makeTurn", payload);
        }
      },
      createNewMap(context) {
        context.commit("createNewMap");
      },
      restartGame(context) {
        context.commit("createNewMap");
        context.commit("restart");
      }
    },
    mutations: {
      restart(state) {
        state.gameStarted = true;
        Vue.set(state, "firstCell", random(random(state.boardMap)));
        Vue.set(state, "turnHistory", []);
        Vue.set(state, "firstPlayerId", random(["x", "y"]));
      },
      disconnect(state) {},
      makeTurn(state, cellId) {
        state.turnHistory.push(cellId);
      },
      createNewMap(state) {
        Vue.set(state, "boardMap", []);
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
      scorex(state, getters) {
        let evenness = state.firstPlayerId === "x" ? 1 : 0;
        return state.turnHistory.reduce((sum, turn, i) => {
          return sum + state.cellsById[turn].value * (i % 2 != evenness);
        }, 0);
      },
      scorey(state, getters) {
        let evenness = state.firstPlayerId === "y" ? 1 : 0;
        return state.turnHistory.reduce((sum, turn, i) => {
          return sum + state.cellsById[turn].value * (i % 2 != evenness);
        }, 0);
      },
      activeCells(state, getters) {
        let rowAxis = otherAxis(getters.currentPlayer.axis);
        let rowIndex = state.cellsById[getters.lastCellId][rowAxis];
        return Object.keys(state.cellsById)
          .filter(
            id =>
              state.gameStarted &&
              state.cellsById[id][rowAxis] === rowIndex &&
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
        return state.gameStarted
          ? state.turnHistory.length % 2
            ? getters.secondPlayer
            : getters.firstPlayer
          : "";
      },
      lastCellId(state, getters) {
        return state.turnHistory.length
          ? state.turnHistory[state.turnHistory.length - 1]
          : state.firstCell.id;
      },
      winner(state, getters) {
        if (getters.gameFinished) {
          if (getters.scorex > getters.scorey) {
            return state.players.x;
          } else if (getters.scorey > getters.scorex) {
            return state.players.y;
          } else {
            return getters.secondPlayer;
          }
        }
      }
    },
    plugins: [onlineActionsController]
  });
}
