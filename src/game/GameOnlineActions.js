export default store => {
  let socket;

  function connectToServer() {
    console.log("Connecting...");
    socket = new WebSocket("ws://localhost:8081/server");
    socket.sendJSON = data => {
      socket.send(JSON.stringify(data));
    };

    socket.onopen = () => getGameData(store.state.gameId);
    socket.onmessage = msg => {
      let data = JSON.parse(msg.data);
      switch (data.event) {
        case "game-data":
          console.log(data.gameData);
          break;

        default:
          break;
      }
    };
  }

  function getGameData(id) {
    socket.sendJSON({
      event: "getGameData",
      id
    });
  }

  store.subscribe((mutation, state) => {
    // called after every mutation.
    // The mutation comes in the format of `{ type, payload }`.
    switch (mutation.type) {
      case "setGameMode":
        if (mutation.payload.mode === "online") {
          connectToServer();
        }
        break;
      default:
        break;
    }
  });
};
