import Vue from "vue";
import Vuex from "Vuex";
import onlineActions from "./GameOnlineActions.js";
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

export default function () {
  return new Vuex.Store({
    state() {
      return {
        boardSize: 8,
        gameId: "",
        gameMode: "",
        gameStarted: false,
        boardMap: [],
        cellsById: {},
        turnHistory: [],
        firstPlayer: "",
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
      makeTurn(context, cellId) {
        context.commit("incrementPlayerScore", {
          player: context.getters.currentPlayer,
          value: context.state.cellsById[cellId].value
        });
        context.commit("makeTurn", cellId);
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
        state.firstPlayer = state.players[random(["x", "y"])];
      },
      makeTurn(state, cellId) {
        state.turnHistory.push(cellId);
      },
      incrementPlayerScore(state, turn) {
        state.players[turn.player].score += turn.value;
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
        if (payload.id) state.gameId = payload.id;
      },
      setPlayer(state, player) {
        state.players[player.axis] = player;
      },
      setBoardSize(state, boardSize) {
        state.boardSize = boardSize;
      }
    },
    getters: {
      activeRow(state, getters) {
        return (
          state.gameStarted &&
          (getters.currentPlayer === "y" ?
            getters.lastCellId
            .split("")
            .slice(0, 2)
            .join("") :
            getters.lastCellId
            .split("")
            .slice(2)
            .join(""))
        );
      },
      activeCells(state, getters) {
        return Object.keys(state.cellsById)
          .filter(
            id =>
            state.gameStarted &&
            id.indexOf(getters.activeRow) > -1 &&
            !state.turnHistory.some(turn => turn === id)
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
      secondPlayer(state, getters) {
        return state.players[otherAxis(state.firstPlayer.axis)];
      },
      currentPlayer(state, getters) {
        return state.gameStarted ?
          state.turnHistory.length % 2 ?
          getters.secondPlayer.axis :
          state.firstPlayer.axis :
          "";
      },
      lastCellId(state, getters) {
        return state.turnHistory.length ?
          state.turnHistory[state.turnHistory.length - 1] :
          state.firstCell.id;
      },
      winner(state, getters) {
        return getters.gameFinished ?
          state.firstPlayer.score > getters.secondPlayer.score ?
          state.firstPlayer :
          getters.secondPlayer :
          "";
      }
    },
    plugins: [onlineActions]
  });
}
