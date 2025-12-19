const BASE_URL = 'http://localhost:8080/api';

export const createContestApi = async (payload) => {
  const response = await fetch(`${BASE_URL}/contests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to create contest");
  }

  return response.json();
};
