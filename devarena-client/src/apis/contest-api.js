
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
