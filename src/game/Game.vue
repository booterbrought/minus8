<template>
  <div class="game">
      <div class="game-header">
        <GamePlayer :axis="'x'"></GamePlayer>
        <div v-if="this.gameMode === 'hotseat' && !gameInProgress"
          class="cap-center"
          :class="{ clickable: !gameInProgress }"
          @click=restartGame >
          {{ startBtnCaption }}
        </div>
        <GamePlayer :axis="'y'"></GamePlayer>
      </div>
      <GameBoard></GameBoard>
    </div>
</template>

<script>
import GameBoard from "./GameBoard";
import GamePlayer from "./GamePlayer";
import newGameStore from "./GameStore";
import { mapState, mapGetters, mapActions, mapMutations } from "Vuex";

export default {
  components: {
    GameBoard,
    GamePlayer
  },
  data() {
    let session = this.$session;
    return {
      settings: this.$session.getAll()
    };
  },
  store: newGameStore(),
  computed: {
    startBtnCaption() {
      return this.gameFinished ? "Restart!" : "Start!";
    },
    ...mapState([
      "boardSize",
      "gameId",
      "gameMode",
      "gameStarted",
      "boardMap",
      "cellsById",
      "turnHistory",
      "firstCell",
      "players",
      "playerLeft"
    ]),
    ...mapGetters([
      "activeCells",
      "firstPlayer",
      "gameFinished",
      "gameInProgress",
      "secondPlayer",
      "lastCellId",
      "currentPlayer",
      "winner"
    ])
  },
  methods: {
    initGame() {
      let mode = this.$route.params.mode;
      switch (mode) {
        case "online":
          this.initOnline(this.$route.params.id);
          break;
        case "vs-ai":
          break;
        default:
          this.initHotSeat();
      }
    },
    initHotSeat() {
      this.setGameMode({ mode: "hotseat", playerId: this.settings.playerId });
      this.setBoardSize(this.settings.boardSize);
      this.setPlayer({
        axis: "x",
        control: "user",
        name: this.settings.nickname,
        score: 0
      });
      this.setPlayer({
        axis: "y",
        control: "user",
        name: this.settings.nickname2,
        score: 0
      });
      if (this.boardMap.length === 0) {
        this.createNewMap();
      }
    },
    initOnline(id) {
      this.setGameMode({
        mode: "online",
        id,
        playerId: this.settings.playerId,
        playerSecret: this.settings.playerSecret
      });
    },
    ...mapMutations(["setGameMode", "setPlayer", "setBoardSize", "disconnect"]),
    ...mapActions(["createNewMap", "restartGame", "makeTurn"])
  },
  mounted() {
    this.initGame();
  },
  beforeDestroy() {
    this.disconnect();
  }
};
</script>

<style lang="scss">
@import "../vars";

.game {
  display: flex;
  flex-direction: column;
  border: solid #fff4 1px;
  border-radius: 1vmin;
  font-family: $main-font;
  margin: 0.5vmin auto;
  max-width: 98vmin;
  height: 98vmin;
  text-align: center;
  padding: 0.3vmin;
}

.game-header {
  color: #eee;
  display: flex;
  padding: 0.3vmin;
  font-size: 5vmin;
  height: 6.4vmin;
  .cap-center {
    padding: 0 1.5vmin;
    &.clickable:not(:active) {
      background: forestgreen;
    }
  }
}
</style>
