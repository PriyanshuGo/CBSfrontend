import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./baseQuery";

export const apiSlice = createApi({
  reducerPath: "api",

  baseQuery: axiosBaseQuery(),
  tagTypes: ["Auth", "Content", "Approval", "LiveContent"],

  endpoints: () => ({}),
});