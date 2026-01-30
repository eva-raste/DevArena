import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";

/**
 * Subscribes to verdict updates for a contest question
 *
 * @param {string} roomId
 * @param {string} questionSlug
 * @param {string} currentUserId
 */
export function useVerdictSocket(roomId, questionSlug, currentUserId) {
  const clientRef = useRef(null);

  const [verdict, setVerdict] = useState(null);
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (!roomId || !questionSlug || !currentUserId) return;

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
      reconnectDelay: 5000,
      debug: (str) => console.log(str),

      onConnect: () => {
        client.subscribe(
          `/topic/contest/${roomId}/question/${questionSlug}`,
          (msg) => {
            const event = JSON.parse(msg.body);

            // Only update UI for current user
            if (event.userId === currentUserId) {
              setVerdict(event.verdict);
              setScore(event.score);
            }
          }
        );
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [roomId, questionSlug, currentUserId]);

  return {
    verdict,
    score,
  };
}
