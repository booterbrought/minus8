<template>
  <div class="menu">
    <div class="menu-title">{{ title }}</div>
    <menu-item v-for="item in items" :key=item.title :item=item>
    </menu-item>
    <div class="menu-footer">by <a href="https://vk.com/keshka" class="menu-link">booterbrought</a></div>
  </div>
</template>
<script>
import MenuItem from "./MenuItem";

export default {
  name: "Menu",
  components: { MenuItem },

  data() {
    let session = this.$session;
    let settings = {
      get nickname() {
        return session.get("nickname");
      },
      set nickname(val) {
        session.set("nickname", val);
      },
      get nickname2() {
        return session.get("nickname2");
      },
      set nickname2(val) {
        session.set("nickname2", val);
      },
      get boardSize() {
        return session.get("boardSize");
      },
      set boardSize(val) {
        let intVal = parseInt(val);
        if (Number.isInteger(intVal)) session.set("boardSize", intVal);
      }
    };
    return {
      title: "Minus 8",
      items: [
        {
          title: "Play",
          items: [
            { title: "Hotseat", button: "/game/hotseat" },
            { title: "Online", button: "/lobby" },
            { title: "vs AI (not yet)", button: "/vs-ai" }
          ]
        },
        {
          title: "Settings",
          items: [
            {
              title: "Nickname",
              input: "nickname",
              settings
            },
            {
              title: "2nd nickname (hotseat)",
              input: "nickname2",
              settings
            },
            {
              title: "Board size (except online)",
              input: "boardSize",
              settings
            }
          ]
        },
        {
          items: [
            {
              title: "About & Rules",
              link: "https://github.com/booterbrought/minus8"
            }
            // { title: "Rules", link: "/rules" }
          ]
        }
      ],
      settings
    };
  }
};
</script>
<style lang="scss">
@import "../vars";

.menu {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  max-width: 80vmin;
  margin: 0.5vmin auto;
}

.menu-title {
  font-size: 6vmin;
  text-align: center;
}

.menu-footer {
  text-align: right;
  font-size: 2.4vmin;
}

.menu-link:link {
  color: #bbb;
}
.menu-link:visited {
  color: #bbb;
}
.menu-link:hover {
  color: #eee;
}
</style>
