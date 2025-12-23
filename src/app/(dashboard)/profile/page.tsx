"use client";

import { motion } from "framer-motion";
import { useUser, useClerk } from "@clerk/nextjs";
import {
    User,
    Mail,
    Calendar,
    LogOut,
    Settings,
    Moon,
    Sun,
    Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

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

export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const { signOut, openUserProfile } = useClerk();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isLoaded) {
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
            className="max-w-2xl mx-auto space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-black mb-2">Profile</h1>
                <p className="text-[var(--muted-foreground)]">Manage your account settings</p>
            </motion.div>

            {/* User Info Card */}
            <motion.div variants={itemVariants} className="card-brutalist p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 flex items-center justify-center bg-[var(--primary)] border-3 border-[var(--border)] text-white text-3xl font-black">
                        {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || "?"}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">
                            {user?.firstName} {user?.lastName}
                        </h2>
                        <p className="text-[var(--muted-foreground)]">{user?.emailAddresses?.[0]?.emailAddress}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-[var(--muted)] border-2 border-[var(--border)]">
                        <User className="w-5 h-5 text-[var(--muted-foreground)]" />
                        <div>
                            <div className="text-xs text-[var(--muted-foreground)]">Full Name</div>
                            <div className="font-semibold">{user?.fullName || "Not set"}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-[var(--muted)] border-2 border-[var(--border)]">
                        <Mail className="w-5 h-5 text-[var(--muted-foreground)]" />
                        <div>
                            <div className="text-xs text-[var(--muted-foreground)]">Email</div>
                            <div className="font-semibold">{user?.emailAddresses?.[0]?.emailAddress}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-[var(--muted)] border-2 border-[var(--border)]">
                        <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
                        <div>
                            <div className="text-xs text-[var(--muted-foreground)]">Joined</div>
                            <div className="font-semibold">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => openUserProfile()}
                    className="btn-brutalist w-full mt-6 px-4 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] font-bold flex items-center justify-center gap-2"
                >
                    <Settings className="w-5 h-5" />
                    Edit Profile in Clerk
                </button>
            </motion.div>

            {/* Preferences */}
            <motion.div variants={itemVariants} className="card-brutalist p-6">
                <h3 className="text-lg font-bold mb-4">Preferences</h3>

                <div className="flex items-center justify-between p-3 bg-[var(--muted)] border-2 border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        {mounted && theme === "dark" ? (
                            <Moon className="w-5 h-5" />
                        ) : (
                            <Sun className="w-5 h-5" />
                        )}
                        <div>
                            <div className="font-semibold">Theme</div>
                            <div className="text-xs text-[var(--muted-foreground)]">
                                {mounted ? (theme === "dark" ? "Dark mode" : "Light mode") : "Loading..."}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="btn-brutalist px-4 py-2 bg-[var(--card)] font-bold"
                    >
                        Toggle
                    </button>
                </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div variants={itemVariants} className="card-brutalist p-6 border-red-500">
                <h3 className="text-lg font-bold mb-4 text-red-600">Danger Zone</h3>

                <button
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="btn-brutalist w-full px-4 py-3 bg-red-500 text-white font-bold flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </motion.div>
        </motion.div>
    );
}
