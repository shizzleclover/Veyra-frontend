"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Check, Flame, Loader2 } from "lucide-react";

interface CheckInButtonProps {
    trackId: string;
    hasCheckedIn: boolean;
    onCheckIn: () => void; // Callback to refresh parent state
}

export function CheckInButton({ trackId, hasCheckedIn, onCheckIn }: CheckInButtonProps) {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleCheckIn = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link clicks if nested
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
                onCheckIn();
            } else {
                const data = await res.json();
                console.error("Check-in failed:", data.error);
                // Optionally show toast
            }
        } catch (err) {
            console.error("Check-in error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (hasCheckedIn) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 border-2 border-green-500 font-bold rounded-sm cursor-default">
                <Check className="w-4 h-4" />
                <span>Checked In</span>
            </div>
        );
    }

    return (
        <button
            onClick={handleCheckIn}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white font-bold border-2 border-[var(--border)] shadow-[4px_4px_0px_0px_var(--border)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--border)] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Flame className="w-4 h-4" />
            )}
            <span>Check In</span>
        </button>
    );
}
