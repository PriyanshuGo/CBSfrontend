"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import {
    useCreateDraftContentMutation,
    useUpdateDraftContentMutation,
    useGetContentByIdQuery,
} from "@/services/content/contentApi";

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const createUploadSchema = (isUpdate) => z
    .object({
        title: z
            .string()
            .min(3, "Title must be at least 3 characters")
            .max(100, "Title must be at most 100 characters"),

        subject: z
            .string()
            .min(1, "Subject ID is required"),

        description: z
            .string()
            .max(500, "Description must be at most 500 characters")
            .optional(),

        startTime: z
            .string()
            .min(1, "Start time is required"),

        endTime: z
            .string()
            .min(1, "End time is required"),

        rotationDuration: z
            .string()
            .refine(
                (val) => val === "" || (Number(val) > 0 && Number.isFinite(Number(val))),
                "Rotation duration must be a positive number"
            )
            .optional(),

        file: z
            .any()
            .optional()
            .refine((f) => isUpdate || f instanceof File, "File is required")
            .refine(
                (f) => !f || (f instanceof File && ACCEPTED_TYPES.includes(f.type)),
                "Only PNG, JPG, JPEG, and GIF files are allowed"
            )
            .refine(
                (f) => !f || (f instanceof File && f.size <= MAX_FILE_SIZE),
                "File size must be under 5 MB"
            ),
    })
    .refine(
        (data) => {
            if (!data.startTime || !data.endTime) return true;
            return new Date(data.endTime) > new Date(data.startTime);
        },
        {
            message: "End time must be after start time",
            path: ["endTime"],
        }
    );

// ---------------------------------------------------------------------------
// Loading Fallback
// ---------------------------------------------------------------------------
function LoadingFallback() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 flex items-center justify-center">
            <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-400 font-medium">Loading...</p>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Client Component
// ---------------------------------------------------------------------------
function UploadContentPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contentId = searchParams.get("contentId");

    const [createDraftContent, { isLoading: isCreating }] =
        useCreateDraftContentMutation();

    const [updateDraftContent, { isLoading: isUpdating }] =
        useUpdateDraftContentMutation();

    const { data: contentData, isLoading: isLoadingContent } =
        useGetContentByIdQuery(contentId, { skip: !contentId });

    const isLoading = isCreating || isUpdating;

    const getLocalDatetimeString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const [form, setForm] = useState({
        title: "",
        subject: "69fb86c5b2adc183989d23ff",
        description: "",
        startTime: getLocalDatetimeString(),
        endTime: "",
        rotationDuration: "",
        file: null,
    });

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [preview, setPreview] = useState("");

    // Pre-fill form when editing
    useEffect(() => {
        if (contentData?.data) {
            const content = contentData.data;

            // Format dates for datetime-local input (YYYY-MM-DDTHH:MM)
            const formatDate = (dateStr) => {
                if (!dateStr) return "";
                const date = new Date(dateStr);
                return date.toISOString().slice(0, 16);
            };

            setForm({
                title: content.title || "",
                subject: content.subject?._id || content.subject || "69fb86c5b2adc183989d23ff",
                description: content.description || "",
                startTime: formatDate(content.startTime),
                endTime: formatDate(content.endTime),
                rotationDuration: content.rotationDuration?.toString() || "",
                file: null, // Keep null unless user uploads a new one
            });

            if (content.files?.[0]?.url) {
                setPreview(content.files[0].url);
            }
        }
    }, [contentData]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "file" && files?.[0]) {
            setPreview(URL.createObjectURL(files[0]));
        }

        setForm((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));

        // Clear the error for the field being edited
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");

        const uploadSchema = createUploadSchema(!!contentId);
        const result = uploadSchema.safeParse(form);

        if (!result.success) {
            const flat = result.error.flatten();
            const fieldErrors = {};
            Object.entries(flat.fieldErrors).forEach(([key, msgs]) => {
                if (msgs?.[0]) fieldErrors[key] = msgs[0];
            });
            setErrors(fieldErrors);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("subject", form.subject);
            formData.append("description", form.description);
            formData.append("startTime", form.startTime);
            formData.append("endTime", form.endTime);
            formData.append("rotationDuration", form.rotationDuration);

            // Only append file if a new one was selected
            if (form.file) {
                formData.append("files", form.file);
            }

            if (contentId) {
                await updateDraftContent({
                    contentId,
                    formData,
                }).unwrap();
            } else {
                await createDraftContent(formData).unwrap();
            }
            router.push("/teacher/dashboard");
        } catch (err) {
            setSubmitError(err?.data?.message || "Failed to save draft. Please try again.");
        }
    };

    // Helper: renders an inline error message below a field
    const FieldError = ({ name }) =>
        errors[name] ? (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors[name]}
            </p>
        ) : null;

    if (contentId && isLoadingContent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-400 font-medium">Loading content details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 p-6">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Page header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {contentId ? "Update Content" : "Create Content"}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {contentId ? "Edit your draft and save changes" : "Fill in the details to create a new draft"}
                    </p>
                </div>

                {/* Form card */}
                <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Title */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Title <span className="text-red-400">*</span>
                                </label>
                                <Input
                                    name="title"
                                    placeholder="e.g. Chapter 3 – Photosynthesis"
                                    value={form.title}
                                    onChange={handleChange}
                                    className="rounded-xl border-gray-200 focus:border-blue-400 h-10"
                                />
                                <FieldError name="title" />
                            </div>


                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Description <span className="text-gray-300">(optional)</span>
                                </label>
                                <Textarea
                                    name="description"
                                    placeholder="Brief description of the content..."
                                    value={form.description}
                                    onChange={handleChange}
                                    className="rounded-xl border-gray-200 focus:border-blue-400 resize-none"
                                    rows={3}
                                />
                                <div className="flex justify-between items-center">
                                    <FieldError name="description" />
                                    <span className="text-xs text-gray-300 ml-auto">{form.description.length}/500</span>
                                </div>
                            </div>

                            {/* File upload */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    {contentId ? "Update File" : "Upload File"} <span className="text-red-400">{!contentId && "*"}</span>
                                </label>

                                {/* Preview */}
                                {preview && (
                                    <div className="relative w-full h-48 rounded-xl overflow-hidden ring-1 ring-gray-100 group">
                                        <Image
                                            src={preview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">Click below to replace</span>
                                        </div>
                                    </div>
                                )}

                                {/* Drop zone style wrapper */}
                                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-blue-50/50 hover:border-blue-300 transition-colors cursor-pointer py-6 px-4 group">
                                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                                        <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                                                {form.file ? form.file.name : "Click to upload an image"}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, JPEG, GIF · Max 5 MB</p>
                                        </div>
                                    </div>
                                    <Input
                                        type="file"
                                        name="file"
                                        accept="image/png,image/jpeg,image/jpg,image/gif"
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                </label>

                                {contentId && (
                                    <p className="text-xs text-gray-400">Leave empty to keep the existing file.</p>
                                )}
                                <FieldError name="file" />
                            </div>

                            {/* Start & End Time — side by side */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Start Time <span className="text-red-400">*</span>
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        name="startTime"
                                        value={form.startTime}
                                        onChange={handleChange}
                                        className="rounded-xl border-gray-200 focus:border-blue-400 h-10 text-sm"
                                    />
                                    <FieldError name="startTime" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        End Time <span className="text-red-400">*</span>
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        name="endTime"
                                        value={form.endTime}
                                        onChange={handleChange}
                                        className="rounded-xl border-gray-200 focus:border-blue-400 h-10 text-sm"
                                    />
                                    <FieldError name="endTime" />
                                </div>
                            </div>

                            {/* Rotation Duration */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Rotation Duration <span className="text-gray-300">(optional)</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        name="rotationDuration"
                                        placeholder="e.g. 30"
                                        value={form.rotationDuration}
                                        onChange={handleChange}
                                        min={1}
                                        className="rounded-xl border-gray-200 focus:border-blue-400 h-10 pr-14"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                                        sec
                                    </span>
                                </div>
                                <FieldError name="rotationDuration" />
                            </div>

                            {/* API-level submit error */}
                            {submitError && (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                                    <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-red-600">{submitError}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-blue-200 transition-all duration-200 disabled:opacity-60"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        {contentId ? "Updating..." : "Creating..."}
                                    </span>
                                ) : (
                                    contentId ? "Update Draft" : "Create Draft"
                                )}
                            </Button>

                        </form>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Export with Suspense wrapper
// ---------------------------------------------------------------------------
export default function UploadContentPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <UploadContentPageClient />
        </Suspense>
    );
}