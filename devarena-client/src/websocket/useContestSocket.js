import { useEffect } from "react";
import { connectContestSocket } from "./contestSocket";

/*
 * - Emits contestId + status updates
 * - Emits serverTime for clock sync
 */
export function useContestSocket({ onEvent }) {
  useEffect(() => {
    const client = connectContestSocket((event) => {
      if (!event) return;
      onEvent(event);
    });

    return () => client.deactivate();
  }, [onEvent]);
}
