import { useState } from "react";
import { parseTestcaseZip } from "@/apis/testcase-api";

export const useTestcaseZipUpload = () => {
  const [testcases, setTestcases] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadZip = async (file) => {
    setLoading(true);
    setError(null);

    try {
      const parsed = await parseTestcaseZip(file);
      setTestcases(parsed);
      return parsed;
    } catch (err) {
      const apiError = err?.response?.data;
      setError(apiError ?? { message: "Upload failed" });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    testcases,
    loading,
    error,
    uploadZip,
  };
};
