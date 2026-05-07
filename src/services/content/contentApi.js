import { apiSlice } from "@/services/api/apiSlice";

export const contentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getMyContents: builder.query({
            query: ({
                status,
                search,
                page = 1,
                limit = 10,
            }) => ({
                url: "/content/my",
                method: "GET",
                params: {
                    status,
                    search,
                    page,
                    limit,
                },
                usePrivate: true,
            }),

            providesTags: ["Content"],
        }),

        createDraftContent: builder.mutation({
            query: (formData) => ({
                url: "/content/draft",
                method: "POST",
                data: formData,
                usePrivate: true,
            }),

            invalidatesTags: ["Content"],
        }),

        updateDraftContent: builder.mutation({
            query: ({ contentId, formData }) => ({
                url: `/content/draft/${contentId}`,
                method: "PATCH",
                data: formData,
                usePrivate: true,
            }),

            invalidatesTags: ["Content"],
        }),

        getContentById: builder.query({
            query: (id) => ({
                url: `/content/my/${id}`,
                method: "GET",
                usePrivate: true,
            }),
            providesTags: (result, error, id) => [{ type: "Content", id }],
        }),

        deleteMyContent: builder.mutation({
            query: (contentId) => ({
                url: `/content/my/${contentId}`,
                method: "DELETE",
                usePrivate: true,
            }),

            invalidatesTags: ["Content"],
        }),

        requestContentApproval: builder.mutation({
            query: ({ contentId, approvalRequestNote, changesSummary }) => ({
                url: `/content/request-approval/${contentId}`,
                method: "PATCH",
                data: {
                    approvalRequestNote,
                    changesSummary,
                },
                usePrivate: true,
            }),

            invalidatesTags: ["Content"],
        }),

        getAllContents: builder.query({
            query: ({ status, search, page = 1, limit = 10 }) => ({
                url: "/content",
                method: "GET",
                params: {
                    status,
                    search,
                    page,
                    limit,
                },
                usePrivate: true,
            }),
            providesTags: ["Content"],
        }),

        approveContent: builder.mutation({
            query: (contentId) => ({
                url: `/approvals/approve/${contentId}`,
                method: "PATCH",
                usePrivate: true,
            }),
            invalidatesTags: ["Content"],
        }),

        rejectContent: builder.mutation({
            query: ({ contentId, rejectionReason }) => ({
                url: `/approvals/reject/${contentId}`,
                method: "PATCH",
                data: { rejectionReason },
                usePrivate: true,
            }),
            invalidatesTags: ["Content"],
        }),
    }),
});

export const {
    useGetMyContentsQuery,
    useGetContentByIdQuery,
    useCreateDraftContentMutation,
    useUpdateDraftContentMutation,
    useDeleteMyContentMutation,
    useRequestContentApprovalMutation,
    useGetAllContentsQuery,
    useApproveContentMutation,
    useRejectContentMutation,
} = contentApi;