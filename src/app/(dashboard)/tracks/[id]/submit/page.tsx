"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    ArrowLeft,
    Upload,
    FileText,
    Image as ImageIcon,
    Link as LinkIcon,
    Loader2,
    CheckCircle,
    X,
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
            ease: [0.4, 0, 0.2, 1] as const,
        },
    },
};

type SubmissionType = "text" | "image" | "link";

export default function SubmitProgressPage() {
    const params = useParams();
    const router = useRouter();
    const { getToken } = useAuth();
    const trackId = params.id as string;

    const [submissionType, setSubmissionType] = useState<SubmissionType>("text");
    const [textContent, setTextContent] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            const formData = new FormData();

            if (submissionType === "text") {
                formData.append("content", textContent);
                formData.append("type", "text");
            } else if (submissionType === "link") {
                formData.append("content", linkUrl);
                formData.append("type", "link");
            } else if (submissionType === "image" && imageFile) {
                formData.append("image", imageFile);
                formData.append("type", "image");
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${trackId}/submissions`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to submit");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push(`/tracks/${trackId}`);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to submit");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-[50vh] flex flex-col items-center justify-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6"
                >
                    <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Submitted Successfully!</h2>
                <p className="text-[var(--muted-foreground)]">Redirecting to track...</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto space-y-6"
        >
            {/* Back button */}
            <motion.div variants={itemVariants}>
                <Link
                    href={`/tracks/${trackId}`}
                    className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Track
                </Link>
            </motion.div>

            {/* Header */}
            <motion.div variants={itemVariants} className="card-brutalist p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 flex items-center justify-center bg-[var(--accent)] border-3 border-[var(--border)]">
                        <Upload className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black">Submit Progress</h1>
                        <p className="text-[var(--muted-foreground)]">Share your weekly progress</p>
                    </div>
                </div>
            </motion.div>

            {error && (
                <motion.div variants={itemVariants} className="card-brutalist p-4 bg-red-100 text-red-800 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            )}

            {/* Submission Type Selector */}
            <motion.div variants={itemVariants} className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setSubmissionType("text")}
                    className={`btn-brutalist flex-1 px-4 py-3 font-bold flex items-center justify-center gap-2 ${submissionType === "text" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    Text
                </button>
                <button
                    type="button"
                    onClick={() => setSubmissionType("image")}
                    className={`btn-brutalist flex-1 px-4 py-3 font-bold flex items-center justify-center gap-2 ${submissionType === "image" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                        }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    Image
                </button>
                <button
                    type="button"
                    onClick={() => setSubmissionType("link")}
                    className={`btn-brutalist flex-1 px-4 py-3 font-bold flex items-center justify-center gap-2 ${submissionType === "link" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                        }`}
                >
                    <LinkIcon className="w-4 h-4" />
                    Link
                </button>
            </motion.div>

            {/* Submission Form */}
            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="card-brutalist p-6 space-y-6">
                {submissionType === "text" && (
                    <div>
                        <label className="block text-sm font-semibold mb-2">Your Progress Update</label>
                        <textarea
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            className="input-brutalist w-full px-4 py-3 min-h-[200px] resize-none"
                            placeholder="Describe what you accomplished this week..."
                            required
                        />
                    </div>
                )}

                {submissionType === "image" && (
                    <div>
                        <label className="block text-sm font-semibold mb-2">Upload Proof</label>
                        <div className="border-3 border-dashed border-[var(--border)] p-8 text-center">
                            {imagePreview ? (
                                <div className="relative">
                                    <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageFile(null);
                                            setImagePreview(null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                                    <p className="font-semibold">Click to upload image</p>
                                    <p className="text-sm text-[var(--muted-foreground)]">PNG, JPG up to 10MB</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                )}

                {submissionType === "link" && (
                    <div>
                        <label className="block text-sm font-semibold mb-2">Link to Your Work</label>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="input-brutalist w-full px-4 py-3"
                            placeholder="https://..."
                            required
                        />
                        <p className="text-xs text-[var(--muted-foreground)] mt-2">
                            Share a link to your GitHub commit, blog post, video, etc.
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="btn-brutalist w-full px-6 py-4 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-lg flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            Submit Progress
                        </>
                    )}
                </button>
            </motion.form>
        </motion.div>
    );
}
