"use client";

import { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Trophy, Code, FileText } from "lucide-react";
import { fetchMyProfile } from "@/apis/profile-api";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { VERDICT_STYLES } from "./helpers/colorVerdict";




export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        fetchMyProfile({ page: 0, size: 5 })
            .then((res) => setProfile(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                Loading profile...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                Failed to load profile
            </div>
        );
    }



    const problemData = [
        { name: "Easy", value: profile.problemStats.easy.solved, color: "#22c55e" },
        { name: "Medium", value: profile.problemStats.medium.solved, color: "#f59e0b" },
        { name: "Hard", value: profile.problemStats.hard.solved, color: "#ef4444" },
    ];

    const monthlyData = profile.monthlyProgress.map((m) => ({
        month: `${m.month}/${m.year}`,
        solved: m.solvedCount,
    }));

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h1 className="text-3xl font-bold">{profile.user.displayName}</h1>
                    <p className="text-muted-foreground">{profile.user.email}</p>
                    <p className="text-sm text-muted-foreground">
                        Joined{" "}
                        {new Date(profile.user.joinedAt).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        label="Contests Attended"
                        value={profile.stats.contestsAttended}
                        icon={<Trophy />}
                    />
                    <StatCard
                        label="Total Submissions"
                        value={profile.stats.totalSubmissions}
                        icon={<Code />}
                    />
                    <StatCard
                        label="Questions Solved"
                        value={profile.stats.questionsSolved}
                        icon={<FileText />}
                    />
                </div>

                {/* Tabs */}
                <div className="bg-card border border-border rounded-xl shadow-sm">
                    <div className="flex border-b border-border">
                        {["overview", "contests", "submissions"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setActiveTab(t)}
                                className={`px-6 py-3 text-sm font-medium transition-colors
                  ${activeTab === t
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {activeTab === "overview" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Difficulty Chart */}
                                <div className="bg-muted/40 border border-border rounded-xl p-4">
                                    <h3 className="font-semibold mb-4">
                                        Problems by Difficulty
                                    </h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie data={problemData} dataKey="value" label>
                                                {problemData.map((d, i) => (
                                                    <Cell key={i} fill={d.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Monthly Progress */}
                                <div className="bg-muted/40 border border-border rounded-xl p-4">
                                    <h3 className="font-semibold mb-4">
                                        Monthly Progress
                                    </h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={monthlyData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="solved"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                            </div>
                        )}

                        {activeTab === "contests" && (
                            <div className="space-y-3">
                                {profile.recentContests.content.map((c) => (
                                    <div
                                        key={c.contestId}
                                        className=" p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-between " >
                                        <div>
                                            <p className="font-medium">{c.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {c.status}
                                            </p>
                                        </div>

                                        <Button asChild size="sm" variant="outline">
                                            <Link to={`/contests/${c.roomId}`}>
                                                View
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "submissions" && (
                            <div className="space-y-3">
                                {profile.recentSubmissions.content.map((s) => (
                                    <div
                                        key={s.submissionId}
                                        className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <p
                                            className={`text-sm ${VERDICT_STYLES[s.verdict] ?? "text-muted-foreground"
                                                }`}
                                        >
                                            {s.verdict.replaceAll("_", " ")}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {new Date(s.submittedAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

function StatCard({ label, value, icon }) {
    return (
        <div className="bg-card border border-border rounded-xl p-6 flex justify-between items-center shadow-sm">
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            <div className="text-primary">{icon}</div>
        </div>
    );
}
