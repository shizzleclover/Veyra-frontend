"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
    Building2,
    Trophy,
    Flame,
    FileText,
    Plus,
    ArrowRight,
    TrendingUp,
    Loader2,
} from "lucide-react";
import { CheckInButton } from "@/components/CheckInButton";

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

interface DashboardStats {
    communityCount: number;
    trackCount: number;
    maxStreak: number;
    submissionsThisWeek: number;
    totalTracksThisWeek: number;
    tracks: any[];
}

export default function DashboardPage() {
    const { getToken } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshTrack = (trackId: string) => {
        setStats(prev => {
            if (!prev) return null;
            return {
                ...prev,
                tracks: prev.tracks.map(t => {
                    if (t.id === trackId) {
                        return { ...t, hasCheckedInToday: true, currentStreak: (t.currentStreak || 0) + 1 };
                    }
                    return t;
                })
            };
        });
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = await getToken();
                const headers = { Authorization: `Bearer ${token}` };
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;

                // Fetch organizations count
                const orgsRes = await fetch(`${apiUrl}/api/organizations`, { headers });
                const orgsData = orgsRes.ok ? await orgsRes.json() : { organizations: [] };

                // Fetch my tracks
                const tracksRes = await fetch(`${apiUrl}/api/tracks/my-tracks`, { headers });
                const tracksData = tracksRes.ok ? await tracksRes.json() : { tracks: [] };

                // Calculate max streak from tracks
                let maxStreak = 0;
                const tracks = tracksData.tracks || [];
                tracks.forEach((t: any) => {
                    if (t.currentStreak > maxStreak) maxStreak = t.currentStreak;
                });

                setStats({
                    communityCount: orgsData.organizations?.length || 0,
                    trackCount: tracks.length,
                    maxStreak: maxStreak,
                    submissionsThisWeek: 0,
                    totalTracksThisWeek: tracks.length,
                    tracks: tracks,
                });
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setStats({
                    communityCount: 0,
                    trackCount: 0,
                    maxStreak: 0,
                    submissionsThisWeek: 0,
                    totalTracksThisWeek: 0,
                    tracks: [],
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        {
            label: "Communities",
            value: loading ? "..." : stats?.communityCount.toString() || "0",
            icon: Building2,
            color: "var(--primary)",
            href: "/orgs",
        },
        {
            label: "Active Tracks",
            value: loading ? "..." : stats?.trackCount.toString() || "0",
            icon: Trophy,
            color: "var(--secondary)",
            href: "/leaderboard",
        },
        {
            label: "Best Streak",
            value: loading ? "..." : stats?.maxStreak.toString() || "0",
            icon: Flame,
            color: "var(--accent)",
            suffix: "days",
        },
        {
            label: "This Week",
            value: loading ? "..." : `${stats?.submissionsThisWeek || 0}/${stats?.totalTracksThisWeek || 0}`,
            icon: FileText,
            color: "var(--chart-4)",
            suffix: "submitted",
        },
    ];

    const quickActions = [
        {
            label: "Create Community",
            icon: Building2,
            href: "/orgs",
            color: "var(--primary)",
        },
        {
            label: "View Leaderboards",
            icon: Trophy,
            href: "/leaderboard",
            color: "var(--secondary)",
        },
        {
            label: "Submit Progress",
            icon: Plus,
            href: "/orgs",
            color: "var(--accent)",
        },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Welcome */}
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl lg:text-4xl font-black mb-2">
                    Welcome back! 👋
                </h1>
                <p className="text-[var(--muted-foreground)]">
                    Here&apos;s what&apos;s happening with your tracks.
                </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                variants={containerVariants}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {statCards.map((stat) => (
                    <motion.div
                        key={stat.label}
                        variants={itemVariants}
                        className="card-brutalist p-6 group cursor-pointer"
                        whileHover={{ y: -4 }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className="w-12 h-12 flex items-center justify-center border-3 border-[var(--border)]"
                                style={{ backgroundColor: stat.color }}
                            >
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            {stat.href && (
                                <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </div>
                        <div className="text-3xl font-black">{stat.value}</div>
                        <div className="text-sm text-[var(--muted-foreground)]">
                            {stat.label}
                            {stat.suffix && (
                                <span className="ml-1 text-xs">({stat.suffix})</span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Active Tracks List */}
            <motion.div variants={itemVariants}>
                <h2 className="text-xl font-bold mb-4">My Active Tracks</h2>
                <div className="space-y-4">
                    {stats?.tracks?.map((track) => (
                        <div key={track.id} className="card-brutalist p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-black">{track.name}</h3>
                                <p className="text-sm text-[var(--muted-foreground)] mb-1">{track.organizationName}</p>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="flex items-center gap-1 font-bold text-[var(--accent)]">
                                        <Flame className="w-4 h-4" />
                                        {track.currentStreak} Day Streak
                                    </span>
                                    <span className="text-[var(--muted-foreground)]">•</span>
                                    <span>{track.memberCount} members</span>
                                </div>
                            </div>
                            <CheckInButton
                                trackId={track.id}
                                hasCheckedIn={track.hasCheckedInToday}
                                onCheckIn={() => refreshTrack(track.id)}
                            />
                        </div>
                    ))}
                    {loading && (
                        <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--muted-foreground)]" />
                        </div>
                    )}
                    {!loading && stats?.tracks?.length === 0 && (
                        <div className="card-brutalist p-8 text-center text-[var(--muted-foreground)]">
                            You haven't joined any tracks yet.
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                        <Link key={action.label} href={action.href}>
                            <motion.div
                                className="btn-brutalist p-6 bg-[var(--card)] flex items-center gap-4 cursor-pointer"
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div
                                    className="w-12 h-12 flex items-center justify-center border-3 border-[var(--border)]"
                                    style={{ backgroundColor: action.color }}
                                >
                                    <action.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-bold">{action.label}</span>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
