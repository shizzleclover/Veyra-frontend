"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
    Trophy,
    ArrowLeft,
    Loader2,
    Flame,
    Medal,
    Crown,
    TrendingUp,
} from "lucide-react";

interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    userEmail?: string;
    baseScore: number;
    totalScore: number;
    currentStreak: number;
    longestStreak: number;
    streakMultiplier: number;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
    },
};

export default function LeaderboardPage() {
    const params = useParams();
    const { getToken } = useAuth();
    const trackId = params.id as string;

    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [trackName, setTrackName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getToken();
                const headers = { Authorization: `Bearer ${token}` };
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;

                // Fetch track
                const trackRes = await fetch(`${apiUrl}/api/tracks/${trackId}`, { headers });
                if (trackRes.ok) {
                    const data = await trackRes.json();
                    setTrackName(data.track?.name || "Track");
                }

                // Fetch leaderboard
                const res = await fetch(`${apiUrl}/api/tracks/${trackId}/leaderboard`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    setLeaderboard(data.leaderboard || []);
                }
            } catch (err) {
                console.error("Failed to fetch leaderboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [trackId]);

    const getRankStyle = (rank: number) => {
        if (rank === 1) return "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400";
        if (rank === 2) return "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400";
        if (rank === 3) return "bg-gradient-to-r from-amber-100 to-amber-200 border-amber-500";
        return "";
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-8 h-8 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-7 h-7 text-gray-400" />;
        if (rank === 3) return <Medal className="w-7 h-7 text-amber-600" />;
        return <span className="text-2xl font-black">{rank}</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    // Top 3 for podium
    const podium = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

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
            <motion.div variants={itemVariants} className="text-center py-8">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-[var(--secondary)]" />
                <h1 className="text-3xl font-black mb-2">{trackName} Leaderboard</h1>
                <p className="text-[var(--muted-foreground)]">Top performers this season</p>
            </motion.div>

            {/* Podium */}
            {podium.length > 0 && (
                <motion.div variants={itemVariants} className="flex justify-center items-end gap-4 py-8">
                    {/* 2nd place */}
                    {podium[1] && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center"
                        >
                            <div className="w-20 h-20 mx-auto mb-2 flex items-center justify-center bg-gray-200 border-4 border-gray-400 rounded-full">
                                {getRankIcon(2)}
                            </div>
                            <div className="font-bold truncate max-w-[100px]">{podium[1].userName}</div>
                            <div className="text-2xl font-black">{podium[1].totalScore}</div>
                            <div className="w-20 h-24 bg-gray-300 mx-auto mt-2 flex items-center justify-center border-3 border-[var(--border)]">
                                <span className="text-4xl font-black">2</span>
                            </div>
                        </motion.div>
                    )}

                    {/* 1st place */}
                    {podium[0] && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <div className="w-24 h-24 mx-auto mb-2 flex items-center justify-center bg-yellow-200 border-4 border-yellow-400 rounded-full">
                                {getRankIcon(1)}
                            </div>
                            <div className="font-bold truncate max-w-[120px]">{podium[0].userName}</div>
                            <div className="text-3xl font-black">{podium[0].totalScore}</div>
                            {podium[0].currentStreak > 0 && (
                                <div className="flex items-center justify-center gap-1 mt-1">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm">{podium[0].currentStreak}w</span>
                                </div>
                            )}
                            <div className="w-24 h-32 bg-yellow-300 mx-auto mt-2 flex items-center justify-center border-3 border-[var(--border)]">
                                <span className="text-5xl font-black">1</span>
                            </div>
                        </motion.div>
                    )}

                    {/* 3rd place */}
                    {podium[2] && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-center"
                        >
                            <div className="w-18 h-18 mx-auto mb-2 flex items-center justify-center bg-amber-200 border-4 border-amber-500 rounded-full" style={{ width: 72, height: 72 }}>
                                {getRankIcon(3)}
                            </div>
                            <div className="font-bold truncate max-w-[100px]">{podium[2].userName}</div>
                            <div className="text-xl font-black">{podium[2].totalScore}</div>
                            <div className="w-18 h-16 bg-amber-300 mx-auto mt-2 flex items-center justify-center border-3 border-[var(--border)]" style={{ width: 72 }}>
                                <span className="text-3xl font-black">3</span>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Rest of leaderboard */}
            <motion.div variants={containerVariants} className="space-y-2">
                {rest.map((entry, index) => (
                    <motion.div
                        key={entry.userId}
                        variants={itemVariants}
                        className={`card-brutalist p-4 flex items-center gap-4 ${getRankStyle(entry.rank)}`}
                    >
                        <div className="w-12 h-12 flex items-center justify-center border-3 border-[var(--border)] bg-white font-black text-lg">
                            {entry.rank}
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
                            <div className="text-2xl font-black">{entry.totalScore}</div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {leaderboard.length === 0 && (
                <div className="text-center py-12">
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                    <h3 className="text-xl font-bold mb-2">No rankings yet</h3>
                    <p className="text-[var(--muted-foreground)]">Be the first to submit!</p>
                </div>
            )}
        </motion.div>
    );
}
