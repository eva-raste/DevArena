import { Client } from "@stomp/stompjs";
const url = import.meta.env.VITE_API_BASE_URL;

export function connectVerdictSocket(
  roomId,
  questionSlug,
  onVerdict
) {
  const client = new Client({
    brokerURL: `${url}/ws`,
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
