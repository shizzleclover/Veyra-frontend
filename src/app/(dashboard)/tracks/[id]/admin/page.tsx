"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    ArrowLeft,
    Shield,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    Eye,
    Ban,
    UserCheck,
    FileText,
    Image as ImageIcon,
    ExternalLink,
} from "lucide-react";

interface Submission {
    id: string;
    user?: {
        id?: string;
        email?: string;
        displayName?: string;
        avatarUrl?: string;
    };
    weekStart?: string;
    weekEnd?: string;
    description?: string;
    proofUrl?: string;
    proofType?: string;
    // Legacy fields for backwards compatibility
    week?: number;
    type?: string;
    content?: string;
    imageUrl?: string;
    status?: string;
    createdAt: string;
}

interface TrackMember {
    userId: string;
    displayName?: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
    joinedAt?: string;
    isBanned?: boolean;
    currentStreak?: number;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
    },
};

export default function TrackAdminPage() {
    const params = useParams();
    const { getToken } = useAuth();
    const trackId = params.id as string;

    const [activeTab, setActiveTab] = useState<"pending" | "members">("pending");
    const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
    const [members, setMembers] = useState<TrackMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);
    const [viewSubmission, setViewSubmission] = useState<Submission | null>(null);

    const fetchData = async () => {
        try {
            const token = await getToken();
            const headers = { Authorization: `Bearer ${token}` };
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            // Fetch pending submissions
            const subsRes = await fetch(`${apiUrl}/api/submissions/track/${trackId}/pending`, { headers });
            if (subsRes.ok) {
                const data = await subsRes.json();
                setPendingSubmissions(data.data || data.submissions || []);
            }

            // Fetch members
            const membersRes = await fetch(`${apiUrl}/api/tracks/${trackId}/members`, { headers });
            if (membersRes.ok) {
                const data = await membersRes.json();
                setMembers(data.data || data.members || []);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [trackId]);

    const handleVerify = async (submissionId: string, approved: boolean) => {
        setProcessing(submissionId);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/${submissionId}/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: approved ? "approved" : "rejected" }),
            });
            if (res.ok) {
                setPendingSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
            } else {
                const data = await res.json();
                setError(data.error || "Failed to verify submission");
            }
        } catch (err) {
            setError("Failed to verify submission");
        } finally {
            setProcessing(null);
        }
    };

    const handleBan = async (userId: string, ban: boolean) => {
        setProcessing(userId);
        try {
            const token = await getToken();
            const endpoint = ban ? "ban" : "unban";
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${trackId}/members/${userId}/${endpoint}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            setMembers((prev) =>
                prev.map((m) => (m.userId === userId ? { ...m, isBanned: ban } : m))
            );
        } catch (err) {
            setError(`Failed to ${ban ? "ban" : "unban"} user`);
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Back */}
            <motion.div variants={itemVariants}>
                <Link
                    href={`/tracks/${trackId}`}
                    className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Track
                </Link>
            </motion.div>

            {/* Header */}
            <motion.div variants={itemVariants} className="card-brutalist p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 flex items-center justify-center bg-[var(--primary)] border-3 border-[var(--border)]">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black">Track Admin</h1>
                        <p className="text-[var(--muted-foreground)]">Manage submissions and members</p>
                    </div>
                </div>
            </motion.div>

            {error && (
                <motion.div variants={itemVariants} className="card-brutalist p-4 bg-red-100 text-red-800">
                    {error}
                </motion.div>
            )}

            {/* Tabs */}
            <motion.div variants={itemVariants} className="flex gap-2">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`btn-brutalist px-6 py-3 font-bold flex items-center gap-2 ${activeTab === "pending" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                        }`}
                >
                    <Clock className="w-4 h-4" />
                    Pending ({pendingSubmissions.length})
                </button>
                <button
                    onClick={() => setActiveTab("members")}
                    className={`btn-brutalist px-6 py-3 font-bold flex items-center gap-2 ${activeTab === "members" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                        }`}
                >
                    <UserCheck className="w-4 h-4" />
                    Members ({members.length})
                </button>
            </motion.div>

            {/* Pending Submissions */}
            {activeTab === "pending" && (
                <motion.div variants={containerVariants} className="space-y-3">
                    {pendingSubmissions.length === 0 ? (
                        <motion.div variants={itemVariants} className="card-brutalist p-8 text-center">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                            <h3 className="text-xl font-bold mb-2">All caught up!</h3>
                            <p className="text-[var(--muted-foreground)]">No pending submissions</p>
                        </motion.div>
                    ) : (
                        pendingSubmissions.map((sub) => (
                            <motion.div
                                key={sub.id}
                                variants={itemVariants}
                                className="card-brutalist p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 flex items-center justify-center bg-[var(--muted)] border-2 border-[var(--border)] font-bold">
                                            {sub.user?.displayName?.charAt(0) || sub.user?.email?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{sub.user?.displayName || sub.user?.email || "Unknown"}</div>
                                            <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-2">
                                                <span>{sub.weekStart ? new Date(sub.weekStart).toLocaleDateString() : 'Pending'}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    {sub.proofType === "image" && <ImageIcon className="w-3 h-3" />}
                                                    {sub.proofType === "file" && <FileText className="w-3 h-3" />}
                                                    {sub.proofType === "link" && <ExternalLink className="w-3 h-3" />}
                                                    {sub.proofType || "text"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setViewSubmission(sub)}
                                            className="btn-brutalist p-2 bg-[var(--muted)]"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleVerify(sub.id, true)}
                                            disabled={processing === sub.id}
                                            className="btn-brutalist px-3 py-2 bg-green-500 text-white flex items-center gap-1"
                                            title="Approve (+10 points)"
                                        >
                                            {processing === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /><span className="text-xs font-bold">+10</span></>}
                                        </button>
                                        <button
                                            onClick={() => handleVerify(sub.id, false)}
                                            disabled={processing === sub.id}
                                            className="btn-brutalist p-2 bg-red-500 text-white"
                                            title="Reject"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            )}

            {/* Members */}
            {activeTab === "members" && (
                <motion.div variants={containerVariants} className="card-brutalist divide-y divide-[var(--border)]">
                    {members.length === 0 ? (
                        <div className="p-8 text-center text-[var(--muted-foreground)]">
                            No members yet
                        </div>
                    ) : (
                        members.map((member) => (
                            <div key={member.userId} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 flex items-center justify-center border-2 border-[var(--border)] font-bold ${member.isBanned ? "bg-red-100" : "bg-[var(--muted)]"}`}>
                                        {member.displayName?.charAt(0) || member.email?.charAt(0) || "?"}
                                    </div>
                                    <div>
                                        <div className="font-semibold flex items-center gap-2">
                                            {member.displayName || member.email || "Unknown"}
                                            {member.isBanned && (
                                                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 border border-red-300">BANNED</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-[var(--muted-foreground)]">
                                            {member.role || 'member'}{member.currentStreak ? ` • ${member.currentStreak} week streak` : ''}
                                        </div>
                                    </div>
                                </div>
                                {member.role !== "owner" && (
                                    <button
                                        onClick={() => handleBan(member.userId, !member.isBanned)}
                                        disabled={processing === member.userId}
                                        className={`btn-brutalist px-3 py-2 text-sm font-bold flex items-center gap-1 ${member.isBanned ? "bg-green-500 text-white" : "bg-red-500 text-white"
                                            }`}
                                    >
                                        {processing === member.userId ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : member.isBanned ? (
                                            <>
                                                <UserCheck className="w-4 h-4" />
                                                Unban
                                            </>
                                        ) : (
                                            <>
                                                <Ban className="w-4 h-4" />
                                                Ban
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </motion.div>
            )}

            {/* View Submission Modal */}
            {viewSubmission && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-brutalist p-6 w-full max-w-lg max-h-[80vh] overflow-auto"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold">Submission Details</h3>
                            <button onClick={() => setViewSubmission(null)}>
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <span className="text-sm text-[var(--muted-foreground)]">From:</span>
                                <p className="font-semibold">{viewSubmission.user?.displayName || viewSubmission.user?.email || 'Unknown'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-[var(--muted-foreground)]">Submitted:</span>
                                <p className="font-semibold">{viewSubmission.weekStart ? new Date(viewSubmission.weekStart).toLocaleDateString() : 'Pending'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-[var(--muted-foreground)]">Description:</span>
                                <p className="mt-2 p-4 bg-[var(--muted)] border-3 border-[var(--border)]">{viewSubmission.description || 'No description'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-[var(--muted-foreground)]">Proof:</span>
                                {viewSubmission.proofType === "image" && viewSubmission.proofUrl && (
                                    <img src={viewSubmission.proofUrl} alt="Submission" className="mt-2 max-w-full border-3 border-[var(--border)]" />
                                )}
                                {viewSubmission.proofType === "link" && viewSubmission.proofUrl && (
                                    <a
                                        href={viewSubmission.proofUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 text-[var(--accent)] hover:underline flex items-center gap-1 block"
                                    >
                                        {viewSubmission.proofUrl}
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    handleVerify(viewSubmission.id, true);
                                    setViewSubmission(null);
                                }}
                                className="btn-brutalist flex-1 py-3 bg-green-500 text-white font-bold flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Approve
                            </button>
                            <button
                                onClick={() => {
                                    handleVerify(viewSubmission.id, false);
                                    setViewSubmission(null);
                                }}
                                className="btn-brutalist flex-1 py-3 bg-red-500 text-white font-bold flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-5 h-5" />
                                Reject
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
