"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    ArrowLeft,
    FileQuestion,
    Loader2,
    Plus,
    Send,
    CheckCircle,
    Clock,
    Star,
} from "lucide-react";

interface Quiz {
    id: string;
    question: string;
    weekStart: string;
    weekEnd: string;
    isActive: boolean;
}

interface QuizResponse {
    id: string;
    quizId: string;
    userId: string;
    user?: {
        name?: string;
        email?: string;
    };
    answer: string;
    score?: number;
    createdAt: string;
}

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

export default function TrackQuizzesPage() {
    const params = useParams();
    const { getToken } = useAuth();
    const trackId = params.id as string;

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [myResponse, setMyResponse] = useState<QuizResponse | null>(null);
    const [allResponses, setAllResponses] = useState<QuizResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [answer, setAnswer] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showCreateQuiz, setShowCreateQuiz] = useState(false);
    const [newQuestion, setNewQuestion] = useState("");

    const fetchData = async () => {
        try {
            const token = await getToken();
            const headers = { Authorization: `Bearer ${token}` };
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            // Fetch quizzes
            const quizzesRes = await fetch(`${apiUrl}/api/tracks/${trackId}/quizzes`, { headers });
            if (quizzesRes.ok) {
                const data = await quizzesRes.json();
                setQuizzes(data.quizzes || []);
                const active = data.quizzes?.find((q: Quiz) => q.isActive);
                if (active) {
                    setActiveQuiz(active);
                    // Fetch user's response
                    const respRes = await fetch(`${apiUrl}/api/quizzes/${active.id}/my-response`, { headers });
                    if (respRes.ok) {
                        const respData = await respRes.json();
                        setMyResponse(respData.response || null);
                    }
                }
            }

            // Check if admin
            const memberRes = await fetch(`${apiUrl}/api/tracks/${trackId}/my-membership`, { headers });
            if (memberRes.ok) {
                const memberData = await memberRes.json();
                setIsAdmin(memberData.membership?.role === "owner" || memberData.membership?.role === "admin");
            }
        } catch (err) {
            console.error("Failed to fetch quizzes:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchResponses = async (quizId: string) => {
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${quizId}/responses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setAllResponses(data.responses || []);
            }
        } catch (err) {
            console.error("Failed to fetch responses:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [trackId]);

    const handleSubmitAnswer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeQuiz || !answer.trim()) return;

        setSubmitting(true);
        try {
            const token = await getToken();
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${activeQuiz.id}/respond`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ answer }),
            });
            fetchData();
        } catch (err) {
            console.error("Failed to submit answer:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;

        setSubmitting(true);
        try {
            const token = await getToken();
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${trackId}/quizzes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ question: newQuestion }),
            });
            setNewQuestion("");
            setShowCreateQuiz(false);
            fetchData();
        } catch (err) {
            console.error("Failed to create quiz:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleScoreResponse = async (responseId: string, score: number) => {
        try {
            const token = await getToken();
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz-responses/${responseId}/score`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ score }),
            });
            if (activeQuiz) fetchResponses(activeQuiz.id);
        } catch (err) {
            console.error("Failed to score response:", err);
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
                    href={`/tracks/${trackId}`}
                    className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Track
                </Link>
            </motion.div>

            {/* Header */}
            <motion.div variants={itemVariants} className="card-brutalist p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 flex items-center justify-center bg-[var(--chart-5)] border-3 border-[var(--border)]">
                            <FileQuestion className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">Weekly Quizzes</h1>
                            <p className="text-[var(--muted-foreground)]">Test your knowledge</p>
                        </div>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setShowCreateQuiz(true)}
                            className="btn-brutalist px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Quiz
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Active Quiz */}
            {activeQuiz ? (
                <motion.div variants={itemVariants} className="card-brutalist p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                        <Clock className="w-4 h-4" />
                        This week&apos;s quiz
                    </div>
                    <h2 className="text-xl font-bold">{activeQuiz.question}</h2>

                    {myResponse ? (
                        <div className="p-4 bg-[var(--muted)] border-3 border-[var(--border)]">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="font-semibold">Your answer submitted</span>
                            </div>
                            <p className="text-sm">{myResponse.answer}</p>
                            {myResponse.score !== undefined && (
                                <div className="mt-2 flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="font-bold">Score: {myResponse.score}/10</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitAnswer} className="space-y-4">
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="input-brutalist w-full px-4 py-3 min-h-[150px] resize-none"
                                placeholder="Write your answer..."
                                required
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-brutalist px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold flex items-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                Submit Answer
                            </button>
                        </form>
                    )}
                </motion.div>
            ) : (
                <motion.div variants={itemVariants} className="card-brutalist p-8 text-center">
                    <FileQuestion className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                    <h3 className="text-xl font-bold mb-2">No active quiz</h3>
                    <p className="text-[var(--muted-foreground)]">Check back later for the weekly quiz!</p>
                </motion.div>
            )}

            {/* Admin: View Responses */}
            {isAdmin && activeQuiz && (
                <motion.div variants={itemVariants} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">Responses</h3>
                        <button
                            onClick={() => fetchResponses(activeQuiz.id)}
                            className="btn-brutalist px-3 py-1 text-sm bg-[var(--muted)]"
                        >
                            Refresh
                        </button>
                    </div>
                    {allResponses.length === 0 ? (
                        <p className="text-[var(--muted-foreground)]">No responses yet</p>
                    ) : (
                        <div className="space-y-3">
                            {allResponses.map((resp) => (
                                <div key={resp.id} className="card-brutalist p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-semibold">{resp.user?.name || resp.user?.email || "Unknown"}</div>
                                        {resp.score !== undefined ? (
                                            <span className="flex items-center gap-1 text-sm">
                                                <Star className="w-4 h-4 text-yellow-500" />
                                                {resp.score}/10
                                            </span>
                                        ) : (
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                                    <button
                                                        key={n}
                                                        onClick={() => handleScoreResponse(resp.id, n)}
                                                        className="w-6 h-6 text-xs font-bold border border-[var(--border)] hover:bg-[var(--primary)] hover:text-white"
                                                    >
                                                        {n}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm">{resp.answer}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Create Quiz Modal */}
            {showCreateQuiz && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-brutalist p-6 w-full max-w-lg"
                    >
                        <h3 className="text-xl font-bold mb-4">Create Quiz</h3>
                        <form onSubmit={handleCreateQuiz} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Question</label>
                                <textarea
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    className="input-brutalist w-full px-4 py-3 min-h-[100px] resize-none"
                                    placeholder="Enter your quiz question..."
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateQuiz(false)}
                                    className="btn-brutalist flex-1 py-3 bg-[var(--muted)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-brutalist flex-1 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
