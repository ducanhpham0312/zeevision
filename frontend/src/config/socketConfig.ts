import ReconnectingWebSocket from "reconnecting-websocket";

const ws = new ReconnectingWebSocket("ws://127.0.0.1:8081/ws");
ws.addEventListener("open", () => {
  console.log("websocket: connected");
});

ws.addEventListener("close", () => {
  console.log("websocket: closed");
});

ws.addEventListener("error", (event) => {
  console.error("websocket: error:", event);
});

export default ws;
