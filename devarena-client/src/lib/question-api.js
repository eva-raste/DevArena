const BASE_URL = 'http://localhost:8080/api';

export async function createQuestion(question) {
    console.log("sending data to backend ", question);
  const res = await fetch(`${BASE_URL}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(question),
  })
  console.log("returned");
  if (res.status === 409) {
    throw new Error("Slug already exists")
  }

  if (!res.ok) {
    throw new Error("Failed to create question")
  }
  const data = await res.json();
  console.log(data);

  return data;
}


export const fetchQuestionsApi = async () => {
  const response = await fetch(`${BASE_URL}/questions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch questions');
  }

  return response.json();
};
