"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    Building2,
    Trophy,
    Flame,
    FileText,
    Plus,
    ArrowRight,
    TrendingUp,
} from "lucide-react";

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
            ease: "easeOut",
        },
    },
};

export default function DashboardPage() {
    // TODO: Fetch real data from API
    const stats = [
        {
            label: "Organizations",
            value: "3",
            icon: Building2,
            color: "var(--primary)",
            href: "/orgs",
        },
        {
            label: "Active Tracks",
            value: "5",
            icon: Trophy,
            color: "var(--secondary)",
            href: "/orgs",
        },
        {
            label: "Current Streak",
            value: "7",
            icon: Flame,
            color: "var(--accent)",
            suffix: "weeks",
        },
        {
            label: "This Week",
            value: "2/5",
            icon: FileText,
            color: "var(--chart-4)",
            suffix: "submitted",
        },
    ];

    const quickActions = [
        {
            label: "Create Organization",
            icon: Building2,
            href: "/orgs",
            color: "var(--primary)",
        },
        {
            label: "View Leaderboards",
            icon: Trophy,
            href: "/orgs",
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
                {stats.map((stat, i) => (
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

            {/* Streak Banner */}
            <motion.div
                variants={itemVariants}
                className="card-brutalist p-6 relative overflow-hidden"
            >
                <div className="absolute inset-0 animate-lava opacity-10" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 flex items-center justify-center bg-[var(--primary)] border-3 border-[var(--border)]">
                            <Flame className="w-8 h-8 text-white animate-streak-flame" />
                        </div>
                        <div>
                            <div className="text-2xl font-black">🔥 7 Week Streak!</div>
                            <div className="text-[var(--muted-foreground)]">
                                You&apos;re on fire! Keep the momentum going.
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-[var(--secondary)] px-4 py-2 border-3 border-[var(--border)]">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-bold">1.7x Multiplier</span>
                    </div>
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

            {/* Get Started CTA */}
            <motion.div
                variants={itemVariants}
                className="card-brutalist p-8 text-center"
            >
                <h2 className="text-2xl font-black mb-4">Ready to submit this week?</h2>
                <p className="text-[var(--muted-foreground)] mb-6">
                    Select a track and submit your weekly progress to maintain your streak.
                </p>
                <Link
                    href="/orgs"
                    className="btn-brutalist inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold"
                >
                    View Your Tracks
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </motion.div>
        </motion.div>
    );
}
