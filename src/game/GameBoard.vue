<template>
  <div class="game-board"
    :class="{ finished: gameFinished }"
    :style="{
      '--cell-border-radius': cellBorderRadius,
      '--cell-font-size': cellFontSize,
      '--map-size': mapSize
    }"
  >
    <div class="game-board-row"
      v-for="(row, y) in boardMap"
      :key="'y'+y"
      :id="'y'+y">
      <GameBoardCell
        v-for="cell in row"
        :key=cell.id
        :id=cell.id>
      </GameBoardCell>
    </div>
    <div v-if=gameFinished class="finished-message">
      <p>Congratulations!</p>
      <p>{{ winner.name }} won!</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "Vuex";
import GameBoardCell from "./GameBoardCell";

export default {
  name: "GameBoard",
  components: {
    GameBoardCell
  },
  computed: {
    cellFontSize() {
      return (0.6 * 91) / this.boardMap.length + "vmin"; // percent of cell height x board height / amount of rows
    },
    cellBorderRadius() {
      return 4 / this.boardMap.length + "vmin";
    },
    mapSize() {
      return this.boardMap.length;
    },
    ...mapState(["boardMap"]),
    ...mapGetters(["gameFinished", "lastCellId", "winner"])
  },
  methods: {}
};
</script>

<style lang="scss">
.game-board {
  display: flex;
  flex-direction: column;
  border-radius: 1vmin;
  background-image: url("../assets/back.jpg");
  background-size: cover;
  background-position: 75%;
  height: 91vmin;
  &.finished .game-board-row {
    animation: blurr 250ms linear forwards;
  }
}
.game-board-row {
  display: flex;
  flex: 1;
  padding: 0.3vmin 0;
}

.finished-message {
  position: absolute;
  animation: appear 300ms linear forwards;
  top: 38.5vmin;
  left: 0;
  right: 0;
  font-size: 5vmin;
  color: white;
  z-index: 1001;
  background-color: #000a;
  line-height: 150%;
}

@keyframes appear {
  0% {
    filter: blur(1vmin);
    opacity: 0;
  }
  100% {
    filter: blur(0px);
    opacity: 1;
  }
}

@keyframes semi-disappear {
  0% {
    filter: blur(0px);
    opacity: 1;
  }
  66% {
    filter: blur(1vmin);
    opacity: 0;
  }
  100% {
    filter: blur(0px);
    opacity: 0.2;
  }
}

@keyframes disappear {
  0% {
    filter: blur(0px);
    opacity: 0.2;
  }
  100% {
    filter: blur(1vmin);
    opacity: 0;
  }
}

@keyframes blurr {
  0% {
    filter: blur(0px);
  }
  100% {
    filter: blur(1vmin);
  }
}

@keyframes wave-big {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(1.15);
  }
}
</style>
