import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useTestcaseZipUpload } from "@/hooks/useTestcaseZipUpload";

export default function TestcaseZipUpload({ onSuccess, onError }) {
  const fileRef = useRef(null);
  const { uploadZip, loading } = useTestcaseZipUpload();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await uploadZip(file);
      onSuccess?.(parsed);
    } catch (err) {
      const apiError = err?.response?.data;
      onError?.(apiError);
    } finally {
      e.target.value = "";
    }
  };


  return (
    <div className="space-y-2">
      <input
        ref={fileRef}
        type="file"
        accept=".zip"
        hidden
        onChange={handleFileChange}
      />

      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={() => fileRef.current?.click()}
      >
        {loading ? "Parsing ZIP..." : "Upload Testcase ZIP"}
      </Button>
    </div>
  );
}
