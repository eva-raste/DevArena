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


export const fetchAllCOntestsApi = async () =>{
  try{
    const response  = await api.get('/contests/me');

    return response.data;
  }
  catch(err)
  {
    throw new Error("Failed to fetch Contests");
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
