<template>
  <div
    :id=id
    class="game-board-cell"
    :class="{ clickable, hidden, last }"
    :style="{ '--cell-value': cell.value }"
    @click="clickable && makeTurn(id)">
    <div v-if=gameStarted class="cell-decor">
      <span>{{ cell.value }}</span>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "Vuex";

export default {
  name: "GameBoardCell",
  props: {
    id: String
  },
  computed: {
    cell() {
      return this.cellsById[this.id];
    },
    last() {
      return this.lastCellId === this.cell.id;
    },
    clickable() {
      return this.activeCells.indexOf(this.cell) > -1;
    },
    hidden() {
      return this.turnHistory.some(turn => turn === this.id);
    },
    ...mapState(["gameStarted", "cellsById", "turnHistory"]),
    ...mapGetters(["activeCells", "lastCellId"])
  },
  methods: {
    ...mapActions(["makeTurn"])
  }
};
</script>

<style lang="scss">
@import "../vars";

.game-board-cell {
  --bg-color-k: 160;
  --bg-color: rgb(
    calc(
      var(--bg-color-k) -
        ((0 - var(--cell-value) + var(--map-size)) / (var(--map-size) * 2)) *
        var(--bg-color-k)
    ),
    20,
    calc(
      var(--bg-color-k) -
        ((var(--cell-value) + var(--map-size)) / (var(--map-size) * 2)) *
        var(--bg-color-k)
    )
  );

  flex: 1;
  display: flex;
  color: #ddd;
  line-height: 0;
  background-color: var(--bg-color) !important;
  border-radius: var(--cell-border-radius);
  font-size: var(--cell-font-size);
  margin: 0 0.3vmin;
  padding: 0.5vmin;
  text-align: center;
  text-shadow: $shadow-black;
  overflow: hidden;
  user-select: none;
  -moz-user-select: none;

  &.clickable {
    --bg-color-k: 180;
    animation: wave-big 1s ease-in-out infinite alternate;
    .cell-decor {
      background-color: $clickable-bg-color;
    }
    &:hover,
    &:active {
      animation-iteration-count: 1;
      animation-duration: 0ms;
      animation-direction: normal;
      animation-fill-mode: forwards;
    }
    &:hover {
      .cell-decor {
        background-color: $hover-bg-color;
      }
    }
    &:active {
      .cell-decor {
        background-color: $active-bg-color;
      }
    }
  }
  &.hidden {
    animation: disappear 100ms linear forwards;
    &.last {
      animation: semi-disappear 300ms linear forwards;
    }
  }
}

.cell-decor {
  width: 100%;
  border-radius: inherit;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  span {
    margin: 0 0 0.5vmin 0;
    border-radius: 0.5vmin;
  }
}
</style>


