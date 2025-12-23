"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GridScan } from "@/components/animations/GridScan";
import { Target, Trophy, Users, ArrowRight, Flame, Sparkles, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

const features = [
  {
    icon: Target,
    title: "Weekly Check-ins",
    description: "Submit proof of your progress every week.",
    color: "var(--primary)",
    size: "large",
  },
  {
    icon: Trophy,
    title: "Compete",
    description: "Climb the leaderboard.",
    color: "var(--secondary)",
    size: "small",
  },
  {
    icon: Flame,
    title: "Streak Multipliers",
    description: "The longer your streak, the more points you earn. Build unstoppable momentum.",
    color: "var(--accent)",
    size: "medium",
  },
  {
    icon: Users,
    title: "Team Tracks",
    description: "Create organizations and tracks. Invite your team. 67",
    color: "var(--chart-4)",
    size: "small",
  },
  {
    icon: Sparkles,
    title: "Weekly Quizzes",
    description: "Test your knowledge with essay questions. Barbequeue bacon burger",
    color: "var(--chart-5)",
    size: "medium",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track your progress over time with detailed insights.",
    color: "var(--chart-3)",
    size: "large",
  },
];

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
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export default function LandingPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const gridColor = isDark ? "#B8A8D8" : "#4A3A6A";

  return (
    <div className="min-h-screen relative overflow-hidden scroll-smooth">
      {/* GridScan Background */}
      <div className="fixed inset-0 z-0">
        {mounted && (
          <GridScan
            sensitivity={0.55}
            lineThickness={1}
            linesColor={gridColor}
            gridScale={0.1}
            lineJitter={0.05}
            scanColor="#E8B4B8"
            scanOpacity={0.3}
            scanGlow={0.3}
            scanSoftness={3}
            noiseIntensity={0.005}
          />
        )}
      </div>

      {/* Floating Controls */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/sign-in"
          className="glass-btn px-6 py-2.5 font-semibold hover:scale-105 transition-transform rounded-full"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="px-6 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold rounded-full hover:scale-105 transition-transform shadow-lg"
        >
          Get Started
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <motion.div
              className="flex items-center justify-center gap-3 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Image src="/veyra-svg.svg" alt="Veyra" width={40} height={40} className="w-10 h-10 logo-adaptive" />
              <span className="text-2xl font-black tracking-tight font-display">VEYRA</span>
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] mb-6 font-display"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Accountability
              <br />
              <span className="text-[var(--primary)]">Reimagined</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-[var(--muted-foreground)] mb-10 max-w-2xl mx-auto font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Track weekly progress. Compete on leaderboards. Build unstoppable streaks.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link
                href="/sign-up"
                className="px-10 py-4 bg-[var(--primary)] text-[var(--primary-foreground)] text-lg font-bold flex items-center justify-center gap-2 group rounded-full hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
              >
                Start Free
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#features"
                className="glass-card px-10 py-4 text-lg font-semibold rounded-full hover:scale-105 transition-all"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Masonry */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          > 
            <h2 className="text-4xl sm:text-5xl font-black mb-4 font-display">
              Why <span className="text-[var(--primary)]">Veyra?</span>
            </h2>
          </motion.div>

          {/* Bento Grid */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[140px]"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {/* Large card - spans 2 cols, 2 rows */}
            <motion.div
              variants={itemVariants}
              className="glass-card p-6 rounded-2xl cursor-pointer group col-span-2 row-span-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center rounded-full mb-4 transition-transform group-hover:scale-110"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 font-display leading-relaxed">Weekly Check-ins</h3>
              <p className="text-[var(--muted-foreground)] text-sm">Submit proof of your progress every week. Stay accountable.</p>
            </motion.div>

            {/* Small card */}
            <motion.div
              variants={itemVariants}
              className="glass-card p-5 rounded-2xl cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center rounded-full mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: "var(--secondary)" }}
              >
                <Trophy className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-sm font-bold font-display leading-relaxed">Compete</h3>
            </motion.div>

            {/* Small card */}
            <motion.div
              variants={itemVariants}
              className="glass-card p-5 rounded-2xl cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center rounded-full mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: "var(--chart-5)" }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold font-display leading-relaxed">Quizzes</h3>
            </motion.div>

            {/* Medium card - spans 2 cols */}
            <motion.div
              variants={itemVariants}
              className="glass-card p-5 rounded-2xl cursor-pointer group col-span-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center rounded-full mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <Flame className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold font-display leading-relaxed">Streak Multipliers</h3>
              <p className="text-[var(--muted-foreground)] text-xs mt-1">The longer your streak, the more points!</p>
            </motion.div>

            {/* Tall card - spans 2 rows */}
            <motion.div
              variants={itemVariants}
              className="glass-card p-5 rounded-2xl cursor-pointer group row-span-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center rounded-full mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: "var(--chart-4)" }}
              >
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold font-display leading-relaxed">Team Tracks</h3>
              <p className="text-[var(--muted-foreground)] text-xs mt-2">Create organizations. Invite your team. Grow together.</p>
            </motion.div>

            {/* Medium card */}
            <motion.div
              variants={itemVariants}
              className="glass-card p-5 rounded-2xl cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center rounded-full mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: "var(--chart-3)" }}
              >
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold font-display leading-relaxed">Analytics</h3>
            </motion.div>

            {/* Long card */}
            <motion.div
              variants={itemVariants}
              className="glass-card p-5 rounded-2xl cursor-pointer group col-span-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-full transition-transform group-hover:scale-110"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <Image src="/veyra-svg.svg" alt="" width={20} height={20} className="w-5 h-5 logo-adaptive" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display leading-relaxed">Level Up</h3>
                  <p className="text-[var(--muted-foreground)] text-xs">Build unstoppable momentum</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 z-10 relative">
        <motion.div
          className="max-w-3xl mx-auto glass-card p-12 text-center rounded-3xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-black mb-6 font-display">
            Ready to level up?
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] mb-8 max-w-xl mx-auto">
            Join the next generation of accountability tracking.
          </p>
          <Link
            href="/sign-up"
            className="px-10 py-4 bg-[var(--primary)] text-[var(--primary-foreground)] text-lg font-bold inline-flex items-center gap-2 rounded-full hover:scale-105 transition-all shadow-xl"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/veyra-svg.svg" alt="Veyra" width={20} height={20} className="w-5 h-5 logo-adaptive" />
            <span className="font-bold font-display">VEYRA</span>
          </div>
          <div className="text-sm text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} Veyra. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
