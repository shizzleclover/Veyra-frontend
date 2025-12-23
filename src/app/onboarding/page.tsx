"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Building2, Key, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function OnboardingPage() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Create Form State
    const [orgName, setOrgName] = useState("");

    // Join Form State
    const [inviteCode, setInviteCode] = useState("");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: orgName }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create community");
            }

            // Redirect to dashboard
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ inviteCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to join community");
            }

            // Redirect to dashboard
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black mb-2 flex items-center justify-center gap-3">
                         <img src="../public/veyra-png.png" alt="" />
                        VEYRA
                    </h1>
                    <p className="text-[var(--muted-foreground)]">
                        Join or create a community to start your journey.
                    </p>
                </div>

                <div className="card-brutalist p-8 bg-[var(--card)]">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500 text-red-500 font-bold text-sm">
                            {error}
                        </div>
                    )}

                    {mode === "choose" && (
                        <div className="space-y-4">
                            <button
                                onClick={() => setMode("create")}
                                className="w-full btn-brutalist p-6 bg-[var(--background)] hover:bg-[var(--muted)] flex items-center gap-4 group transition-all"
                            >
                                <div className="w-12 h-12 bg-[var(--primary)] flex items-center justify-center border-2 border-[var(--border)] group-hover:scale-110 transition-transform">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-bold text-lg">Create Community</div>
                                    <div className="text-sm text-[var(--muted-foreground)]">Start a new group for your friends</div>
                                </div>
                                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-[var(--border)]" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-[var(--card)] px-2 text-sm text-[var(--muted-foreground)] font-bold">OR</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setMode("join")}
                                className="w-full btn-brutalist p-6 bg-[var(--background)] hover:bg-[var(--muted)] flex items-center gap-4 group transition-all"
                            >
                                <div className="w-12 h-12 bg-[var(--secondary)] flex items-center justify-center border-2 border-[var(--border)] group-hover:scale-110 transition-transform">
                                    <Key className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-bold text-lg">Join with Code</div>
                                    <div className="text-sm text-[var(--muted-foreground)]">Have an invite code? Enter it here</div>
                                </div>
                                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    )}

                    {mode === "create" && (
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Community Name</label>
                                <input
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    placeholder="e.g. Iron Lifters 2024"
                                    className="w-full input-brutalist p-3"
                                    required
                                    minLength={2}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setMode("choose")}
                                    className="flex-1 btn-brutalist p-3 bg-[var(--muted)]"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 btn-brutalist p-3 bg-[var(--primary)] text-white flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create
                                </button>
                            </div>
                        </form>
                    )}

                    {mode === "join" && (
                        <form onSubmit={handleJoin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Invite Code</label>
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. A7X9B2"
                                    className="w-full input-brutalist p-3 uppercase tracking-widest font-mono text-center text-lg"
                                    required
                                    maxLength={8}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setMode("choose")}
                                    className="flex-1 btn-brutalist p-3 bg-[var(--muted)]"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 btn-brutalist p-3 bg-[var(--secondary)] text-white flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Join
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
