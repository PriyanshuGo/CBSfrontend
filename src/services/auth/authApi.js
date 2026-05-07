import { apiSlice } from "@/services/api/apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        data: credentials,
        usePrivate: false,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
        usePrivate: true,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
} = authApi;