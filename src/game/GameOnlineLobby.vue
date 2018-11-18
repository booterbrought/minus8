<template>
  <div class="lobby">
    <p class="lobby-state">{{ caption }}</p>
    <p class="opp-name">{{ oppName }}</p>
    <div class="actions" v-if="currentState===3">
      <span class="lobby-button accept clickable" @click=accept>Accept</span>
      <span class="lobby-button decline" @click=decline>Decline</span>
    </div>
    <div class="lobby-button cancel clickable" @click=cancel>Cancel</div>
  </div>
</template>

<script>
let waitingStates = {
  CONNECTING: 1,
  WAITING: 2,
  OPP_FOUND: 3,
  GAME_STARTED: 4,
  CANCELED: 100
};

export default {
  name: "GameOnlineLobby",
  data() {
    return {
      oppName: "",
      currentState: 0,
      socket: {},
      settings: this.$session.getAll()
    };
  },
  methods: {
    accept() {
      this.socket.sendJSON({ event: "accept" });
    },
    decline() {
      this.socket.sendJSON({ event: "decline" });
    },
    cancel() {
      this.currentState = waitingStates.CANCELED;
      this.$router.push("/");
    },
    connect() {
      this.currentState = waitingStates.CONNECTING;
      let socket = new WebSocket("ws://localhost:8081/server");
      socket.sendJSON = data => {
        socket.send(JSON.stringify(data));
      };
      this.socket = socket;

      socket.onopen = () => {
        socket.sendJSON({
          event: "lobby-enter",
          uid: this.settings.uid,
          authToken: this.settings.authToken,
          playerName: this.settings.nickname
        });
      };

      socket.onmessage = msg => {
        let data = JSON.parse(msg.data);
        this.oppName = "";
        switch (data.event) {
          case "in-lobby":
            this.currentState = waitingStates.WAITING;
            break;
          case "opponent-found":
            this.currentState = waitingStates.OPP_FOUND;
            this.oppName = data.oppName;
            break;
          case "game-started":
            this.currentState = waitingStates.GAME_STARTED;
            this.$router.push("/game/online/" + data.gameId);
            break;
          default:
            break;
        }
      };

      socket.onerror = error => {
        console.error(error);
      };

      socket.onclose = code => {
        if (
          this.currentState != waitingStates.CANCELED &&
          this.currentState != waitingStates.GAME_STARTED
        )
          this.connect();
      };
    }
  },
  computed: {
    caption() {
      switch (this.currentState) {
        case waitingStates.CONNECTING:
          return "Connecting...";
        case waitingStates.OPP_FOUND:
          return "Opponent found!";
        default:
          return "Waiting for opponent...";
      }
    }
  },
  created() {
    this.connect();
  },
  beforeDestroy() {
    this.socket.close();
  }
};
</script>

<style lang="scss">
@import "../vars";

.lobby {
  line-height: 100%;
  text-align: center;
}

.opp-name {
  font-size: 5vmin;
  margin: 1vmin;
}

.lobby-state {
  font-size: 3vmin;
  margin: 1vmin;
}

.actions {
  width: 45vmin;
  display: flex;
  margin: 2vmin auto;

  .accept,
  .decline {
    margin: 0 1vmin;
  }
}

.lobby-button {
  width: 30vmin;
  padding: 1vmin;
  margin: auto;
  border-radius: 1vmin;

  &.accept {
    background: forestgreen;
  }
  &.decline {
    background: firebrick;
  }
}
</style>
