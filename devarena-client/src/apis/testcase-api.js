import api from "./axios";

export const parseTestcaseZip = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    "/testcases/parse-zip",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data; // List<Testcase>
};
