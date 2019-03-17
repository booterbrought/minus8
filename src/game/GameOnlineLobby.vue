<template>
  <div class="lobby">
    <p class="lobby-state">{{ caption }}</p>
    <p class="opp-name">{{ oppName }}</p>
    <div class="actions" v-if=oppFound>
      <span class="game-button" :class="{ accept: !accepted , clickable: !accepted }" @click=accept>{{ acceptedCaption }}</span>
      <span class="game-button decline clickable" @click=decline>Decline</span>
    </div>
    <div class="game-button cancel clickable" @click=cancel>Cancel</div>
  </div>
</template>

<script>
let waitingStates = {
  CONNECTING: 1,
  WAITING: 2,
  OPP_FOUND: 4,
  ACCEPTED: 5,
  GAME_CREATED: 3,
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
      this.currentState = waitingStates.ACCEPTED;
      this.socket.sendJSON({ event: "accept" });
    },
    decline() {
      this.socket.sendJSON({ event: "decline" });
    },
    cancel() {
      this.$router.push("/");
    },
    connect() {
      this.currentState = waitingStates.CONNECTING;
      let socket = new WebSocket(API_HOST + "/lobby");
      socket.sendJSON = data => {
        socket.send(JSON.stringify(data));
      };
      this.socket = socket;

      socket.onopen = () => {
        socket.sendJSON({
          event: "lobby-enter",
          playerId: this.settings.playerId,
          playerSecret: this.settings.playerSecret,
          playerName: this.settings.nickname
        });
      };

      socket.onmessage = msg => {
        let data = JSON.parse(msg.data);
        this.oppName = "";
        switch (data.event) {
          case "in-lobby":
            this.currentState = waitingStates.WAITING;
            this.oppName = "";
            break;

          case "opponent-found":
            this.currentState = waitingStates.OPP_FOUND;
            this.oppName = data.oppName;
            break;

          case "game-created":
            this.currentState = waitingStates.GAME_CREATED;
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
          this.currentState != waitingStates.GAME_CREATED
        )
          this.connect();
      };
    }
  },
  computed: {
    oppFound() {
      return (
        this.currentState === waitingStates.OPP_FOUND ||
        this.currentState === waitingStates.ACCEPTED
      );
    },
    accepted() {
      return this.currentState === waitingStates.ACCEPTED;
    },
    caption() {
      switch (this.currentState) {
        case waitingStates.CONNECTING:
          return "Connecting...";
        case waitingStates.OPP_FOUND:
          return "Opponent found!";
        case waitingStates.ACCEPTED:
          return "Waiting for accept...";
        default:
          return "Waiting for opponent...";
      }
    },
    acceptedCaption() {
      return this.accepted ? "Accepted" : "Accept";
    }
  },
  created() {
    this.connect();
  },
  beforeDestroy() {
    this.currentState = waitingStates.CANCELED;
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
  margin: 2.5vmin 0 4vmin;
}

.lobby-state {
  font-size: 3vmin;
  margin: 3vmin 0 0vmin;
}

.actions {
  width: 45vmin;
  display: flex;
  margin: 2vmin auto;
}

.game-button {
  &.accept,
  &.decline {
    margin: 0 1vmin;
  }

  &.accept {
    background: forestgreen !important;
  }
  &.decline {
    background: firebrick !important;
  }
}
</style>
