"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    ArrowLeft,
    Shield,
    Users,
    Search,
    Filter,
    Ban,
    UserCheck,
    UserX,
    Loader2,
    ChevronDown,
} from "lucide-react";

interface Track {
    id: string;
    name: string;
}

interface Member {
    id: string;
    oderId: string;
    user: {
        _id: string;
        name?: string;
        email?: string;
        displayName?: string;
    };
    role: string;
    status: string;
    currentStreak: number;
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
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.2 },
    },
};

export default function CommunityAdminPage() {
    const params = useParams();
    const { getToken } = useAuth();
    const orgId = params.id as string;

    const [orgName, setOrgName] = useState("");
    const [tracks, setTracks] = useState<Track[]>([]);
    const [allMembers, setAllMembers] = useState<Member[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [trackFilter, setTrackFilter] = useState<string>("all");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getToken();
                const headers = { Authorization: `Bearer ${token}` };
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;

                // Fetch org
                const orgRes = await fetch(`${apiUrl}/api/organizations/${orgId}`, { headers });
                if (orgRes.ok) {
                    const orgData = await orgRes.json();
                    setOrgName(orgData.organization?.name || "Community");
                }

                // Fetch tracks
                const tracksRes = await fetch(`${apiUrl}/api/tracks/org/${orgId}`, { headers });
                if (tracksRes.ok) {
                    const tracksData = await tracksRes.json();
                    setTracks(tracksData.data || []);

                    // Fetch members from all tracks
                    const membersMap = new Map<string, Member>();
                    for (const track of tracksData.data || []) {
                        const membersRes = await fetch(`${apiUrl}/api/tracks/${track.id}/members`, { headers });
                        if (membersRes.ok) {
                            const membersData = await membersRes.json();
                            (membersData.members || []).forEach((m: any) => {
                                const key = `${m.userId}-${track.id}`;
                                membersMap.set(key, {
                                    ...m,
                                    trackName: track.name,
                                });
                            });
                        }
                    }
                    const members = Array.from(membersMap.values());
                    setAllMembers(members);
                    setFilteredMembers(members);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [orgId]);

    // Apply filters
    useEffect(() => {
        let result = [...allMembers];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (m) =>
                    m.user?.displayName?.toLowerCase().includes(query) ||
                    m.user?.email?.toLowerCase().includes(query) ||
                    m.user?.name?.toLowerCase().includes(query)
            );
        }

        if (roleFilter !== "all") {
            result = result.filter((m) => m.role === roleFilter);
        }

        if (statusFilter !== "all") {
            result = result.filter((m) => m.status === statusFilter);
        }

        if (trackFilter !== "all") {
            result = result.filter((m) => m.trackName === trackFilter);
        }

        setFilteredMembers(result);
    }, [searchQuery, roleFilter, statusFilter, trackFilter, allMembers]);

    const handleAction = async (userId: string, trackId: string, action: string) => {
        setProcessing(`${userId}-${action}`);
        try {
            const token = await getToken();
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const method = action.startsWith("un") ? "DELETE" : "POST";
            const endpoint = action.replace("un", "");

            await fetch(`${apiUrl}/api/tracks/${trackId}/members/${userId}/${endpoint}`, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            // Refresh members
            window.location.reload();
        } catch (err) {
            console.error("Action failed:", err);
        } finally {
            setProcessing(null);
        }
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
            <motion.div variants={itemVariants} className="card-brutalist p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 flex items-center justify-center bg-[var(--primary)] border-3 border-[var(--border)]">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black">Member Management</h1>
                        <p className="text-[var(--muted-foreground)]">{allMembers.length} total memberships</p>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="card-brutalist p-4 space-y-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span className="font-bold">Filters</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search name/email..."
                            className="input-brutalist w-full pl-10 pr-4 py-2"
                        />
                    </div>

                    {/* Role filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="input-brutalist px-4 py-2"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                    </select>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-brutalist px-4 py-2"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                    </select>

                    {/* Track filter */}
                    <select
                        value={trackFilter}
                        onChange={(e) => setTrackFilter(e.target.value)}
                        className="input-brutalist px-4 py-2"
                    >
                        <option value="all">All Tracks</option>
                        {tracks.map((t) => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </motion.div>

            {/* Members List */}
            <motion.div variants={containerVariants} className="space-y-2">
                {filteredMembers.length === 0 ? (
                    <motion.div variants={itemVariants} className="card-brutalist p-8 text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                        <h3 className="text-xl font-bold mb-2">No members found</h3>
                        <p className="text-[var(--muted-foreground)]">Try adjusting your filters</p>
                    </motion.div>
                ) : (
                    filteredMembers.map((member) => (
                        <motion.div
                            key={`${member.user?._id}-${member.trackName}`}
                            variants={itemVariants}
                            className={`card-brutalist p-4 flex items-center justify-between ${member.status === "banned" ? "bg-red-50" :
                                    member.status === "suspended" ? "bg-yellow-50" : ""
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 flex items-center justify-center border-2 border-[var(--border)] font-bold ${member.status !== "active" ? "bg-red-100" : "bg-[var(--muted)]"
                                    }`}>
                                    {member.user?.displayName?.charAt(0) || member.user?.email?.charAt(0) || "?"}
                                </div>
                                <div>
                                    <div className="font-semibold flex items-center gap-2">
                                        {member.user?.displayName || member.user?.email || "Unknown"}
                                        {member.status !== "active" && (
                                            <span className={`text-xs px-2 py-0.5 border ${member.status === "banned" ? "bg-red-100 text-red-800 border-red-300" :
                                                    "bg-yellow-100 text-yellow-800 border-yellow-300"
                                                }`}>
                                                {member.status.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-[var(--muted-foreground)]">
                                        {member.trackName} • {member.role} • {member.currentStreak || 0} day streak
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {member.status === "active" && (
                                    <>
                                        <button
                                            onClick={() => handleAction(member.user._id, member.id, "suspend")}
                                            disabled={processing !== null}
                                            className="btn-brutalist p-2 bg-yellow-500 text-white text-xs"
                                            title="Suspend"
                                        >
                                            {processing === `${member.user._id}-suspend` ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <UserX className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleAction(member.user._id, member.id, "ban")}
                                            disabled={processing !== null}
                                            className="btn-brutalist p-2 bg-red-500 text-white text-xs"
                                            title="Ban"
                                        >
                                            {processing === `${member.user._id}-ban` ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Ban className="w-4 h-4" />
                                            )}
                                        </button>
                                    </>
                                )}
                                {member.status === "suspended" && (
                                    <button
                                        onClick={() => handleAction(member.user._id, member.id, "unsuspend")}
                                        disabled={processing !== null}
                                        className="btn-brutalist p-2 bg-green-500 text-white text-xs"
                                        title="Unsuspend"
                                    >
                                        {processing === `${member.user._id}-unsuspend` ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <UserCheck className="w-4 h-4" />
                                        )}
                                    </button>
                                )}
                                {member.status === "banned" && (
                                    <button
                                        onClick={() => handleAction(member.user._id, member.id, "unban")}
                                        disabled={processing !== null}
                                        className="btn-brutalist p-2 bg-green-500 text-white text-xs"
                                        title="Unban"
                                    >
                                        {processing === `${member.user._id}-unban` ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <UserCheck className="w-4 h-4" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </motion.div>
    );
}
