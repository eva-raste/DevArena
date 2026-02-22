import api from "./axios";

export const verifyUserApi = async (email) => {
  const res = await api.get("/users/verify-email", {
    params: { email }
  })
  return res.data
}