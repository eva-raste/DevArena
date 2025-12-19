import { useState } from "react";
import { createContestApi } from "../lib/contest-api";

export function useCreateContest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const submit = async (payload) => {
    setLoading(true);
    setError(null);
    setSuccess("Creating contest...");

    try {
      const res = await createContestApi(payload);
      setSuccess(`Contest created • Room ID: ${res.roomId}`);
      return res;
    } catch (e) {
      setError(e.message);
      setSuccess(null);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error, success };
}
