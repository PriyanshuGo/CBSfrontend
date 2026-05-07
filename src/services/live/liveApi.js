import { apiSlice } from "@/services/api/apiSlice";

export const liveApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getLiveContent: builder.query({
            query: (teacherId) => ({
                url: `/live/${teacherId}`,
                method: "GET",
                usePrivate: false,
            }),
        }),

    }),
});

export const {
    useGetLiveContentQuery,
} = liveApi;