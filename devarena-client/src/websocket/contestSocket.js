import { Client } from "@stomp/stompjs";
const url = import.meta.env.VITE_API_BASE_URL;

export function connectContestSocket(onEvent) {
  const client = new Client({
    brokerURL: `${url}/ws`,
    reconnectDelay: 5000,
    //debug: (str) => console.log("[STOMP]", str),

    onConnect: () => {
      //console.log(" STOMP CONNECTED");

      client.subscribe("/topic/contest/status", (msg) => {
        //console.log("📩 RAW MSG", msg.body);
        onEvent(JSON.parse(msg.body));
      });
    },
  });

  client.activate();
  return client;
}
