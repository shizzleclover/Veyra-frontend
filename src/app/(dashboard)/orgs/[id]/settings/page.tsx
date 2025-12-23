"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
    Settings,
    Copy,
    RefreshCw,
    Trash2,
    AlertTriangle,
    Check,
    Loader2
} from "lucide-react";

export default function OrgSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const { getToken, userId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [org, setOrg] = useState<any>(null);
    const [inviteCode, setInviteCode] = useState("");
    const [inviteEnabled, setInviteEnabled] = useState(true);
    const [copied, setCopied] = useState(false);

    // Action states
    const [regenerating, setRegenerating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [sudoPassword, setSudoPassword] = useState("");

    const orgId = params.id as string;

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${orgId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setOrg(data.data);
                    if (data.data.inviteCode) {
                        setInviteCode(data.data.inviteCode);
                    }
                    if (data.data.inviteEnabled !== undefined) {
                        setInviteEnabled(data.data.inviteEnabled);
                    }
                } else {
                    router.push("/orgs");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrg();
    }, [orgId, getToken, router]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteCode || "No Code"); // Fallback
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${orgId}/regenerate-invite`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setInviteCode(data.data.inviteCode);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setRegenerating(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure? This cannot be undone.")) return;

        setDeleting(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${orgId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ sudoPassword }) // If required
            });

            if (res.ok) {
                router.push("/dashboard");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]" />
            </div>
        );
    }

    if (!org) return null;

    const isAdmin = org.role === 'owner' || org.role === 'admin';
    const isOwner = org.role === 'owner';

    if (!isAdmin) {
        return (
            <div className="p-8 text-center text-red-500 font-bold">
                Access Denied. Admins only.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[var(--card)] border-2 border-[var(--border)] flex items-center justify-center">
                    <Settings className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-black">Community Settings</h1>
                    <p className="text-[var(--muted-foreground)]">Manage {org.name}</p>
                </div>
            </div>

            {/* Invite Section */}
            <div className="card-brutalist p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Invite Management
                </h2>
                <div className="bg-[var(--background)] p-4 border-2 border-[var(--border)] mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <div className="text-sm text-[var(--muted-foreground)] font-bold mb-1">INVITE CODE</div>
                        <div className="text-2xl font-mono tracking-widest font-black">
                            {inviteCode || "••••••••"}
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={copyToClipboard}
                            className="flex-1 sm:flex-none btn-brutalist p-2 bg-[var(--card)] hover:bg-[var(--muted)]"
                            title="Copy Code"
                        >
                            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handleRegenerate}
                            disabled={regenerating}
                            className="flex-1 sm:flex-none btn-brutalist px-4 py-2 bg-[var(--primary)] text-white font-bold"
                        >
                            {regenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Regenerate"}
                        </button>
                    </div>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                    Share this code with users you want to join your community. Regenerating will invalidate the old code.
                </p>
            </div>

            {/* Danger Zone */}
            {isOwner && (
                <div className="border-2 border-red-500/50 bg-red-500/5 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertTriangle className="w-24 h-24 text-red-500" />
                    </div>

                    <h2 className="text-xl font-bold text-red-500 mb-4 relative z-10">Danger Zone</h2>
                    <p className="text-red-500/80 mb-6 relative z-10 max-w-lg">
                        Deleting this community is irreversible. All tracks, submissions, and history will be permanently erased.
                    </p>

                    <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-end">
                        <div className="w-full">
                            <label className="block text-sm font-bold text-red-500 mb-2">
                                Sudo Password (Required)
                            </label>
                            <input
                                type="password"
                                value={sudoPassword}
                                onChange={(e) => setSudoPassword(e.target.value)}
                                className="w-full input-brutalist border-red-500 focus:ring-red-500"
                                placeholder="Enter sudo password..."
                            />
                        </div>
                        <button
                            onClick={handleDelete}
                            disabled={deleting || !sudoPassword}
                            className="btn-brutalist bg-red-500 text-white w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete Community
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
