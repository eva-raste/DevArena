/* eslint-disable no-unused-vars */
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

export const fetchQuestionsApi = async (page = 0, size = 10) => {
  try {
    const res = await api.get("/questions", {
      params: { page, size }
    });
    return res.data; // Page object
  } catch {
    throw new Error("Failed to fetch questions");
  }
};


export async function fetchQuestionCard(slug) {
  try {
    const res = await api.get(`/questions/card/${slug}`);
    return res.data;
  } catch (err) {
    throw new Error("Question not found");
  }
}

export async function runCode(code, testcases) {
  try {
    const res = await api.post("/run", {
      code,
      testcases,
    });
    return res.data;
  } catch (err) {
    throw new Error("Failed to run code");
  }
}

export async function fetchCodeforcesQuestionApi(slug)
{
  try{
    const res = await api.get(`/questions/prefill/codeforces`,{
       params: { slug }
    });
    return res.data;
  }
  catch(err)
  {
    throw new Error("Failed to fetch CodeForces question...")
  }
}

export const submitCode = async (
  questionId,
  contestId,
  code,
  testcases
) => {
  try {
    const res = await api.post(
      `/questions/${questionId}/submit`,
      { code, testcases },
      {
        params: contestId ? { contestId } : {}
      }
    );
    return res.data;
  } catch {
    throw new Error("Failed to submit code");
  }
};

export const fetchMySubmissions = async (questionId, contestId = null) => {
  try {
    const res = await api.get(
      `/questions/${questionId}/submissions`,
      {
        params: contestId ? { contestId } : {}
      }
    );
    return res.data;
  } catch {
    throw new Error("Failed to fetch submissions");
  }
};
