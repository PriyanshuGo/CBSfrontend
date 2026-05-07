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
        <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header & User Info */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold">Principal Dashboard</h1>
                        <p className="text-muted-foreground">Review and manage uploaded teacher content</p>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-6 grid gap-4 md:grid-cols-3">
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

                {/* Filters */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by title, subject or teacher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select
                        value={status}
                        onValueChange={(val) => setStatus(val === "all" ? "" : val)}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Content List */}
                <div className="grid gap-6">
                    {isLoading ? (
                        <div className="text-center p-10">Loading contents...</div>
                    ) : contents.length === 0 ? (
                        <div className="text-center p-10 text-muted-foreground">No content found.</div>
                    ) : (
                        contents.map((item) => (
                            <Card key={item._id} className="overflow-hidden">
                                <div className="md:flex">
                                    {/* Preview Image */}
                                    <div className="md:w-1/3 relative h-48 md:h-auto bg-muted">
                                        {item.files?.[0]?.url ? (
                                            <Image
                                                src={item.files[0].url}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                                No Preview
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="md:w-2/3 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h2 className="text-2xl font-bold">{item.title}</h2>
                                                    <p className="text-primary font-medium">{item.subject?.name}</p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${item.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {item.status}
                                                </div>
                                            </div>

                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                {item.description}
                                            </p>

                                            <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                                                <div>
                                                    <p className="text-muted-foreground">Teacher</p>
                                                    <p className="font-medium">{item.createdBy?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.createdBy?.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Broadcast Schedule</p>
                                                    <p className="font-medium">
                                                        {new Date(item.startTime).toLocaleDateString()} - {new Date(item.endTime).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {item.status === 'pending' && item.approvalRequests?.[0]?.note && (
                                                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
                                                    <p className="text-blue-800 font-semibold mb-1">Request Note:</p>
                                                    <p className="text-blue-700 italic">"{item.approvalRequests[0].note}"</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 mt-6">
                                            {item.status === "pending" && (
                                                <>
                                                    <Button
                                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleApprove(item._id)}
                                                        disabled={isApproving}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        className="flex-1"
                                                        onClick={() => openRejectModal(item._id)}
                                                        disabled={isRejecting}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Rejection Modal */}
            <Dialog open={rejectionModalOpen} onOpenChange={setRejectionModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Content</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-sm font-medium mb-2 block">Reason for rejection</label>
                        <Textarea
                            placeholder="Please provide a reason for rejecting this content..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectionModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectSubmit}
                            disabled={isRejecting || !rejectionReason.trim()}
                        >
                            {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}