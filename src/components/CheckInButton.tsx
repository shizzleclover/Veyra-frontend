"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame, Loader2 } from "lucide-react";

interface CheckInButtonProps {
    trackId: string;
    hasCheckedIn: boolean;
    onCheckIn: () => void;
}

// Individual flame particle component
const FlameParticle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
        animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.5, 1, 0.5],
            x: [0, x * 0.5, x],
            y: [0, y * 0.3, y],
        }}
        transition={{
            duration: 1.2,
            delay,
            ease: "easeOut",
        }}
        className="absolute w-4 h-4 pointer-events-none"
        style={{
            background: "radial-gradient(circle, #FFD700 0%, #FF6B00 40%, #FF0000 70%, transparent 100%)",
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            filter: "blur(1px)",
        }}
    />
);

// Phoenix rising flame effect
const PhoenixFlame = ({ isActive }: { isActive: boolean }) => {
    const particles = [
        // Central rising flames
        { delay: 0, x: 0, y: -80 },
        { delay: 0.05, x: -15, y: -90 },
        { delay: 0.1, x: 15, y: -85 },
        { delay: 0.15, x: -8, y: -100 },
        { delay: 0.2, x: 8, y: -95 },
        // Side sparks
        { delay: 0.1, x: -40, y: -50 },
        { delay: 0.15, x: 40, y: -55 },
        { delay: 0.2, x: -50, y: -40 },
        { delay: 0.25, x: 50, y: -45 },
        // Outer burst
        { delay: 0.3, x: -30, y: -70 },
        { delay: 0.35, x: 30, y: -75 },
        { delay: 0.4, x: -20, y: -110 },
        { delay: 0.45, x: 20, y: -105 },
    ];

    return (
        <AnimatePresence>
            {isActive && (
                <div className="absolute inset-0 flex items-center justify-center overflow-visible pointer-events-none z-50">
                    {/* Central glow */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 0.8, 0], scale: [0, 2, 3] }}
                        transition={{ duration: 0.8 }}
                        className="absolute w-16 h-16 rounded-full"
                        style={{
                            background: "radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,107,0,0.4) 50%, transparent 70%)",
                            filter: "blur(8px)",
                        }}
                    />

                    {/* Flame particles */}
                    {particles.map((p, i) => (
                        <FlameParticle key={i} {...p} />
                    ))}

                    {/* Phoenix wings effect */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2], rotate: [-10, 0, 10] }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="absolute"
                        style={{
                            width: "120px",
                            height: "60px",
                            background: "radial-gradient(ellipse at center, rgba(255,107,0,0.6) 0%, rgba(255,0,0,0.3) 50%, transparent 70%)",
                            borderRadius: "50%",
                            filter: "blur(4px)",
                            transform: "translateY(-30px)",
                        }}
                    />

                    {/* Rising streak */}
                    <motion.div
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0], y: [0, -60, -120] }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="absolute w-2 h-24 origin-bottom"
                        style={{
                            background: "linear-gradient(to top, #FF6B00, #FFD700, transparent)",
                            borderRadius: "50%",
                            filter: "blur(2px)",
                        }}
                    />
                </div>
            )}
        </AnimatePresence>
    );
};

export function CheckInButton({ trackId, hasCheckedIn, onCheckIn }: CheckInButtonProps) {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showFlame, setShowFlame] = useState(false);

    const handleCheckIn = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading || hasCheckedIn) return;

        setLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${trackId}/check-in`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({}),
            });

            if (res.ok) {
                // Trigger flame animation
                setShowFlame(true);
                setTimeout(() => {
                    setShowFlame(false);
                    onCheckIn();
                }, 1200);
            } else {
                const data = await res.json();
                console.error("Check-in failed:", data.error);
            }
        } catch (err) {
            console.error("Check-in error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (hasCheckedIn) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 border-2 border-green-500 font-bold rounded-sm cursor-default"
            >
                <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Check className="w-4 h-4" />
                </motion.div>
                <span>Checked In</span>
            </motion.div>
        );
    }

    return (
        <div className="relative overflow-visible">
            <PhoenixFlame isActive={showFlame} />
            <motion.button
                onClick={handleCheckIn}
                disabled={loading || showFlame}
                className="relative flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white font-bold border-2 border-[var(--border)] shadow-[4px_4px_0px_0px_var(--border)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--border)] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : showFlame ? (
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 0.3, repeat: 3 }}
                    >
                        <Flame className="w-4 h-4 text-orange-300" />
                    </motion.div>
                ) : (
                    <Flame className="w-4 h-4" />
                )}
                <span>{showFlame ? "🔥 Streak!" : "Check In"}</span>
            </motion.button>
        </div>
    );
}
