import api from "./axios"; // default export

export async function createQuestion(question) {
  console.log("sending data to backend", question);

  try {
    const res = await api.post("/questions", question);
    return res.data;
  } catch (err) {
    if (err.response?.status === 409) {
      throw new Error("Slug already exists");
    }
    throw new Error("Failed to create question");
  }
}

export const fetchQuestionsApi = async () => {
  try {
    const res = await api.get("/questions");
    return res.data;
  } catch (err) {
    throw new Error("Failed to fetch questions");
  }
};

export async function fetchQuestionCard(slug, origin) {
  try {
    const res = await api.get(`/questions/card/${slug}/${origin}`);
    return res.data;
  } catch (err) {
    throw new Error("Question not found");
  }
}
