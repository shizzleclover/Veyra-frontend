"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    Building2,
    Plus,
    Users,
    Trophy,
    ArrowLeft,
    ArrowRight,
    Loader2,
    Settings,
    UserPlus,
    Flame,
    LogOut,
} from "lucide-react";

interface Organization {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    role?: string;
}

interface Track {
    id?: string;
    _id?: string;
    name: string;
    description?: string;
    memberCount?: number;
    weekNumber?: number;
    isMember?: boolean;
}

interface Member {
    id?: string;
    _id?: string;
    userId: string;
    displayName?: string;
    email?: string;
    avatarUrl?: string;
    role: string;
    joinedAt?: string;
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

export default function OrganizationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { getToken } = useAuth();
    const orgId = params.id as string;

    const [org, setOrg] = useState<Organization | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"tracks" | "members">("tracks");
    const [userRole, setUserRole] = useState<string>("member");

    // Create track modal
    const [showCreateTrack, setShowCreateTrack] = useState(false);
    const [newTrackName, setNewTrackName] = useState("");
    const [newTrackDesc, setNewTrackDesc] = useState("");
    const [creating, setCreating] = useState(false);

    // Leave and join states
    const [leaving, setLeaving] = useState(false);
    const [joiningTrack, setJoiningTrack] = useState<string | null>(null);

    const fetchOrgData = async () => {
        try {
            const token = await getToken();
            const headers = { Authorization: `Bearer ${token}` };
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            // Fetch org details
            const orgRes = await fetch(`${apiUrl}/api/organizations/${orgId}`, { headers });
            if (!orgRes.ok) throw new Error("Failed to fetch organization");
            const orgData = await orgRes.json();
            const orgInfo = orgData.data || orgData.organization;
            setOrg(orgInfo);
            // Set user's role in this organization
            if (orgInfo?.role) {
                setUserRole(orgInfo.role);
            }

            // Fetch tracks
            const tracksRes = await fetch(`${apiUrl}/api/tracks/org/${orgId}`, { headers });
            if (tracksRes.ok) {
                const tracksData = await tracksRes.json();
                setTracks(tracksData.data || tracksData || []);
            }

            // Fetch members
            const membersRes = await fetch(`${apiUrl}/api/organizations/${orgId}/members`, { headers });
            console.log('Members API response status:', membersRes.status);
            if (membersRes.ok) {
                const membersData = await membersRes.json();
                console.log('Members API response data:', membersData);
                const membersList = membersData.data || membersData.members || membersData || [];
                console.log('Setting members to:', membersList);
                setMembers(Array.isArray(membersList) ? membersList : []);
            } else {
                console.error('Members API error:', await membersRes.text());
            }
        } catch (err) {
            console.error('fetchOrgData error:', err);
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orgId) fetchOrgData();
    }, [orgId]);

    const handleCreateTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTrackName.trim()) return;

        setCreating(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/org/${orgId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newTrackName,
                    description: newTrackDesc,
                }),
            });

            if (!res.ok) throw new Error("Failed to create track");

            setNewTrackName("");
            setNewTrackDesc("");
            setShowCreateTrack(false);
            fetchOrgData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create track");
        } finally {
            setCreating(false);
        }
    };

    const handleLeaveCommunity = async () => {
        if (!confirm("Are you sure you want to leave this community? You'll need an invite code to rejoin.")) return;

        setLeaving(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${orgId}/leave`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to leave community");
            }

            router.push("/orgs");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to leave community");
        } finally {
            setLeaving(false);
        }
    };

    const handleJoinTrack = async (trackId: string) => {
        setJoiningTrack(trackId);
        try {
            const token = await getToken();
            // First get the track's invite code (for admins) or use direct join
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${trackId}/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({}),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to join track");
            }

            // Refresh to show updated membership status
            fetchOrgData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to join track");
        } finally {
            setJoiningTrack(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    if (!org) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Community not found</h2>
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
                    href="/orgs"
                    className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Community
                </Link>
            </motion.div>

            {/* Header */}
            <motion.div variants={itemVariants} className="card-brutalist p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 flex items-center justify-center bg-[var(--primary)] border-3 border-[var(--border)]">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-black">{org.name}</h1>
                            {org.description && (
                                <p className="text-[var(--muted-foreground)]">{org.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--muted)] border-3 border-[var(--border)]">
                            <Users className="w-4 h-4" />
                            <span className="font-semibold">{members.length} members</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--muted)] border-3 border-[var(--border)]">
                            <Trophy className="w-4 h-4" />
                            <span className="font-semibold">{tracks.length} tracks</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
                <Link
                    href={`/orgs/${orgId}/leaderboard`}
                    className="btn-brutalist px-4 py-2 bg-[var(--secondary)] font-bold flex items-center gap-2"
                >
                    <Trophy className="w-4 h-4" />
                    Community Leaderboard
                </Link>
                {(userRole === "owner" || userRole === "admin") && (
                    <>
                        <Link
                            href={`/orgs/${orgId}/admin`}
                            className="btn-brutalist px-4 py-2 bg-[var(--muted)] font-bold flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            Admin Panel
                        </Link>
                        <Link
                            href={`/orgs/${orgId}/settings`}
                            className="btn-brutalist px-4 py-2 bg-[var(--muted)] font-bold flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </Link>
                    </>
                )}
                {userRole !== "owner" && (
                    <button
                        onClick={handleLeaveCommunity}
                        disabled={leaving}
                        className="btn-brutalist px-4 py-2 bg-red-500/10 text-red-500 border-red-500 font-bold flex items-center gap-2 hover:bg-red-500/20"
                    >
                        {leaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        Leave Community
                    </button>
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
                    onClick={() => setActiveTab("tracks")}
                    className={`btn-brutalist px-6 py-3 font-bold ${activeTab === "tracks" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                        }`}
                >
                    <Trophy className="w-4 h-4 inline mr-2" />
                    Tracks
                </button>
                <button
                    onClick={() => setActiveTab("members")}
                    className={`btn-brutalist px-6 py-3 font-bold ${activeTab === "members" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                        }`}
                >
                    <Users className="w-4 h-4 inline mr-2" />
                    Members
                </button>
            </motion.div>

            {/* Tracks Tab */}
            {activeTab === "tracks" && (
                <motion.div variants={containerVariants} className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Tracks</h2>
                        {(userRole === "owner" || userRole === "admin") && (
                            <button
                                onClick={() => setShowCreateTrack(true)}
                                className="btn-brutalist px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New Track
                            </button>
                        )}
                    </div>

                    {tracks.length === 0 ? (
                        <motion.div variants={itemVariants} className="card-brutalist p-8 text-center">
                            <Trophy className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                            <h3 className="text-xl font-bold mb-2">No tracks yet</h3>
                            <p className="text-[var(--muted-foreground)]">Create your first track to start competing</p>
                        </motion.div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {tracks.map((track, index) => {
                                const trackId = track.id || track._id;
                                return (
                                    <motion.div key={trackId || index} variants={itemVariants}>
                                        <div className="card-brutalist p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-10 h-10 flex items-center justify-center bg-[var(--secondary)] border-2 border-[var(--border)]">
                                                    <Trophy className="w-5 h-5" />
                                                </div>
                                                {track.isMember ? (
                                                    <span className="px-2 py-1 text-xs font-bold bg-green-500/10 text-green-500 border border-green-500">
                                                        Joined
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-bold bg-[var(--muted)] text-[var(--muted-foreground)]">
                                                        Not Joined
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold mb-1">{track.name}</h3>
                                            {track.description && (
                                                <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">{track.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-3 text-xs text-[var(--muted-foreground)]">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {track.memberCount || 0} members
                                                </span>
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                {track.isMember ? (
                                                    <Link
                                                        href={`/tracks/${trackId}`}
                                                        className="btn-brutalist flex-1 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold flex items-center justify-center gap-2"
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                        View Track
                                                    </Link>
                                                ) : (
                                                    <button
                                                        onClick={() => handleJoinTrack(trackId!)}
                                                        disabled={joiningTrack === trackId}
                                                        className="btn-brutalist flex-1 px-4 py-2 bg-[var(--accent)] text-white font-bold flex items-center justify-center gap-2"
                                                    >
                                                        {joiningTrack === trackId ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Plus className="w-4 h-4" />
                                                        )}
                                                        Join Track
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Members Tab */}
            {activeTab === "members" && (
                <motion.div variants={containerVariants} className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Members</h2>
                        <button className="btn-brutalist px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] font-bold flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Invite
                        </button>
                    </div>

                    {members.length === 0 ? (
                        <motion.div variants={itemVariants} className="card-brutalist p-8 text-center">
                            <Users className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                            <h3 className="text-xl font-bold mb-2">No members yet</h3>
                            <p className="text-[var(--muted-foreground)]">Invite people to join this organization</p>
                        </motion.div>
                    ) : (
                        <div className="card-brutalist divide-y divide-[var(--border)]">
                            {members.map((member, index) => (
                                <div key={member.id || member._id || index} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 flex items-center justify-center bg-[var(--muted)] border-2 border-[var(--border)] font-bold">
                                            {member.displayName?.charAt(0) || member.email?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{member.displayName || member.email || "Unknown"}</div>
                                            <div className="text-xs text-[var(--muted-foreground)]">{member.email}</div>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold border-2 border-[var(--border)] ${member.role === "owner" ? "bg-[var(--primary)] text-white" :
                                        member.role === "admin" ? "bg-[var(--secondary)]" : "bg-[var(--muted)]"
                                        }`}>
                                        {member.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Create Track Modal */}
            {showCreateTrack && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-brutalist p-8 w-full max-w-md"
                    >
                        <h2 className="text-2xl font-bold mb-6">Create Track</h2>
                        <form onSubmit={handleCreateTrack} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Name</label>
                                <input
                                    type="text"
                                    value={newTrackName}
                                    onChange={(e) => setNewTrackName(e.target.value)}
                                    className="input-brutalist w-full px-4 py-3"
                                    placeholder="Weekly Fitness Challenge"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Description (optional)</label>
                                <textarea
                                    value={newTrackDesc}
                                    onChange={(e) => setNewTrackDesc(e.target.value)}
                                    className="input-brutalist w-full px-4 py-3 min-h-[100px] resize-none"
                                    placeholder="What is this track about?"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateTrack(false)}
                                    className="btn-brutalist flex-1 px-4 py-3 bg-[var(--muted)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="btn-brutalist flex-1 px-4 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            Create
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
