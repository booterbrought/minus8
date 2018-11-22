<template>
  <div class="game-player" :class="{
     'player-active': isActive,
     'player-x': (axis === 'x'),
     'player-y': (axis === 'y')
    }">
    <div class="score" >{{ score }}</div>{{ playerName }}
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "Vuex";

export default {
  name: "GamePlayer",
  props: {
    axis: String
  },
  data() {
    return {};
  },
  computed: {
    player() {
      return this.players[this.axis];
    },
    playerName() {
      return this.player.playerName;
    },
    score() {
      let evenness = this.axis === this.firstPlayerId ? 1 : 0;
      return this.turnHistory.reduce((sum, turn, i) => {
        return sum + this.cellsById[turn].value * (i % 2 != evenness);
      }, 0);
    },
    isActive() {
      return this.currentPlayer.axis === this.axis;
    },

    ...mapState(["players", "turnHistory", "cellsById", "firstPlayerId"]),
    ...mapGetters(["currentPlayer"])
  }
};
</script>

<style lang="scss">
@import "../vars";

.game-player {
  font-size: 4vmin;
  line-height: 6vmin;
  text-shadow: $shadow-black;
  background: #282828;
  width: 100%;
  &.player-active {
    background: #666;
  }
  &.player-x {
    border-top-left-radius: 0.5vmin;
    border-bottom-left-radius: 0.5vmin;
    .score {
      float: right;
    }
  }
  &.player-y {
    border-top-right-radius: 0.5vmin;
    border-bottom-right-radius: 0.5vmin;
    .score {
      float: left;
    }
  }

  .score {
    background-color: #0005;
    font-family: Consolas, Monaco, Hack, "DejaVu Sans", monospace;
    height: 100%;
    padding: 0.2vmin 1.2vmin;
  }
}

@keyframes wave {
  0% {
    transform: scale(0.98);
  }

  100% {
    transform: scale(1.02);
  }
}
</style>
