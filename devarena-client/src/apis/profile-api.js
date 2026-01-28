import api from "./axios"; 

export const fetchMyProfile = (params = {}) => {
    return api.get("/profile", { params });
};

export const fetchPublicProfile = (userId, params = {}) => {
    return api.get(`/profile/${userId}`, { params });
};
