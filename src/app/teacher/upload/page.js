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
    return <div className="p-10 text-center text-muted-foreground">Loading...</div>;
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

    const [form, setForm] = useState({
        title: "",
        subject: "69fb86c5b2adc183989d23ff",
        description: "",
        startTime: "",
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
            <p className="text-sm text-red-500 mt-1">{errors[name]}</p>
        ) : null;

    if (contentId && isLoadingContent) {
        return <div className="p-10 text-center text-muted-foreground">Loading content details...</div>;
    }

    return (
        <div className="p-6">
            <Card className="max-w-2xl mx-auto">
                <CardContent className="p-6">
                    <h1 className="text-2xl font-bold mb-6">
                        {contentId ? "Update Draft Content" : "Create Draft Content"}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Title */}
                        <div>
                            <Input
                                name="title"
                                placeholder="Title"
                                value={form.title}
                                onChange={handleChange}
                            />
                            <FieldError name="title" />
                        </div>

                        {/* Subject */}
                        <div>
                            <Input
                                name="subject"
                                placeholder="Subject ID"
                                value={form.subject}
                                onChange={handleChange}
                            />
                            <FieldError name="subject" />
                        </div>

                        {/* Description */}
                        <div>
                            <Textarea
                                name="description"
                                placeholder="Description (optional)"
                                value={form.description}
                                onChange={handleChange}
                            />
                            <FieldError name="description" />
                        </div>

                        {/* File */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {contentId ? "Update File" : "Upload File"}
                            </label>

                            {preview && (
                                <div className="relative w-full h-[200px] rounded-lg overflow-hidden border">
                                    <Image
                                        src={preview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}


                            <Input
                                type="file"
                                name="file"
                                accept="image/png,image/jpeg,image/jpg,image/gif"
                                onChange={handleChange}
                            />
                            {contentId && (
                                <p className="text-xs text-muted-foreground">
                                    Leave empty to keep existing file
                                </p>
                            )}
                            <FieldError name="file" />
                        </div>

                        {/* Start Time */}
                        <div>
                            <label className="text-sm text-muted-foreground">
                                Start Time
                            </label>
                            <Input
                                type="datetime-local"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleChange}
                            />
                            <FieldError name="startTime" />
                        </div>

                        {/* End Time */}
                        <div>
                            <label className="text-sm text-muted-foreground">
                                End Time
                            </label>
                            <Input
                                type="datetime-local"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleChange}
                            />
                            <FieldError name="endTime" />
                        </div>

                        {/* Rotation Duration */}
                        <div>
                            <Input
                                type="number"
                                name="rotationDuration"
                                placeholder="Rotation duration (seconds, optional)"
                                value={form.rotationDuration}
                                onChange={handleChange}
                                min={1}
                            />
                            <FieldError name="rotationDuration" />
                        </div>

                        {/* API-level submit error */}
                        {submitError && (
                            <p className="text-sm text-red-500">{submitError}</p>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading
                                ? contentId
                                    ? "Updating..."
                                    : "Creating..."
                                : contentId
                                    ? "Update Draft"
                                    : "Create Draft"}
                        </Button>

                    </form>
                </CardContent>
            </Card>
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