<template>
  <div class="game-player" :class="{
     'player-active': isActive,
     'player-x': (axis === 'x'),
     'player-y': (axis === 'y')
    }">
    <div class="score" >{{ player.score }}</div>{{ player.name }}
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
    name() {
      return this.player.name;
    },
    score() {
      return this.player.score;
    },
    isActive() {
      return this.currentPlayer === this.axis;
    },

    ...mapState(["players"]),
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
