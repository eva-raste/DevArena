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
export const fetchQuestionsApi = async (
  page = 0,
  size = 10,
  difficulty
) => {
  try {
    const res = await api.get("/questions", {
      params: {
        page,
        size,
        ...(difficulty && { difficulty }),
      },
    })

    return res.data
  } catch {
    throw new Error("Failed to fetch questions")
  }
}

export async function fetchEditQuestionCard(slug) {
  try {
    const res = await api.get(`/questions/edit/${slug}`);
    return res.data;
  } catch (err) {
    throw new Error("Question not found");
  }
}

export async function fetchQuestionCard(slug) {
  try {
    const res = await api.get(`/questions/card/${slug}`);
    return res.data;
  } catch (err) {
    throw new Error("Question not found");
  }
}

export const fetchContestQuestion = async (roomId , slug) =>{
    try{
        if(!roomId || !slug) throw new Error("RoomId or QuestionSlug missing");
        const res = await api.get(`/questions/${slug}/contest/${roomId}`);
        return res.data;
    }
    catch{
        throw new Error("Failed to fetch contest question");
    }
};

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
  questionSlug,
  roomId,
  code
) => {
    // console.log(  `submitting backend ${roomId} for ${questionSlug} `)
  try {
    const res = await api.post(
      `/questions/${questionSlug}/submit`,
      code , // body
      {
        headers: { "Content-Type": "text/plain" } ,
        params: roomId ?  {roomId}  : {}
      }
    );
    return res.data;
  } catch {
    throw new Error("Failed to submit code");
  }
};

export const fetchMySubmissions = async (questionSlug, roomId = null) => {
  try {
    const res = await api.get(
      `/questions/${questionSlug}/submissions`,
      {
        params: roomId ? { roomId } : {}
      }
    );
    return res.data;
  } catch {
    throw new Error("Failed to fetch submissions");
  }
};


export const deleteQuestionApi = async (questionSlug) => {
  try{
    const res = await api.delete(
      `/questions`,
      {
        params : questionSlug ? { questionSlug } : ""
      }
    )
  }
  catch{
    throw new Error("Error deleting question...")
  }
};

export const updateQuestionApi = async (questionSlug, form) => {
    // try
    // {
        console.log("calling with ",questionSlug)
        return api.put(
            "/questions",
            form, 
            {
            params: { questionSlug }, 
            }
        )
    // }
    // catch{
    //     throw new Error("Error updating question...")
    // }
};

export const saveDraft = async ({
  questionSlug,
  roomId,
  language,
  code,
}) => {
  return api.post("/drafts", {
    questionSlug,
    roomId,
    language,
    code,
  });
};


export const fetchDraft = async ({
  questionSlug,
  language,
  roomId,
}) => {
  const res = await api.get("/drafts", {
    params: {
      questionSlug,
      language,
      roomId: roomId ?? undefined,
    },
  });

  return res.data?.code;
};

export const verifyUserByEmail = async (email) => {
    const res = await api.get(`/users/verify-email`, {
        params: { email }
    });

    return res.data;
}


