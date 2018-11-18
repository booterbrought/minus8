import Vue from "vue";
import VueRouter from "vue-router";
import VueSession from "vue-session";
import Menu from "./menu/Menu";
import Game from "./game/Game";
import GameOnlineLobby from "./game/GameOnlineLobby";
import uuid from "uuid";
import md5 from "md5";

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

new Vue({
  el: "#app",
  router,
  created() {
    if (!this.$session.exists()) {
      this.$session.start();
      this.$session.set("nickname", "Анон Х");
      this.$session.set("nickname2", "Anon Y");
      this.$session.set("boardSize", 8);
      let uid = uuid.v4();
      let secret = uuid.v4();
      this.$session.set("secret", secret);
      this.$session.set("uid", uid);
      this.$session.set("authToken", md5(uid + secret));
    }
  }
});
