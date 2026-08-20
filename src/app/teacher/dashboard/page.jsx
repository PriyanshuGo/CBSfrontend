"use client";

import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import {
    useGetMyContentsQuery,
    useDeleteMyContentMutation,
    useRequestContentApprovalMutation
} from "@/services/content/contentApi";
import {
    Card,
    CardContent,
} from "@/components/ui/card";

export default function TeacherDashboardPage() {

    const { user } = useSelector(
        (state) => state.auth
    );
    const [deleteMyContent, { isLoading: isDeleting }] =
        useDeleteMyContentMutation();
    const [
        requestContentApproval,
        { isLoading: isRequestingApproval },
    ] = useRequestContentApprovalMutation();

    const [approvalModalOpen, setApprovalModalOpen] =
        useState(false);

    const [selectedContentId, setSelectedContentId] =
        useState(null);

    const [approvalForm, setApprovalForm] =
        useState({
            approvalRequestNote: "",
            changesSummary: "",
        });

    // Rehydrate user from localStorage on reload
    const [localUser, setLocalUser] = useState(null);
    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            setLocalUser(JSON.parse(stored));
        }
    }, []);

    const displayUser = user || localUser;

    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");

    const {
        data,
        isLoading,
    } = useGetMyContentsQuery({
        status,
        search,
        page: 1,
        limit: 10,
    });

    const handleDelete = async (contentId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this content?"
        );
        if (!confirmDelete) return;
        await deleteMyContent(contentId).unwrap();
    };

    const openApprovalModal = (contentId) => {
        setSelectedContentId(contentId);
        setApprovalModalOpen(true);
    };

    const handleApprovalSubmit = async () => {
        await requestContentApproval({
            contentId: selectedContentId,
            approvalRequestNote: approvalForm.approvalRequestNote,
            changesSummary: approvalForm.changesSummary,
        }).unwrap();

        setApprovalModalOpen(false);
        setSelectedContentId(null);
        setApprovalForm({
            approvalRequestNote: "",
            changesSummary: "",
        });
    };

    const contents = data?.data || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage your content and submissions</p>
                    </div>
                    <Link href="/teacher/upload">
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-200 rounded-xl px-5">
                            + Create Content
                        </Button>
                    </Link>
                </div>

                {/* Profile card */}
                <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
                    <CardContent className="p-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
                                {displayUser?.name?.[0]?.toUpperCase() || "T"}
                            </div>
                            <div className="flex-1 grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Name</p>
                                    <p className="text-sm font-semibold text-gray-800">{displayUser?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Email</p>
                                    <p className="text-sm text-gray-700 truncate">{displayUser?.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Role</p>
                                    <span className="inline-block text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full capitalize">
                                        {displayUser?.role?.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Search & filter bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 space-y-3">

                    {/* Search input */}
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <Input
                            placeholder="Search content..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-9 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 transition-colors h-10"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Status filter chips */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Filter:</span>
                        {[
                            { val: "",         label: "All",      active: "bg-gray-800 text-white",   inactive: "bg-gray-100 text-gray-500 hover:bg-gray-200" },
                            { val: "draft",    label: "Draft",    active: "bg-gray-500 text-white",   inactive: "bg-gray-100 text-gray-500 hover:bg-gray-200" },
                            { val: "pending",  label: "Pending",  active: "bg-amber-500 text-white",  inactive: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
                            { val: "approved", label: "Approved", active: "bg-green-500 text-white",  inactive: "bg-green-50 text-green-600 hover:bg-green-100" },
                            { val: "rejected", label: "Rejected", active: "bg-red-500 text-white",    inactive: "bg-red-50 text-red-500 hover:bg-red-100" },
                        ].map(({ val, label, active, inactive }) => (
                            <button
                                key={val}
                                onClick={() => setStatus(val === status ? "" : val)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150 ${status === val ? active : inactive}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                </div>

                {/* Content list */}
                <div className="space-y-4">
                    {isLoading && (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="rounded-2xl bg-white shadow-md overflow-hidden animate-pulse flex">
                                    <div className="w-1.5 bg-gray-200 shrink-0" />
                                    <div className="flex-1 p-5 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <div className="h-5 w-52 bg-gray-200 rounded-lg" />
                                                <div className="h-3 w-32 bg-gray-100 rounded-lg" />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="h-6 w-16 bg-gray-100 rounded-full" />
                                                <div className="h-6 w-24 bg-gray-100 rounded-lg" />
                                            </div>
                                        </div>
                                        <div className="h-44 bg-gray-100 rounded-xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && contents.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-gray-500">No content found</p>
                            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or create new content</p>
                        </div>
                    )}

                    {!isLoading && contents.map((item) => {
                        const statusConfig = {
                            draft: { bar: "bg-gray-400", badge: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
                            pending: { bar: "bg-amber-400", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-400" },
                            approved: { bar: "bg-green-500", badge: "bg-green-100 text-green-700", dot: "bg-green-500" },
                            rejected: { bar: "bg-red-500", badge: "bg-red-100 text-red-600", dot: "bg-red-500" },
                        };
                        const cfg = statusConfig[item.status] || statusConfig.draft;

                        return (
                            <Card key={item._id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-2xl overflow-hidden group">
                                <CardContent className="p-0 flex">

                                    {/* Status accent bar */}
                                    <div className={`w-1.5 shrink-0 ${cfg.bar} transition-all duration-200`} />

                                    <div className="flex-1 p-5 space-y-4">

                                        {/* Header: title + status + thumbnail */}
                                        <div className="flex items-start gap-4">
                                            {/* Thumbnail */}
                                            {item.files?.[0]?.url && (
                                                <div className="relative w-16 h-16 rounded-xl overflow-hidden ring-1 ring-gray-100 shrink-0">
                                                    <Image
                                                        src={item.files[0].url}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h2 className="text-base font-semibold text-gray-900 truncate leading-snug">{item.title}</h2>
                                                        <p className="text-xs text-gray-400 mt-0.5">{item.subject?.name}</p>
                                                    </div>
                                                    {/* Status badge */}
                                                    <span className={`inline-flex items-center gap-1.5 capitalize text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.badge}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rejection reason */}
                                        {item.status === "rejected" && item.rejectionReason && (
                                            <div className="flex gap-2.5 bg-red-50 border border-red-100 rounded-xl p-3.5">
                                                <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <p className="text-xs font-semibold text-red-700 mb-0.5">Rejection Reason</p>
                                                    <p className="text-xs text-red-600 italic">"{item.rejectionReason}"</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Full image */}
                                        {item.files?.[0]?.url && (
                                            <div className="relative w-full h-[220px] rounded-xl overflow-hidden ring-1 ring-gray-100">
                                                <Image
                                                    src={item.files[0].url}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        )}

                                        {/* Action footer */}
                                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
                                            {item.status === "draft" && (
                                                <Link href={`/teacher/upload?contentId=${item._id}`}>
                                                    <Button variant="outline" size="sm" className="rounded-lg text-xs h-8 border-gray-200 hover:border-blue-300 hover:text-blue-600">
                                                        ✏️ Edit
                                                    </Button>
                                                </Link>
                                            )}
                                            {item.status === "draft" && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openApprovalModal(item._id)}
                                                    className="rounded-lg text-xs h-8 bg-blue-50 text-blue-700 hover:bg-blue-100 border-0"
                                                >
                                                    🚀 Send For Approval
                                                </Button>
                                            )}
                                            {item.status === "rejected" && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openApprovalModal(item._id)}
                                                    className="rounded-lg text-xs h-8 bg-amber-50 text-amber-700 hover:bg-amber-100 border-0"
                                                >
                                                    🔄 Request Again
                                                </Button>
                                            )}
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={isDeleting}
                                                onClick={() => handleDelete(item._id)}
                                                className="rounded-lg text-xs h-8"
                                            >
                                                Delete
                                            </Button>
                                        </div>

                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>


            </div>

            {/* Approval modal */}
            <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
                <DialogContent className="rounded-3xl border-0 shadow-2xl p-6 bg-white max-w-md overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                    
                    <DialogHeader className="pt-2 text-center flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg mb-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>
                        <DialogTitle className="text-xl font-bold text-gray-900">Request Approval</DialogTitle>
                        <p className="text-xs text-gray-500 max-w-xs mt-1">Submit your content to the principal for review and publishing.</p>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Approval Request Note</label>
                                <span className="text-[10px] text-gray-400 font-medium">Required</span>
                            </div>
                            <Textarea
                                placeholder="Write a short note for the principal (e.g., 'Please review the science quiz content')..."
                                value={approvalForm.approvalRequestNote}
                                onChange={(e) => setApprovalForm((prev) => ({
                                    ...prev,
                                    approvalRequestNote: e.target.value,
                                }))}
                                className="rounded-xl resize-none border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/25 p-3 text-sm placeholder:text-gray-400"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Changes Summary</label>
                            <Input
                                placeholder="e.g., Fixed typos, updated images..."
                                value={approvalForm.changesSummary}
                                onChange={(e) => setApprovalForm((prev) => ({
                                    ...prev,
                                    changesSummary: e.target.value,
                                }))}
                                className="rounded-xl border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/25 h-11 text-sm placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 sm:flex-row flex-col-reverse justify-end mt-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setApprovalModalOpen(false)} 
                            className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600 h-11 px-6 font-medium text-sm transition-all"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isRequestingApproval || !approvalForm.approvalRequestNote}
                            onClick={handleApprovalSubmit}
                            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md shadow-blue-200/50 hover:shadow-lg transition-all h-11 px-6 text-sm"
                        >
                            {isRequestingApproval ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Submitting...
                                </span>
                            ) : (
                                "Send Request"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
