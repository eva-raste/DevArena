import { Client } from "@stomp/stompjs";

export function connectVerdictSocket(
  roomId,
  questionSlug,
  onVerdict
) {
  const client = new Client({
    brokerURL: "ws://localhost:8080/ws",
    reconnectDelay: 5000,

    onConnect: () => {
      client.subscribe(
        `/topic/contest/${roomId}/question/${questionSlug}`,
        (msg) => {
          onVerdict(JSON.parse(msg.body));
        }
      );
    },
  });

  client.activate();
  return client;
}
