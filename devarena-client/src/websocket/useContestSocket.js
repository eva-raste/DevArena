import { useEffect } from "react";
import { connectContestSocket } from "./contestSocket";

export function useContestSocket({ onEvent }) {
  useEffect(() => {
    const client = connectContestSocket(onEvent);

    return () => client.deactivate();
  }, [onEvent]);
}
