import { Client } from "@stomp/stompjs";

export function connectContestSocket(onEvent) {
  const client = new Client({
    brokerURL: "ws://localhost:8080/ws",
    reconnectDelay: 5000,
    debug: (str) => console.log(str),

    onConnect: () => {
      client.subscribe("/topic/contests", (msg) => {
        onEvent(JSON.parse(msg.body));
      });
    },
  });

  client.activate();
  return client;
}
