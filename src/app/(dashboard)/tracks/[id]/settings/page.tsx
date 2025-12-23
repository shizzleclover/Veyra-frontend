"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    Settings,
    Copy,
    RefreshCw,
    Trash2,
    AlertTriangle,
    Check,
    Loader2
} from "lucide-react";

export default function TrackSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const { getToken, userId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [track, setTrack] = useState<any>(null);
    const [inviteCode, setInviteCode] = useState("");
    const [copied, setCopied] = useState(false);

    // Action states
    const [regenerating, setRegenerating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const trackId = params.id as string;

    useEffect(() => {
        const fetchTrack = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${trackId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setTrack(data.data);
                    if (data.data.inviteCode) {
                        setInviteCode(data.data.inviteCode);
                    }
                } else {
                    router.push("/dashboard");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrack();
    }, [trackId, getToken, router]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteCode || "No Code");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${trackId}/regenerate-invite`, {
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
        if (!window.confirm("Are you sure? This will delete the track and all submissions.")) return;

        setDeleting(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${trackId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
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

    if (!track) return null;

    // Backend returns inviteCode only for admins, so existence of inviteCode is a decent proxy for auth,
    // but better to rely on what logic we can infer. Backend `getTrack` logic:
    // isAdmin = orgOwner || orgAdmin.
    // So if inviteCode exists, user is admin.

    if (!track.inviteCode) {
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
                    <h1 className="text-3xl font-black">Track Settings</h1>
                    <p className="text-[var(--muted-foreground)]">Manage {track.name}</p>
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
            </div>

            {/* Danger Zone */}
            <div className="border-2 border-red-500/50 bg-red-500/5 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <AlertTriangle className="w-24 h-24 text-red-500" />
                </div>

                <h2 className="text-xl font-bold text-red-500 mb-4 relative z-10">Danger Zone</h2>
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-red-500/80 max-w-lg">
                        Deleting this track is irreversible. All checks-ins and scores will be permanently lost.
                    </p>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="btn-brutalist bg-red-500 text-white w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2"
                    >
                        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete Track
                    </button>
                </div>
            </div>
        </div>
    );
}
