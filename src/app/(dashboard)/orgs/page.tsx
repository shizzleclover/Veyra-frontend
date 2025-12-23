"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import {
    Building2,
    Plus,
    Users,
    Trophy,
    ArrowRight,
    Loader2,
} from "lucide-react";

interface Organization {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    memberCount?: number;
    trackCount?: number;
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

export default function OrganizationsPage() {
    const { getToken } = useAuth();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newOrgName, setNewOrgName] = useState("");
    const [newOrgDesc, setNewOrgDesc] = useState("");
    const [creating, setCreating] = useState(false);

    const fetchOrganizations = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Failed to fetch organizations");
            const data = await res.json();
            setOrganizations(data.organizations || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOrgName.trim()) return;

        setCreating(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newOrgName,
                    description: newOrgDesc,
                }),
            });

            if (!res.ok) throw new Error("Failed to create organization");

            setNewOrgName("");
            setNewOrgDesc("");
            setShowCreateModal(false);
            fetchOrganizations();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create");
        } finally {
            setCreating(false);
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
            className="space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black mb-2">Organizations</h1>
                    <p className="text-[var(--muted-foreground)]">
                        Manage your organizations and tracks
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-brutalist px-4 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">New Organization</span>
                </button>
            </motion.div>

            {error && (
                <motion.div variants={itemVariants} className="card-brutalist p-4 bg-[var(--destructive)] text-[var(--destructive-foreground)]">
                    {error}
                </motion.div>
            )}

            {/* Organizations Grid */}
            {organizations.length === 0 ? (
                <motion.div
                    variants={itemVariants}
                    className="card-brutalist p-12 text-center"
                >
                    <Building2 className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)]" />
                    <h2 className="text-2xl font-bold mb-2">No organizations yet</h2>
                    <p className="text-[var(--muted-foreground)] mb-6">
                        Create your first organization to get started
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-brutalist px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Organization
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {organizations.map((org) => (
                        <motion.div key={org.id} variants={itemVariants}>
                            <Link href={`/orgs/${org.id}`}>
                                <div className="card-brutalist p-6 group cursor-pointer h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 flex items-center justify-center bg-[var(--primary)] border-3 border-[var(--border)]">
                                            <Building2 className="w-6 h-6 text-white" />
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{org.name}</h3>
                                    {org.description && (
                                        <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-2">
                                            {org.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>{org.memberCount || 0} members</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Trophy className="w-4 h-4" />
                                            <span>{org.trackCount || 0} tracks</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-brutalist p-8 w-full max-w-md"
                    >
                        <h2 className="text-2xl font-bold mb-6">Create Organization</h2>
                        <form onSubmit={handleCreateOrg} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Name</label>
                                <input
                                    type="text"
                                    value={newOrgName}
                                    onChange={(e) => setNewOrgName(e.target.value)}
                                    className="input-brutalist w-full px-4 py-3"
                                    placeholder="My Organization"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Description (optional)</label>
                                <textarea
                                    value={newOrgDesc}
                                    onChange={(e) => setNewOrgDesc(e.target.value)}
                                    className="input-brutalist w-full px-4 py-3 min-h-[100px] resize-none"
                                    placeholder="What is this organization about?"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
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
