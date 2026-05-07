import { publicAxios, privateAxios } from "./axiosInstance";

const axiosBaseQuery =
    ({ usePrivate = false } = {}) =>
        async ({ url, method, data, params }) => {
            try {

                const axiosInstance = usePrivate
                    ? privateAxios
                    : publicAxios;

                const result = await axiosInstance({
                    url,
                    method,
                    data,
                    params,
                });

                return {
                    data: result.data,
                };

            } catch (axiosError) {

                return {
                    error: {
                        status: axiosError.response?.status,
                        data:
                            axiosError.response?.data ||
                            axiosError.message,
                    },
                };
            }
        };

export default axiosBaseQuery;