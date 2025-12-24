"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    Trophy,
    ArrowLeft,
    Loader2,
    Flame,
    Users,
    Clock,
    Medal,
    Crown,
    TrendingUp,
    FileText,
    Plus,
    Shield,
    FileQuestion,
    BarChart2,
    Settings,
} from "lucide-react";

interface Track {
    id: string;
    name: string;
    description?: string;
    organization: {
        id: string;
        name: string;
    };
    currentWeek?: number;
    role?: string;
}

interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    baseScore: number;
    totalScore: number;
    currentStreak: number;
    streakMultiplier: number;
}

interface Submission {
    id: string;
    userId: string;
    userName?: string;
    week: number;
    status: string;
    createdAt: string;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1] as const,
        },
    },
};

export default function TrackDetailPage() {
    const params = useParams();
    const { getToken } = useAuth();
    const trackId = params.id as string;

    const [track, setTrack] = useState<Track | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"leaderboard" | "submissions">("leaderboard");
    const [userRole, setUserRole] = useState<string>("member");

    const fetchTrackData = async () => {
        try {
            const token = await getToken();
            const headers = { Authorization: `Bearer ${token}` };
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            // Fetch track details
            const trackRes = await fetch(`${apiUrl}/api/tracks/${trackId}`, { headers });
            if (!trackRes.ok) throw new Error("Failed to fetch track");
            const trackData = await trackRes.json();
            const trackInfo = trackData.data || trackData.track;
            setTrack(trackInfo);
            // Set user's role in this track
            if (trackInfo?.role) {
                setUserRole(trackInfo.role);
            }

            // Fetch leaderboard - correct route is /api/leaderboard/track/:trackId
            const leaderboardRes = await fetch(`${apiUrl}/api/leaderboard/track/${trackId}`, { headers });
            if (leaderboardRes.ok) {
                const leaderboardData = await leaderboardRes.json();
                setLeaderboard(leaderboardData.data?.leaderboard || leaderboardData.leaderboard || []);
            }

            // Fetch submissions - correct route is /api/submissions/track/:trackId
            const submissionsRes = await fetch(`${apiUrl}/api/submissions/track/${trackId}`, { headers });
            if (submissionsRes.ok) {
                const submissionsData = await submissionsRes.json();
                setSubmissions(submissionsData.data || submissionsData.submissions || []);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (trackId) fetchTrackData();
    }, [trackId]);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className="text-sm font-bold">{rank}</span>;
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return "bg-yellow-100 border-yellow-500";
        if (rank === 2) return "bg-gray-100 border-gray-400";
        if (rank === 3) return "bg-amber-100 border-amber-600";
        return "bg-[var(--muted)]";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    if (!track) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Track not found</h2>
                <Link href="/orgs" className="text-[var(--primary)] hover:underline">
                    Back to organizations
                </Link>
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
            {/* Back button */}
            <motion.div variants={itemVariants}>
                <Link
                    href={`/orgs/${track.organization?.id}`}
                    className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {track.organization?.name || "Community"}
                </Link>
            </motion.div>

            {/* Header */}
            <motion.div variants={itemVariants} className="card-brutalist p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 flex items-center justify-center bg-[var(--secondary)] border-3 border-[var(--border)]">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-black">{track.name}</h1>
                            {track.description && (
                                <p className="text-[var(--muted-foreground)]">{track.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] border-3 border-[var(--border)]">
                            <Clock className="w-4 h-4" />
                            <span className="font-bold">Week {track.currentWeek || 1}</span>
                        </div>
                        <Link
                            href={`/tracks/${trackId}/submit`}
                            className="btn-brutalist px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] font-bold flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Submit
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
                <Link
                    href={`/tracks/${trackId}/quizzes`}
                    className="btn-brutalist px-4 py-2 bg-[var(--chart-5)] text-white font-bold flex items-center gap-2"
                >
                    <FileQuestion className="w-4 h-4" />
                    Quizzes
                </Link>
                <Link
                    href={`/tracks/${trackId}/leaderboard`}
                    className="btn-brutalist px-4 py-2 bg-[var(--secondary)] font-bold flex items-center gap-2"
                >
                    <BarChart2 className="w-4 h-4" />
                    Full Leaderboard
                </Link>
                {(userRole === "owner" || userRole === "admin") && (
                    <>
                        <Link
                            href={`/tracks/${trackId}/admin`}
                            className="btn-brutalist px-4 py-2 bg-[var(--muted)] font-bold flex items-center gap-2"
                        >
                            <Shield className="w-4 h-4" />
                            Admin Panel
                        </Link>
                        <Link
                            href={`/tracks/${trackId}/settings`}
                            className="btn-brutalist px-4 py-2 bg-[var(--muted)] font-bold flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </Link>
                    </>
                )}
            </motion.div>

            {error && (
                <motion.div variants={itemVariants} className="card-brutalist p-4 bg-[var(--destructive)] text-[var(--destructive-foreground)]">
                    {error}
                </motion.div>
            )}

            {/* Tabs */}
            <motion.div variants={itemVariants} className="flex gap-2">
                <button
                    onClick={() => setActiveTab("leaderboard")}
                    className={`btn-brutalist px-6 py-3 font-bold ${activeTab === "leaderboard" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                        }`}
                >
                    <Trophy className="w-4 h-4 inline mr-2" />
                    Leaderboard
                </button>
                <button
                    onClick={() => setActiveTab("submissions")}
                    className={`btn-brutalist px-6 py-3 font-bold ${activeTab === "submissions" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                        }`}
                >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Submissions
                </button>
            </motion.div>

            {/* Leaderboard Tab */}
            {activeTab === "leaderboard" && (
                <motion.div variants={containerVariants} className="space-y-3">
                    {leaderboard.length === 0 ? (
                        <motion.div variants={itemVariants} className="card-brutalist p-8 text-center">
                            <Trophy className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                            <h3 className="text-xl font-bold mb-2">No rankings yet</h3>
                            <p className="text-[var(--muted-foreground)]">Submit your first entry to appear on the leaderboard</p>
                        </motion.div>
                    ) : (
                        leaderboard.map((entry, index) => (
                            <motion.div
                                key={entry.userId}
                                variants={itemVariants}
                                className={`card-brutalist p-4 flex items-center gap-4 ${getRankColor(entry.rank)}`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="w-10 h-10 flex items-center justify-center border-2 border-[var(--border)] bg-white">
                                    {getRankIcon(entry.rank)}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold">{entry.userName}</div>
                                    <div className="text-xs text-[var(--muted-foreground)]">
                                        Base: {entry.baseScore} pts
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {entry.currentStreak > 0 && (
                                        <div className="flex items-center gap-1 text-sm">
                                            <Flame className="w-4 h-4 text-orange-500" />
                                            <span>{entry.currentStreak}w</span>
                                        </div>
                                    )}
                                    {entry.streakMultiplier > 1 && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-[var(--secondary)] text-xs font-bold border border-[var(--border)]">
                                            <TrendingUp className="w-3 h-3" />
                                            {entry.streakMultiplier}x
                                        </div>
                                    )}
                                    <div className="text-xl font-black">{entry.totalScore}</div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            )}

            {/* Submissions Tab */}
            {activeTab === "submissions" && (
                <motion.div variants={containerVariants} className="space-y-3">
                    {submissions.length === 0 ? (
                        <motion.div variants={itemVariants} className="card-brutalist p-8 text-center">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                            <h3 className="text-xl font-bold mb-2">No submissions yet</h3>
                            <p className="text-[var(--muted-foreground)]">Be the first to submit this week!</p>
                        </motion.div>
                    ) : (
                        submissions.map((submission) => (
                            <motion.div
                                key={submission.id}
                                variants={itemVariants}
                                className="card-brutalist p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center bg-[var(--muted)] border-2 border-[var(--border)] font-bold">
                                        {submission.userName?.charAt(0) || "?"}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{submission.userName || "Unknown"}</div>
                                        <div className="text-xs text-[var(--muted-foreground)]">
                                            Week {submission.week} • {new Date(submission.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold border-2 border-[var(--border)] ${submission.status === "approved" ? "bg-green-100 text-green-800" :
                                    submission.status === "rejected" ? "bg-red-100 text-red-800" :
                                        "bg-yellow-100 text-yellow-800"
                                    }`}>
                                    {submission.status}
                                </span>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}
