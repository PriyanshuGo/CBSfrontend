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
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <h2 className="text-xl font-semibold">{displayUser?.name}</h2>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <h2 className="text-lg">{displayUser?.email}</h2>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Role</p>
                            <h2 className="text-lg capitalize">{displayUser?.role?.name}</h2>
                        </div>
                    </CardContent>
                </Card>
                <div className="mt-4">
                    <Link href="/teacher/upload">
                        <Button>Create Content</Button>
                    </Link>
                </div>
            </div>

            <div className="flex gap-4 mb-6 mt-8">
                <Input
                    placeholder="Search content..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                    value={status}
                    onValueChange={(val) => setStatus(val === "all" ? "" : val)}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-5">
                {isLoading && <p>Loading contents...</p>}
                {!isLoading && contents.map((item) => (
                    <Card key={item._id}>
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold">{item.title}</h2>
                                    <p className="text-muted-foreground">{item.subject?.name}</p>
                                </div>
                                <div className="capitalize text-sm font-medium px-3 py-1 bg-muted rounded-full">
                                    {item.status}
                                </div>
                                <div className="flex gap-2">
                                    {item.status === "draft" && (
                                        <Link href={`/teacher/upload?contentId=${item._id}`}>
                                            <Button variant="outline" size="sm">Edit</Button>
                                        </Link>
                                    )}
                                    {item.status === "draft" && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => openApprovalModal(item._id)}
                                        >
                                            Send For Approval
                                        </Button>
                                    )}
                                    {item.status === "rejected" && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => openApprovalModal(item._id)}
                                        >
                                            Request Again
                                        </Button>
                                    )}
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={isDeleting}
                                        onClick={() => handleDelete(item._id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>

                            {item.status === "rejected" && item.rejectionReason && (
                                <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-md text-sm">
                                    <p className="text-red-800 font-semibold mb-1">Rejection Reason:</p>
                                    <p className="text-red-700 italic">"{item.rejectionReason}"</p>
                                </div>
                            )}

                            {item.files?.[0]?.url && (
                                <div className="relative w-full h-[250px] rounded-lg overflow-hidden border">
                                    <Image
                                        src={item.files[0].url}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Content For Approval</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            placeholder="Approval request note"
                            value={approvalForm.approvalRequestNote}
                            onChange={(e) => setApprovalForm((prev) => ({
                                ...prev,
                                approvalRequestNote: e.target.value,
                            }))}
                        />
                        <Input
                            placeholder="Changes summary"
                            value={approvalForm.changesSummary}
                            onChange={(e) => setApprovalForm((prev) => ({
                                ...prev,
                                changesSummary: e.target.value,
                            }))}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApprovalModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            disabled={isRequestingApproval || !approvalForm.approvalRequestNote}
                            onClick={handleApprovalSubmit}
                        >
                            {isRequestingApproval ? "Submitting..." : "Submit Request"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}