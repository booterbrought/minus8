import Vue from "vue";
import VueRouter from "vue-router";
import VueSession from "vue-session";
import Menu from "./menu/Menu";
import Game from "./game/Game";
import GameOnlineLobby from "./game/GameOnlineLobby";
import uuid from "uuid";

Vue.use(VueRouter);
Vue.use(VueSession, {
  persist: true
});

let router = new VueRouter({
  routes: [{
      path: "/game/:mode/",
      component: Game
    },
    {
      path: "/game/:mode/:id",
      component: Game
    },
    {
      name: "lobby",
      path: "/lobby",
      component: GameOnlineLobby
    },
    {
      name: "menu",
      path: "/*",
      component: Menu
    }
  ]
});

let div = document.createElement("div");
div.id = "app";
document.body.append(div);

new Vue({
  el: "#app",
  template: "<router-view></router-view>",
  router,
  created() {
    if (!this.$session.exists()) {
      this.$session.start();
      this.$session.set("nickname", "Анон Х");
      this.$session.set("nickname2", "Anon Y");
      this.$session.set("boardSize", 8);
      let playerId = uuid.v4();
      let playerSecret = uuid.v4();
      this.$session.set("playerId", playerId);
      this.$session.set("playerSecret", playerSecret);
    }
  }
});
