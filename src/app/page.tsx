"use client";

import Link from 'next/link';
import { ArrowRight, BarChart2, BookOpen, BrainCircuit, Play, ShieldAlert, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import dynamic from 'next/dynamic';

const ELOChart = dynamic(() => import('@/components/ELOChart'), { ssr: false });

const STATIC_TOPICS = [
    { id: 't1', name: 'Two Pointers', description: 'Opposite Ends, Same Direction, Fast & Slow', elo: 850, locked: false },
    { id: 't2', name: 'Sliding Window', description: 'Fixed Size, Variable Size, Shrinkable/Non-shrinkable', elo: 1050, locked: false },
    { id: 't3', name: 'Prefix Sum', description: '1D, 2D, Prefix Sum + Hashmap', elo: 1250, locked: true },
    { id: 't4', name: 'Binary Search', description: 'Classic, Search on Answer Space, Rotated Arrays', elo: 1350, locked: true },
    { id: 't5', name: 'Monotonic Stack', description: 'Next Greater Element, Histogram patterns', elo: 1600, locked: true },
    { id: 't6', name: 'Dynamic Programming', description: '1D, 2D, Knapsack, Interval, Bitmask', elo: 1800, locked: true },
];

export default function Dashboard() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight pb-2"><span className="text-gradient">Welcome back,</span> Camper</h1>
                    <p className="text-slate-400 text-lg">Your next challenge awaits. ELO rating is steady at 1200.</p>
                </div>
                <div className="flex gap-4">
                    <button className="glass-panel px-6 py-3 flex items-center gap-2 font-semibold hover:border-primary/50 text-slate-200">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                        Review Cheatsheets
                    </button>
                    <button className="btn-primary flex items-center gap-2">
                        <Play className="w-5 h-5 fill-current" />
                        Resume Training
                    </button>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 glass-panel p-6 relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-slate-300 font-bold flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-primary" /> ELO Progress History
                        </h3>
                        <div className="text-sm font-semibold text-green-400 flex items-center"><TrendingUp className="w-4 h-4 mr-1" />+45 this week</div>
                    </div>
                    <ELOChart />
                </div>

                <div className="flex flex-col gap-6">
                    <div className="glass-panel p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all">
                            <Trophy className="w-24 h-24 text-primary" />
                        </div>
                        <h3 className="text-slate-400 font-medium mb-2">Current ELO</h3>
                        <div className="text-4xl font-bold text-white">1200</div>
                    </div>

                    <div className="glass-panel p-6 relative overflow-hidden group md:col-span-1 border-primary/20 bg-primary/5 flex-1">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-40 group-hover:scale-110 transition-all">
                            <Sparkles className="w-24 h-24 text-primary" />
                        </div>
                        <h3 className="text-slate-300 font-medium mb-2 flex items-center gap-2">
                            <BrainCircuit className="w-4 h-4 text-primary" /> AI Insights
                        </h3>
                        <p className="text-sm text-slate-400">
                            You're struggling with <span className="text-red-400">off-by-one errors</span> in <i>Sliding Window</i>. Recommend reviewing loop invariants.
                        </p>
                    </div>
                </div>
            </div>

            {/* Topics Curriculum */}
            <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    Curriculum Map
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {STATIC_TOPICS.map((topic) => (
                        <Link href={`/topic/${topic.id}`} key={topic.id} className={`glass-panel p-6 transition-all relative overflow-hidden ${topic.locked ? 'opacity-70 grayscale hover:grayscale-0' : 'hover:-translate-y-1'}`}>
                            {topic.locked && (
                                <div className="absolute top-4 right-4 group-hover:opacity-0 transition-opacity">
                                    <ShieldAlert className="w-5 h-5 text-slate-500" />
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white">{topic.name}</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-6 h-10">
                                {topic.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                                <div className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                    Avg ELO: {topic.elo}
                                </div>
                                {!topic.locked ? (
                                    <span className="text-primary text-sm font-semibold flex items-center gap-1">Enter <ArrowRight className="w-4 h-4" /></span>
                                ) : (
                                    <span className="text-slate-500 text-sm font-semibold flex items-center gap-1">Locked (Requires Quiz)</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
