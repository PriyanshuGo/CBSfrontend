import axios from "axios";
import {
    getAccessToken, setAccessToken,
    removeAccessToken,
} from "@/utils/token";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const publicAxios = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export const privateAxios = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

privateAxios.interceptors.request.use(
    (config) => {
        const token = getAccessToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

privateAxios.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // avoid infinite retry loop
        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {

                // get new access token
                const response = await publicAxios.post("/refresh-token");

                const newAccessToken =
                    response?.data?.data?.accessToken;

                // save new token
                setAccessToken(newAccessToken);

                // attach new token to failed request
                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                // retry failed request
                return privateAxios(originalRequest);

            } catch (refreshError) {

                // logout user if refresh fails
                removeAccessToken();

                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);