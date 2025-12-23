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
    Medal,
    Crown,
    TrendingUp,
    Filter,
} from "lucide-react";

interface Track {
    id: string;
    name: string;
}

interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    baseScore: number;
    totalScore: number;
    currentStreak: number;
    streakMultiplier: number;
    trackName?: string;
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
        transition: { duration: 0.3 },
    },
};

export default function CommunityLeaderboardPage() {
    const params = useParams();
    const { getToken } = useAuth();
    const orgId = params.id as string;

    const [orgName, setOrgName] = useState("");
    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedTrackId, setSelectedTrackId] = useState<string>("all");
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getToken();
                const headers = { Authorization: `Bearer ${token}` };
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;

                // Fetch org details
                const orgRes = await fetch(`${apiUrl}/api/organizations/${orgId}`, { headers });
                if (orgRes.ok) {
                    const orgData = await orgRes.json();
                    setOrgName(orgData.organization?.name || "Community");
                }

                // Fetch tracks in org
                const tracksRes = await fetch(`${apiUrl}/api/tracks/org/${orgId}`, { headers });
                if (tracksRes.ok) {
                    const tracksData = await tracksRes.json();
                    setTracks(tracksData.data || []);

                    // Aggregate leaderboard from all tracks
                    const allEntries: LeaderboardEntry[] = [];
                    for (const track of tracksData.data || []) {
                        const lbRes = await fetch(`${apiUrl}/api/tracks/${track.id}/leaderboard`, { headers });
                        if (lbRes.ok) {
                            const lbData = await lbRes.json();
                            const entries = (lbData.leaderboard || []).map((e: any) => ({
                                ...e,
                                trackName: track.name,
                            }));
                            allEntries.push(...entries);
                        }
                    }

                    // Combine scores by userId
                    const scoreMap = new Map<string, LeaderboardEntry>();
                    allEntries.forEach((entry) => {
                        const existing = scoreMap.get(entry.userId);
                        if (existing) {
                            existing.totalScore += entry.totalScore;
                            existing.baseScore += entry.baseScore;
                            if (entry.currentStreak > existing.currentStreak) {
                                existing.currentStreak = entry.currentStreak;
                                existing.streakMultiplier = entry.streakMultiplier;
                            }
                        } else {
                            scoreMap.set(entry.userId, { ...entry });
                        }
                    });

                    // Sort and rank
                    const combined = Array.from(scoreMap.values())
                        .sort((a, b) => b.totalScore - a.totalScore)
                        .map((entry, index) => ({ ...entry, rank: index + 1 }));

                    setLeaderboard(combined);
                }
            } catch (err) {
                console.error("Failed to fetch leaderboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [orgId]);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className="font-black">{rank}</span>;
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400";
        if (rank === 2) return "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400";
        if (rank === 3) return "bg-gradient-to-r from-amber-100 to-amber-200 border-amber-500";
        return "";
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
                    href={`/orgs/${orgId}`}
                    className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {orgName}
                </Link>
            </motion.div>

            {/* Header */}
            <motion.div variants={itemVariants} className="text-center py-6">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-[var(--primary)]" />
                <h1 className="text-3xl font-black mb-2">{orgName} Leaderboard</h1>
                <p className="text-[var(--muted-foreground)]">Combined rankings across all tracks</p>
            </motion.div>

            {/* Leaderboard */}
            <motion.div variants={containerVariants} className="space-y-2">
                {leaderboard.length === 0 ? (
                    <motion.div variants={itemVariants} className="card-brutalist p-8 text-center">
                        <Trophy className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                        <h3 className="text-xl font-bold mb-2">No rankings yet</h3>
                        <p className="text-[var(--muted-foreground)]">Members need to submit progress!</p>
                    </motion.div>
                ) : (
                    leaderboard.map((entry) => (
                        <motion.div
                            key={entry.userId}
                            variants={itemVariants}
                            className={`card-brutalist p-4 flex items-center gap-4 ${getRankColor(entry.rank)}`}
                        >
                            <div className="w-12 h-12 flex items-center justify-center border-3 border-[var(--border)] bg-white">
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
                                        <span>{entry.currentStreak}d</span>
                                    </div>
                                )}
                                {entry.streakMultiplier > 1 && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-[var(--secondary)] text-xs font-bold border border-[var(--border)]">
                                        <TrendingUp className="w-3 h-3" />
                                        {entry.streakMultiplier.toFixed(2)}x
                                    </div>
                                )}
                                <div className="text-2xl font-black">{Math.round(entry.totalScore)}</div>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </motion.div>
    );
}
