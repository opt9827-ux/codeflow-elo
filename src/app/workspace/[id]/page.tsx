"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { Bot, ChevronLeft, Loader2, Play, Sparkles, CheckCircle, XCircle, Globe } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { getLanguageBoilerplate, SupportedLanguage, LANGUAGE_MODES } from '@/utils/boilerplate';

interface SubTopicProblem {
    id: string;
    title: string;
    markdown_description: string;
    constraints: string;
    sample_io: { input: string; output: string; explanation: string }[];
    difficulty_elo: number;
    boilerplates?: Record<string, string>;
}

export default function Workspace() {
    const router = useRouter();
    const rawParams = useParams();
    const topicId = typeof rawParams?.id === 'string' ? rawParams.id : '';

    const [problem, setProblem] = useState<Partial<SubTopicProblem> | null>(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState<SupportedLanguage>('javascript');
    const [code, setCode] = useState(getLanguageBoilerplate('javascript'));
    const [aiHint, setAiHint] = useState<string | null>(null);
    const [isObserving, setIsObserving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [output, setOutput] = useState<string | null>(null);
    const [result, setResult] = useState<{ passed: boolean; eloChange: number; newELO: number } | null>(null);

    const streamingStarted = useRef(false);

    useEffect(() => {
        if (!topicId || streamingStarted.current) return;
        streamingStarted.current = true;

        const initProblem = async () => {
            try {
                const response = await fetch('/api/generate-problem', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subTopicName: 'Two Pointers', userELO: 1200 })
                });

                if (!response.body) throw new Error('No body');
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let accumulatedText = '';

                setLoading(false);

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    accumulatedText += decoder.decode(value, { stream: true });

                    try {
                        const titleMatch = accumulatedText.match(/"title":\s*"([^"]*)"/);
                        const descMatch = accumulatedText.match(/"markdown_description":\s*"([^"]*)"/);
                        const constraintsMatch = accumulatedText.match(/"constraints":\s*"([^"]*)"/);
                        const eloMatch = accumulatedText.match(/"difficulty_elo":\s*(\d+)/);

                        setProblem(prev => ({
                            ...prev,
                            title: titleMatch ? titleMatch[1].replace(/\\n/g, '\n') : prev?.title || 'Generating...',
                            markdown_description: descMatch ? descMatch[1].replace(/\\n/g, '\n') : prev?.markdown_description || '',
                            constraints: constraintsMatch ? constraintsMatch[1].replace(/\\n/g, '\n') : prev?.constraints || '',
                            difficulty_elo: eloMatch ? parseInt(eloMatch[1]) : prev?.difficulty_elo || 1250,
                            id: '00000000-0000-0000-0000-000000000001'
                        }));

                        if (accumulatedText.includes('"boilerplates"')) {
                            const boilerMatch = accumulatedText.match(/"boilerplates":\s*\{([^}]*)\}/);
                            if (boilerMatch) {
                                const boilerText = `{${boilerMatch[1]}}`;
                                try {
                                    const boilerplates = JSON.parse(boilerText);
                                    setProblem(prev => ({ ...prev, boilerplates }));
                                } catch (e) { }
                            }
                        }

                    } catch (e) {
                        // Ignore partial parse errors
                    }
                }
            } catch (e) {
                console.error("Failed to load problem:", e);
            } finally {
                setLoading(false);
            }
        };
        initProblem();
    }, [topicId]);

    const handleLanguageChange = (newLang: SupportedLanguage) => {
        setLanguage(newLang);
        if (problem?.boilerplates?.[newLang]) {
            setCode(problem.boilerplates[newLang]);
        } else {
            setCode(getLanguageBoilerplate(newLang));
        }
    };

    useEffect(() => {
        if (problem?.boilerplates?.[language]) {
            const defaultBoiler = getLanguageBoilerplate(language);
            if (code === defaultBoiler || code.length < 50) {
                setCode(problem.boilerplates[language]);
            }
        }
    }, [problem?.boilerplates, language]);

    const handleSubmit = async () => {
        if (!problem || isSubmitting) return;
        setIsSubmitting(true);
        setResult(null);
        setOutput("Running tests on AI Gatekeeper servers...");

        try {
            const res = await fetch('/api/submit-solution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: '00000000-0000-0000-0000-000000000000',
                    problemId: problem.id,
                    code: code,
                    language: language,
                    topicId: topicId
                })
            });
            const data = await res.json();

            if (res.ok && data.success && data.passed) {
                setResult({
                    passed: true,
                    eloChange: data.eloChange ?? 0,
                    newELO: data.newELO ?? 1200
                });
                setOutput(`Success! All test cases passed.\nYour new ELO: ${data.newELO ?? 1200} (+${data.eloChange ?? 0})`);
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#00E5FF', '#2a8af6', '#a853ba']
                });
            } else if (res.ok && data.success) {
                setResult({
                    passed: false,
                    eloChange: data.eloChange ?? 0,
                    newELO: data.newELO ?? 1200
                });
                setOutput(`Failure. Logic error detected.\nYour new ELO: ${data.newELO ?? 1200} (${data.eloChange ?? 0})`);
            } else {
                setOutput(`Error: ${data.error || 'Submission failed'}`);
                setResult(null);
            }
        } catch (e) {
            setOutput("Error submitting solution. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-white">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                    Forging your unique problem...
                </h2>
                <p className="text-slate-400">Connecting to Gemini Optimization Engine...</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-4 p-4">
            {/* Left Panel */}
            <div className="w-5/12 bg-slate-900/50 border border-slate-800 rounded-xl p-6 overflow-y-auto flex flex-col gap-6">
                <div>
                    <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white mb-4 inline-flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> Exit Workspace
                    </Link>
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl font-bold text-white">{problem?.title || 'Generating...'}</h1>
                        <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 rounded text-xs font-bold">
                            ELO {problem?.difficulty_elo}
                        </span>
                    </div>
                </div>

                <div className="text-slate-300 border-b border-slate-800 pb-4">
                    <p className="whitespace-pre-wrap">{problem?.markdown_description || 'Setting context...'}</p>
                </div>

                {problem?.constraints && (
                    <div className="text-slate-400 text-sm italic">
                        <h4 className="text-white font-semibold not-italic mb-2">Constraints</h4>
                        <p className="whitespace-pre-wrap">{problem.constraints}</p>
                    </div>
                )}

                <div>
                    <h3 className="text-lg font-semibold mb-3 text-white">Sample IO</h3>
                    <div className="space-y-4">
                        {problem?.sample_io ? problem.sample_io.map((io, idx) => (
                            <div key={idx} className="bg-slate-950 p-4 border border-slate-800 rounded-lg">
                                <p className="font-mono text-sm text-slate-300"><span className="text-blue-400 font-bold">Input:</span> {io.input}</p>
                                <p className="font-mono text-sm text-green-300 mt-1"><span className="text-blue-400 font-bold">Output:</span> {io.output}</p>
                                {io.explanation && <p className="text-xs text-slate-500 mt-2">{io.explanation}</p>}
                            </div>
                        )) : <div className="animate-pulse h-20 bg-slate-800 rounded-lg" />}
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-7/12 flex flex-col gap-4">
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col relative">
                    <div className="h-10 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Globe className="w-4 h-4" />
                                <select
                                    value={language}
                                    onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                                    className="bg-transparent border-none text-xs font-mono focus:ring-0 cursor-pointer hover:text-white transition-colors"
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                            {isObserving ? <><Loader2 className="w-3 h-3 animate-spin" /> AI Observing...</> : <><Sparkles className="w-3 h-3" /> AI Active</>}
                        </div>
                    </div>

                    <Editor
                        height="100%"
                        language={LANGUAGE_MODES[language]}
                        theme="vs-dark"
                        value={code}
                        onChange={(val) => setCode(val || '')}
                        options={{ minimap: { enabled: false }, fontSize: 14 }}
                    />

                    {aiHint && (
                        <div className="absolute bottom-6 right-6 max-w-sm bg-blue-900/90 backdrop-blur-md border border-blue-500/50 p-4 rounded-xl shadow-2xl z-20">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 text-blue-300 font-bold"><Bot className="w-5 h-5" /> Trainer Hint</div>
                                <button onClick={() => setAiHint(null)} className="text-blue-400 hover:text-white">✕</button>
                            </div>
                            <p className="text-sm text-blue-100">{aiHint}</p>
                        </div>
                    )}
                </div>

                <div className="h-48 bg-slate-900 border border-slate-800 rounded-xl flex flex-col">
                    <div className="h-10 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4">
                        <div className="text-sm text-slate-300 font-medium">Console</div>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 px-4 py-1 rounded text-sm disabled:opacity-50 transition-colors">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                            Submit Solution
                        </button>
                    </div>
                    <div className={`flex-1 p-4 font-mono text-sm whitespace-pre-wrap overflow-y-auto ${result?.passed ? 'text-green-400' : result?.passed === false ? 'text-red-400' : 'text-slate-300'}`}>
                        {output || "Ready for submission..."}
                        {result && (
                            <div className="mt-4 flex items-center gap-2 text-lg font-bold">
                                {result.passed ? <CheckCircle className="text-green-400" /> : <XCircle className="text-red-400" />}
                                {result.passed ? "PASSED" : "FAILED"} - ELO: {result.newELO} ({result.eloChange > 0 ? '+' : ''}{result.eloChange})
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}