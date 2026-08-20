"use client";

import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import {
    useGetAllContentsQuery,
    useApproveContentMutation,
    useRejectContentMutation,
} from "@/services/content/contentApi";

export default function PrincipalDashboardPage() {
    const { user } = useSelector((state) => state.auth);

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
    const [page, setPage] = useState(1);

    const { data, isLoading } = useGetAllContentsQuery({
        status,
        search,
        page,
        limit: 10,
    });

    const [approveContent, { isLoading: isApproving }] = useApproveContentMutation();
    const [rejectContent, { isLoading: isRejecting }] = useRejectContentMutation();

    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [selectedContentId, setSelectedContentId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const handleApprove = async (contentId) => {
        if (!window.confirm("Are you sure you want to approve this content?")) return;
        try {
            await approveContent(contentId).unwrap();
        } catch (err) {
            console.error("Failed to approve:", err);
        }
    };

    const openRejectModal = (contentId) => {
        setSelectedContentId(contentId);
        setRejectionModalOpen(true);
    };

    const handleRejectSubmit = async () => {
        try {
            await rejectContent({
                contentId: selectedContentId,
                rejectionReason,
            }).unwrap();
            setRejectionModalOpen(false);
            setRejectionReason("");
            setSelectedContentId(null);
        } catch (err) {
            console.error("Failed to reject:", err);
        }
    };

    const contents = data?.data || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Page header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-sans">Principal Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Review and manage uploaded teacher content</p>
                </div>

                {/* Profile card */}
                <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
                    <CardContent className="p-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
                                {displayUser?.name?.[0]?.toUpperCase() || "P"}
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
                                    <span className="inline-block text-xs font-semibold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full capitalize">
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
                            placeholder="Search by title, subject or teacher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-9 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 transition-colors h-10 text-sm"
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
                            { val: "", label: "All Status", active: "bg-gray-800 text-white", inactive: "bg-gray-100 text-gray-500 hover:bg-gray-200" },
                            { val: "pending", label: "Pending", active: "bg-amber-500 text-white", inactive: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
                            { val: "approved", label: "Approved", active: "bg-green-500 text-white", inactive: "bg-green-50 text-green-600 hover:bg-green-100" },
                            { val: "rejected", label: "Rejected", active: "bg-red-500 text-white", inactive: "bg-red-50 text-red-500 hover:bg-red-100" },
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

                {/* Content List */}
                <div className="space-y-4">
                    {isLoading ? (
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
                                            <div className="h-6 w-16 bg-gray-100 rounded-full" />
                                        </div>
                                        <div className="h-44 bg-gray-100 rounded-xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : contents.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-gray-500">No content found</p>
                            <p className="text-xs text-gray-400 mt-1">Try adjusting search or status filters</p>
                        </div>
                    ) : (
                        contents.map((item) => {
                            const statusConfig = {
                                pending: { bar: "bg-amber-400", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-400" },
                                approved: { bar: "bg-green-500", badge: "bg-green-100 text-green-700", dot: "bg-green-500" },
                                rejected: { bar: "bg-red-500", badge: "bg-red-100 text-red-600", dot: "bg-red-500" },
                            };
                            const cfg = statusConfig[item.status] || { bar: "bg-gray-400", badge: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };

                            return (
                                <Card key={item._id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-2xl overflow-hidden group">
                                    <CardContent className="p-0 flex">

                                        {/* Status accent bar */}
                                        <div className={`w-1.5 shrink-0 ${cfg.bar} transition-all duration-200`} />

                                        <div className="flex-1 p-5 space-y-4">

                                            {/* Header row: thumbnail + title + status */}
                                            <div className="flex items-start gap-4">
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
                                                            <p className="text-xs text-blue-600 font-medium mt-0.5">{item.subject?.name}</p>
                                                        </div>
                                                        <span className={`inline-flex items-center gap-1.5 capitalize text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.badge}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description text */}
                                            {item.description && (
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            )}

                                            {/* Metadata grid */}
                                            <div className="grid grid-cols-2 gap-4 text-xs border-t border-b border-gray-100 py-3 bg-gray-50/50 rounded-xl px-3.5">
                                                <div>
                                                    <p className="text-gray-450 font-semibold uppercase tracking-wider mb-0.5 text-gray-400">Uploaded By</p>
                                                    <p className="font-semibold text-gray-800">{item.createdBy?.name}</p>
                                                    <p className="text-[10px] text-gray-400 truncate">{item.createdBy?.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-450 font-semibold uppercase tracking-wider mb-0.5 text-gray-400">Broadcast Schedule</p>
                                                    <p className="font-semibold text-gray-800">
                                                        {new Date(item.startTime).toLocaleDateString()} - {new Date(item.endTime).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Approval Request Notes */}
                                            {item.status === 'pending' && item.approvalRequests?.[0]?.note && (
                                                <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                                                    <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-xs font-semibold text-blue-800 mb-0.5">Request Note</p>
                                                        <p className="text-xs text-blue-700 italic">"{item.approvalRequests[0].note}"</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Rejection reason (if rejected) */}
                                            {item.status === 'rejected' && item.rejectionReason && (
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

                                            {/* Full image display */}
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

                                            {/* Actions footer */}
                                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
                                                {item.status === "pending" && (
                                                    <>
                                                        <Button
                                                            className="rounded-lg text-xs h-8 bg-green-600 hover:bg-green-700 text-white font-medium border-0"
                                                            onClick={() => handleApprove(item._id)}
                                                            disabled={isApproving}
                                                        >
                                                            ✓ Approve
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            className="rounded-lg text-xs h-8 font-medium"
                                                            onClick={() => openRejectModal(item._id)}
                                                            disabled={isRejecting}
                                                        >
                                                            ✗ Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </div>

                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Rejection Modal */}
            <Dialog open={rejectionModalOpen} onOpenChange={setRejectionModalOpen}>
                <DialogContent className="rounded-3xl border-0 shadow-2xl p-6 bg-white max-w-md overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />

                    <DialogHeader className="pt-2 text-center flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mb-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <DialogTitle className="text-xl font-bold text-gray-900">Reject Content</DialogTitle>
                        <p className="text-xs text-gray-500 max-w-xs mt-1">Please provide a feedback note so the teacher knows what to correct.</p>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Reason for Rejection</label>
                            <Textarea
                                placeholder="Describe the corrections needed..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="rounded-xl resize-none border-gray-200 focus:border-red-400 focus:ring-1 focus:ring-red-400/25 p-3 text-sm placeholder:text-gray-400"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 sm:flex-row flex-col-reverse justify-end mt-2">
                        <Button
                            variant="outline"
                            onClick={() => setRejectionModalOpen(false)}
                            className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600 h-11 px-6 font-medium text-sm transition-all"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectSubmit}
                            disabled={isRejecting || !rejectionReason.trim()}
                            className="rounded-xl h-11 px-6 text-sm font-medium"
                        >
                            {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}