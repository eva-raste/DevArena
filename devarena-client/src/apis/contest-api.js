/* eslint-disable no-unused-vars */

import api from "./axios.js";

export const createContestApi = async (payload) => {
  console.log("creating contest \n", payload);
  try
  {

    const response = await api.post('/contests',payload)
    
    return response.data;
  }
  catch(err){
      throw new Error("Failed to create contest");

  }
};


export const fetchAllContestsApi = async ({
  page = 0,
  size = 5,
  status,
} = {}) => {
  try {
    const response = await api.get("/contests/me", {
      params: {
        page,
        size,
        status,
      },
    })

    return response.data
  } catch {
    throw new Error("Failed to fetch Contests")
  }
}


export const fetchContestByIdApi = async (roomId) => {
  try {
    const res = await api.get(`/contests/${roomId}`)
    return res.data
  } catch (error) {
    console.error("Failed to fetch contest details", error)
    throw new Error(
      error.response?.data?.message || "Unable to fetch contest details"
    )
  }
}


export const deleteContestApi = async (roomId) =>{
    try
    {
        const res = await api.delete('/contests',{
            params : roomId ? {roomId} : ""
        })
    }
    catch{
        throw new Error("Could not delete contest...")
    }
}

export const checkContestEditValidityApi = (roomId) =>
  api.get("/contests/edit-validity", {
    params: { roomId },
  })


export const updateContestApi = async (roomId, payload) => {
  const res = await api.put(
    `/contests/${roomId}`,
    payload
  )

  return res.data
}

export const fetchPublicContests = async ({
  page = 0,
  size = 10,
  status = null,
}) => {
//   try {
    const res = await api.get("/contests/public", {
      params: { page, size, status },
    })
    return res.data
//   } catch (err) {
//     throw err
//   }
}
