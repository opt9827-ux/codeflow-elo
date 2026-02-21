"use client";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';


import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, FileText, Loader2, Lock, XCircle } from 'lucide-react';
import Link from 'next/link';

interface QuizData {
    cheat_sheet: string;
    questions: {
        question: string;
        options: string[];
        correctOptionIndex: number;
        explanation: string;
    }[];
}

const STATIC_TOPICS = [
    { id: 't1', name: 'Two Pointers' },
    { id: 't2', name: 'Sliding Window' },
    { id: 't3', name: 'Prefix Sum' },
    { id: 't4', name: 'Binary Search' },
    { id: 't5', name: 'Monotonic Stack' },
    { id: 't6', name: 'Dynamic Programming' },
];


export default function TopicGatekeeper() {
    const params = useParams();
    const router = useRouter();
    const topicId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        // Simulated fetch or actual AI generation call
        const fetchQuiz = async () => {
            try {
                const topicName = STATIC_TOPICS.find(t => t.id === topicId)?.name || 'General DSA';
                const res = await fetch('/api/generate-quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subTopicName: topicName })
                });
                const data = await res.json();
                setQuizData(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [topicId]);

    const handleSelect = (qIndex: number, optIndex: number) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
    };

    const calculateScore = () => {
        if (!quizData) return;
        let s = 0;
        quizData.questions.forEach((q, i) => {
            if (answers[i] === q.correctOptionIndex) s++;
        });
        setScore(s);
        setSubmitted(true);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-xl text-slate-300 font-medium animate-pulse">AI is generating your custom curriculum...</p>
            </div>
        );
    }

    if (!quizData || !quizData.questions) {
        return <div>Error loading curriculum. Please try again.</div>;
    }

    const passed = score >= 4;

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-24">
            <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Curriculum
            </Link>

            {/* Cheat Sheet */}
            <div className="glass-panel p-8 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold">AI Cheat Sheet</h2>
                </div>
                <div className="prose prose-invert max-w-none text-slate-300">
                    <pre className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 whitespace-pre-wrap font-sans">
                        {quizData.cheat_sheet}
                    </pre>
                </div>
            </div>

            {/* Gatekeeper Quiz */}
            <div className="glass-panel p-8 relative overflow-hidden">
                {submitted && passed && (
                    <div className="absolute inset-0 bg-green-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in duration-500">
                        <div className="bg-green-500/20 p-6 rounded-full animate-bounce mb-6">
                            <CheckCircle2 className="w-16 h-16 text-green-400" />
                        </div>
                        <h2 className="text-4xl font-extrabold text-white mb-2">Gate Unlocked!</h2>
                        <p className="text-xl text-green-200 mb-8">Score: {score}/5. You have proved your understanding.</p>
                        <button
                            onClick={() => router.push(`/workspace/${topicId}`)}
                            className="btn-primary text-lg px-8 py-4 flex items-center gap-3">
                            Enter Workspace <ArrowLeft className="w-5 h-5 rotate-180" />
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-800">
                    <div className="p-3 bg-primary/20 rounded-lg">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Gatekeeper Quiz</h2>
                        <p className="text-slate-400">Score 4/5 or higher to unlock the problem workspace.</p>
                    </div>
                </div>

                <div className="space-y-10">
                    {quizData.questions.map((q, i) => (
                        <div key={i} className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">
                                <span className="text-primary mr-2">Q{i + 1}.</span> {q.question}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((opt, oIndex) => {
                                    const isSelected = answers[i] === oIndex;
                                    const isCorrect = q.correctOptionIndex === oIndex;
                                    const showSuccess = submitted && isCorrect;
                                    const showFail = submitted && isSelected && !isCorrect;

                                    let btnClass = "text-left p-4 rounded-xl border transition-all duration-200 ";
                                    if (showSuccess) btnClass += "bg-green-500/20 border-green-500 text-green-100";
                                    else if (showFail) btnClass += "bg-red-500/20 border-red-500 text-red-100";
                                    else if (isSelected) btnClass += "bg-primary/20 border-primary text-white";
                                    else btnClass += "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-500";

                                    return (
                                        <button
                                            key={oIndex}
                                            disabled={submitted}
                                            onClick={() => handleSelect(i, oIndex)}
                                            className={btnClass}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{opt}</span>
                                                {showSuccess && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                                {showFail && <XCircle className="w-5 h-5 text-red-500" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            {submitted && (
                                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg text-sm text-slate-400 mt-2">
                                    <span className="text-primary font-semibold">Explanation:</span> {q.explanation}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {!submitted && (
                    <div className="mt-10 flex justify-end">
                        <button
                            disabled={Object.keys(answers).length < 5}
                            onClick={calculateScore}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Answers & Verify
                        </button>
                    </div>
                )}

                {submitted && !passed && (
                    <div className="mt-10 p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                        <h3 className="text-xl font-bold text-red-400 mb-2">Score: {score}/5</h3>
                        <p className="text-red-200 mb-6">You need at least 4/5 to unlock the workspace. Review the cheat sheet and try again.</p>
                        <button onClick={() => { setSubmitted(false); setAnswers({}); }} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-semibold border border-slate-600">
                            Retry Quiz
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
