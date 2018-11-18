<template>
  <div class="menu-item" :class="{ clickable: item.link, submenu:item.items }" @click=go>
    <div v-if=item.title class="menu-item-head">
      <div v-if=item.title class="menu-item-title">{{ item.title }}</div>
      <input v-if=item.input v-model.lazy="item.settings[item.input]" class="menu-item-input">
    </div>
    <div v-if=item.items class="menu-items">
      <menu-item v-for="i in item.items" :key=i.title :item=i />
    </div>
  </div>
</template>
<script>
export default {
  name: "menu-item",
  props: {
    item: {
      title: { type: String, required: true },
      items: Array,
      link: String
    }
  },
  data() {
    return {};
  },
  methods: {
    go() {
      this.$router.push(this.item.link);
    }
  }
};
</script>
<style lang="scss" scoped>
.menu-item-head {
  display: flex;
}

.menu-item.submenu > .menu-item-head > .menu-item-title {
  padding-bottom: 1vmin;
  color: #aaa;
}

.menu-item-title {
  width: 100%;
}

.menu-item-input {
  border: none;
  width: 25vmin;
  background-color: #555;
  color: #eee;
  margin: -1vmin -1vmin -1vmin 1vmin;
  text-align: right;
  font: inherit;
  border-radius: 0.5vmin;
  padding: 0.5vmin 1vmin;
}

.menu-item {
  border-radius: 0.5vmin;
  padding: 1vmin;
  margin-top: 1vmin;
  &:first-child {
    margin-top: 0vmin;
  }

  &.submenu {
    border: 1px solid #444;
  }

  &.clickable {
    &:hover,
    &:active {
      transform: scale(1);
      .menu-item-title {
        animation: slightly-move-right 100ms forwards;
      }
    }
    &:not(:hover):not(:active) {
      .menu-item-title {
        animation: slightly-move-left 100ms forwards;
      }
    }
  }
}

@keyframes slightly-move-right {
  0% {
    transform: translateX(0px);
  }
  100% {
    transform: translateX(2vmin);
  }
}
@keyframes slightly-move-left {
  0% {
    transform: translateX(2vmin);
  }
  100% {
    transform: translateX(0px);
  }
}
</style>


