"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
    LayoutDashboard,
    Building2,
    User,
    Trophy,
    Menu,
    X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/orgs", label: "Community", icon: Building2 },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { getToken, isLoaded, userId } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkMembership = async () => {
            if (!isLoaded || !userId) return;

            try {
                const token = await getToken();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data.data) && data.data.length === 0) {
                        router.push("/onboarding");
                        return;
                    }
                }
            } catch (err) {
                console.error("Auth check failed", err);
            } finally {
                setChecking(false);
            }
        };

        checkMembership();
    }, [isLoaded, userId, getToken, router]);

    if (!isLoaded || checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold text-[var(--muted-foreground)]">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-[var(--sidebar)] border-r-3 border-[var(--sidebar-border)] transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-4 border-b-3 border-[var(--sidebar-border)]">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Image src="/veyra-svg.svg" alt="Veyra" width={28} height={28} className="w-7 h-7 logo-adaptive" />
                            <span className="text-xl font-black">VEYRA</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 font-semibold transition-all ${isActive
                                        ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-[var(--shadow-sm)]"
                                        : "hover:bg-[var(--muted)]"
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="p-4 border-t-3 border-[var(--sidebar-border)]">
                        <div className="flex items-center gap-3">
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-10 h-10 border-2 border-[var(--border)]",
                                    },
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold truncate">Account</div>
                                <div className="text-xs text-[var(--muted-foreground)]">
                                    Manage profile
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-16 bg-[var(--background)]/90 backdrop-blur-md border-b-3 border-[var(--border)]">
                    <div className="flex items-center justify-between h-full px-4 lg:px-8">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden btn-brutalist p-2 bg-[var(--card)]"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="flex-1" />

                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <div className="hidden lg:block">
                                <UserButton
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-10 h-10 border-2 border-[var(--border)]",
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
