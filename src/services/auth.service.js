import apiClient from "./apiClient";

export const loginUser = async (payload) => {
    const response = await apiClient.post("/login", payload);
    return response.data;
};

export const refreshAccessToken = async (refreshToken) => {
    const response = await apiClient.post("/refresh-token", {
        refreshToken,
    });

    return response.data;
};

export const logoutUser = async (refreshToken) => {
    const response = await apiClient.post("/logout", {
        refreshToken,
    });

    return response.data;
};