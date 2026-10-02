import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Zap,
  Award,
  BookmarkCheck,
  Flag,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Layers,
  Flame
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { aptitudeApi, gamificationApi, revisionApi } from '../../lib/api/client';
import { DataInterpretationView } from './DataInterpretationView';
import { ShimmerCard } from '../../components/ui/LoadingSkeleton';
import { useConfetti } from '../../hooks/useConfetti';
import { toast } from 'sonner';

interface TimedExamSessionProps {
  initialPreset?: string;
  initialTopic?: string;
  onExit: () => void;
}

interface ExamQuestion {
  id: string;
  topic: string;
  subtopic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  dataset?: any;
  passageId?: string;
  passage?: string;
}

export const TimedExamSession: React.FC<TimedExamSessionProps> = ({
  initialPreset = 'mini',
  initialTopic = '',
  onExit
}) => {
  const { triggerConfetti } = useConfetti();
  const queryClient = useQueryClient();

  // Configuration state
  const [preset, setPreset] = useState<string>(initialPreset);
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic);
  const [customCount, setCustomCount] = useState<number>(15);
  const [customDurationMinutes, setCustomDurationMinutes] = useState<number>(20);
  const [negativeMarking, setNegativeMarking] = useState<boolean>(true);

  // Active exam session state
  const [examId, setExamId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set());
  const [tabSwitches, setTabSwitches] = useState(0);

  // Timer state
  const [durationSeconds, setDurationSeconds] = useState(900);
  const [timeRemaining, setTimeRemaining] = useState(900);
  const [examStartTime, setExamStartTime] = useState<number | null>(null);
  const [isExamRunning, setIsExamRunning] = useState(false);

  // Per question time tracking
  const [questionTimeMap, setQuestionTimeMap] = useState<Record<string, number>>({});
  const qTimerRef = useRef<number>(Date.now());

  // Submit / Result State
  const [examResult, setExamResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'wrong' | 'unattempted'>('all');

  // Fetch topics
  const { data: topicsData } = useQuery({
    queryKey: ['aptitudeTopics'],
    queryFn: aptitudeApi.getTopics
  });

  // Fetch exam history for progress chart
  const { data: examHistoryData, refetch: refetchHistory } = useQuery({
    queryKey: ['aptitudeExamHistory'],
    queryFn: aptitudeApi.getExamHistory
  });

  // Storage key for exam state persistence
  const storageKey = useMemo(() => (examId ? `preppilot_exam_${examId}` : null), [examId]);

  // Load / Restore active exam state
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAnswers(parsed.answers || {});
        setMarkedForReview(new Set(parsed.markedForReview || []));
        setTabSwitches(parsed.tabSwitches || 0);
        if (parsed.timeRemaining && parsed.timeRemaining > 0) {
          setTimeRemaining(parsed.timeRemaining);
        }
      }
    } catch {}
  }, [storageKey]);

  // Save exam state on answer changes
  useEffect(() => {
    if (!storageKey || !isExamRunning) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          answers,
          markedForReview: Array.from(markedForReview),
          tabSwitches,
          timeRemaining
        })
      );
    } catch {}
  }, [storageKey, isExamRunning, answers, markedForReview, tabSwitches, timeRemaining]);

  // Tab switch detection (Informational Anti-Cheat Warning)
  useEffect(() => {
    if (!isExamRunning) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const next = prev + 1;
          toast.warning(`Tab switch detected (#${next}). Stay on this window during timed exams.`, {
            duration: 4000
          });
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isExamRunning]);

  // Start Exam Mutation
  const startExamMutation = useMutation({
    mutationFn: () =>
      aptitudeApi.startExam({
        preset,
        topic: preset === 'sectional' ? selectedTopic : preset === 'custom' ? (selectedTopic || undefined) : undefined,
        count: preset === 'custom' ? customCount : undefined,
        durationMinutes: preset === 'custom' ? customDurationMinutes : undefined,
        negativeMarking
      }),
    onSuccess: (data) => {
      setExamId(data.examId);
      setQuestions(data.questions || []);
      setDurationSeconds(data.durationSeconds);
      setTimeRemaining(data.durationSeconds);
      setExamStartTime(Date.now());
      setIsExamRunning(true);
      setCurrentIndex(0);
      setAnswers({});
      setMarkedForReview(new Set());
      setVisitedQuestions(new Set(data.questions[0] ? [data.questions[0].id] : []));
      setTabSwitches(0);
      qTimerRef.current = Date.now();
      toast.success('Exam started! Timer is ticking.');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to initialize exam.');
    }
  });

  // Track per-question time
  const currentQ = questions[currentIndex];
  useEffect(() => {
    if (currentQ) {
      setVisitedQuestions((prev) => new Set(prev).add(currentQ.id));
    }
    const now = Date.now();
    const elapsed = Math.round((now - qTimerRef.current) / 1000);
    if (currentQ && elapsed > 0) {
      setQuestionTimeMap((prev) => ({
        ...prev,
        [currentQ.id]: (prev[currentQ.id] || 0) + elapsed
      }));
    }
    qTimerRef.current = Date.now();
  }, [currentIndex, currentQ?.id]);

  // Countdown timer logic
  useEffect(() => {
    if (!isExamRunning || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam(true); // Auto-submit on time expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamRunning, timeRemaining]);

  // Submit Exam Handler
  const handleSubmitExam = useCallback(
    async (isAuto = false) => {
      if (!examId || isSubmitting) return;

      setIsSubmitting(true);
      setIsExamRunning(false);

      const timeTaken = durationSeconds - timeRemaining;

      try {
        const result = await aptitudeApi.submitExam(examId, {
          answers,
          timeTakenSeconds: Math.max(10, timeTaken),
          tabSwitches
        });

        setExamResult(result);
        if (storageKey) localStorage.removeItem(storageKey);

        // Award XP and Streak
        const xpEarned = preset === 'full_mock' ? 120 : preset === 'sectional' ? 50 : 20;
        gamificationApi.recordActivity({
          type: 'exam',
          duration: timeTaken,
          score: result.score
        }).catch(() => {});

        // Record revision for missed questions
        (result.questions || []).forEach((q: any) => {
          revisionApi.recordReview({
            topic: q.topic,
            questionId: q.id,
            isCorrect: q.isCorrect
          }).catch(() => {});
        });

        queryClient.invalidateQueries({ queryKey: ['gamification'] });
        queryClient.invalidateQueries({ queryKey: ['aptitudeExamHistory'] });
        refetchHistory();

        triggerConfetti();
        if (isAuto) {
          toast.info('Time expired! Your exam was automatically submitted.');
        } else {
          toast.success('Exam submitted and scored successfully!');
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to submit exam.');
        setIsExamRunning(true);
      } finally {
        setIsSubmitting(false);
        setShowConfirmModal(false);
      }
    },
    [examId, isSubmitting, durationSeconds, timeRemaining, answers, tabSwitches, preset, storageKey, queryClient, refetchHistory, triggerConfetti]
  );

  // Question Interaction
  const handleSelectOption = (idx: number) => {
    if (!currentQ || !isExamRunning) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: idx }));
  };

  const handleClearResponse = () => {
    if (!currentQ || !isExamRunning) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const toggleMarkForReview = () => {
    if (!currentQ) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) next.delete(currentQ.id);
      else next.add(currentQ.id);
      return next;
    });
  };

  // Keyboard Shortcuts (1-4, N, P, M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isExamRunning || isSubmitting) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        const optIdx = parseInt(e.key, 10) - 1;
        handleSelectOption(optIdx);
      } else if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') {
        if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'ArrowLeft') {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMarkForReview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExamRunning, isSubmitting, currentIndex, questions.length, currentQ]);

  // Format Time Remaining
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Recommended soft time hints
  const softTimeHint = useMemo(() => {
    if (!currentQ) return '60s';
    if (currentQ.difficulty === 'easy') return '45s';
    if (currentQ.difficulty === 'medium') return '75s';
    return '120s';
  }, [currentQ]);

  // Warning thresholds
  const timePercentRemaining = (timeRemaining / durationSeconds) * 100;
  const isUrgent = timePercentRemaining <= 10;
  const isWarning = timePercentRemaining <= 25 && !isUrgent;

  // -----------------------------------------------------------------
  // VIEW 1: Pre-Exam Setup & Rules Screen
  // -----------------------------------------------------------------
  if (!isExamRunning && !examResult) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black font-heading text-main">Timed Exam Simulator</h2>
                <p className="text-xs text-muted">
                  Strict exam environment with negative marking, time pacing, and comprehensive diagnostic report.
                </p>
              </div>
            </div>
            <button onClick={onExit} className="btn-secondary text-xs">
              Back to Overview
            </button>
          </div>

          {/* Preset Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* 1. Mini Test */}
            <div
              onClick={() => setPreset('mini')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                preset === 'mini'
                  ? 'border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/40'
                  : 'border-subtle bg-surface-subtle hover:border-highlight'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  Sprint Drill
                </span>
                <span className="font-mono text-muted text-[11px]">+20 XP</span>
              </div>
              <h3 className="text-base font-bold font-heading text-main">Mini Test</h3>
              <p className="text-xs text-muted">10 Mixed Questions • 15 Minutes</p>
            </div>

            {/* 2. Sectional Test */}
            <div
              onClick={() => setPreset('sectional')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                preset === 'sectional'
                  ? 'border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/40'
                  : 'border-subtle bg-surface-subtle hover:border-highlight'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  Deep Focus
                </span>
                <span className="font-mono text-muted text-[11px]">+50 XP</span>
              </div>
              <h3 className="text-base font-bold font-heading text-main">Sectional Test</h3>
              <p className="text-xs text-muted">20 Questions • 30 Min • Single Domain</p>
            </div>

            {/* 3. Full Mock Test */}
            <div
              onClick={() => setPreset('full_mock')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                preset === 'full_mock'
                  ? 'border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/40'
                  : 'border-subtle bg-surface-subtle hover:border-highlight'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Full Benchmark
                </span>
                <span className="font-mono text-muted text-[11px]">+120 XP</span>
              </div>
              <h3 className="text-base font-bold font-heading text-main">Full Aptitude Mock</h3>
              <p className="text-xs text-muted">45 Questions • 60 Min • All 9 Topics</p>
            </div>

            {/* 4. Custom Test */}
            <div
              onClick={() => setPreset('custom')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                preset === 'custom'
                  ? 'border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/40'
                  : 'border-subtle bg-surface-subtle hover:border-highlight'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  Configurable
                </span>
                <span className="font-mono text-muted text-[11px]">Dynamic</span>
              </div>
              <h3 className="text-base font-bold font-heading text-main">Custom Drill</h3>
              <p className="text-xs text-muted">Pick count, timer, and topics</p>
            </div>
          </div>

          {/* Sectional / Custom Options */}
          {(preset === 'sectional' || preset === 'custom') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-subtle border border-subtle">
              <div className="space-y-2">
                <label className="text-xs font-bold text-main">Select Section / Topic:</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-surface border border-subtle rounded-xl px-3.5 py-2.5 text-xs text-main focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Topics Combined</option>
                  {(topicsData?.topics || []).map((t: any) => (
                    <option key={t.topic} value={t.topic}>
                      {t.topic} ({t.count} Qs)
                    </option>
                  ))}
                </select>
              </div>

              {preset === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-main">Questions:</label>
                    <select
                      value={customCount}
                      onChange={(e) => setCustomCount(Number(e.target.value))}
                      className="w-full bg-surface border border-subtle rounded-xl px-3 py-2.5 text-xs text-main"
                    >
                      <option value={10}>10 Questions</option>
                      <option value={20}>20 Questions</option>
                      <option value={30}>30 Questions</option>
                      <option value={45}>45 Questions</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-main">Duration:</label>
                    <select
                      value={customDurationMinutes}
                      onChange={(e) => setCustomDurationMinutes(Number(e.target.value))}
                      className="w-full bg-surface border border-subtle rounded-xl px-3 py-2.5 text-xs text-main"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Exam Rules & Options */}
          <div className="p-5 rounded-2xl bg-surface-subtle border border-subtle space-y-4">
            <h4 className="text-xs font-bold text-main uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Exam Rules & Scoring Scheme</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><strong>+1.0 Mark</strong> for every correct response.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span>
                  <strong>-0.25 Mark</strong> for incorrect responses (if negative marking enabled).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <span>No answer or explanation hints are disclosed until final submission.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>Tab switches are tracked and summarized in your final assessment report.</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-subtle/80">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={negativeMarking}
                  onChange={(e) => setNegativeMarking(e.target.checked)}
                  className="rounded border-subtle text-indigo-500 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-main">Enable Standard Negative Marking (-0.25)</span>
              </label>

              <span className="text-[11px] text-muted font-mono">
                Timer starts immediately upon clicking "Start Exam"
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Streak & Readiness Index will update automatically upon completion.</span>
            </span>
            <button
              onClick={() => startExamMutation.mutate()}
              disabled={startExamMutation.isPending}
              className="btn-primary text-xs px-7 py-3 flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20"
            >
              <span>{startExamMutation.isPending ? 'Preparing Exam...' : 'Start Exam Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // VIEW 2: Exam Result & Comprehensive Report Screen
  // -----------------------------------------------------------------
  if (examResult) {
    const answeredCount = Object.keys(examResult.answers || answers).length;
    const questionsList = examResult.questions || [];

    const filteredQuestions = questionsList.filter((q: any) => {
      if (reviewFilter === 'correct') return q.isCorrect;
      if (reviewFilter === 'wrong') return q.selectedOption !== undefined && !q.isCorrect;
      if (reviewFilter === 'unattempted') return q.selectedOption === undefined;
      return true;
    });

    // Chart trend data from exam history
    const historyData = (examHistoryData?.history || []).map((h: any, idx: number) => ({
      attempt: `Exam ${idx + 1}`,
      score: h.score,
      accuracy: h.accuracy || Math.round((h.score / (h.totalQuestions || 10)) * 100)
    }));

    return (
      <div className="space-y-6">
        {/* Top Summary Banner */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-subtle pb-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Official Assessment Report
                </span>
                <h2 className="text-2xl font-black font-heading text-main">
                  {preset === 'full_mock'
                    ? 'Full Aptitude Mock Drill'
                    : preset === 'sectional'
                    ? `Sectional Drill (${selectedTopic || 'Domain'})`
                    : 'Aptitude Timed Exam'}
                </h2>
                <p className="text-xs text-muted">
                  Time Taken: {Math.round(examResult.timeTakenSeconds / 60)} min {examResult.timeTakenSeconds % 60}s • Tab Switches: {examResult.tabSwitches || tabSwitches}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setExamResult(null);
                  setIsExamRunning(false);
                }}
                className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Take Another Exam</span>
              </button>
              <button onClick={onExit} className="btn-secondary text-xs px-4 py-2.5">
                Dashboard
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-subtle text-center">
              <span className="text-xs font-bold text-muted uppercase">Final Score</span>
              <p className="text-3xl font-black text-indigo-400 tabular-nums mt-1">
                {examResult.score}{' '}
                <span className="text-xs text-muted font-normal">/ {examResult.totalQuestions}</span>
              </p>
              {examResult.negativePenalty > 0 && (
                <span className="text-[10px] text-rose-400 font-medium block">
                  -{examResult.negativePenalty} penalty applied
                </span>
              )}
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-subtle text-center">
              <span className="text-xs font-bold text-muted uppercase">Accuracy</span>
              <p className="text-3xl font-black text-emerald-400 tabular-nums mt-1">
                {examResult.accuracy}%
              </p>
              <span className="text-[10px] text-muted block">
                {examResult.totalCorrect} correct of {answeredCount} attempted
              </span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-subtle text-center">
              <span className="text-xs font-bold text-muted uppercase">Attempt Rate</span>
              <p className="text-3xl font-black text-cyan-400 tabular-nums mt-1">
                {Math.round((answeredCount / (examResult.totalQuestions || 1)) * 100)}%
              </p>
              <span className="text-[10px] text-muted block">
                {examResult.totalQuestions - answeredCount} unattempted
              </span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-subtle text-center">
              <span className="text-xs font-bold text-muted uppercase">Pacing / Q</span>
              <p className="text-3xl font-black text-amber-400 tabular-nums mt-1">
                {answeredCount > 0 ? Math.round(examResult.timeTakenSeconds / answeredCount) : 0}s
              </p>
              <span className="text-[10px] text-muted block">Average response time</span>
            </div>
          </div>

          {/* Historical Score Comparison Chart */}
          {historyData.length > 1 && (
            <div className="p-5 rounded-2xl bg-surface-subtle border border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-main">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Performance Trend (Past Attempts)</span>
                </div>
                <span className="text-[10px] text-muted">Continuous benchmark calibration</span>
              </div>
              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" strokeOpacity={0.5} />
                    <XAxis dataKey="attempt" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="glass-panel p-2.5 rounded-xl border border-subtle text-xs space-y-1">
                              <p className="font-bold text-main">{label}</p>
                              <p className="text-indigo-400 font-semibold">Score: {payload[0]?.value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="oklch(0.65 0.24 275)"
                      strokeWidth={2.5}
                      dot={{ fill: 'oklch(0.65 0.24 275)', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Section Breakdown & Diagnostic Insights */}
          {examResult.sectionBreakdown && Object.keys(examResult.sectionBreakdown).length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-main flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Domain Breakdown & Accuracy</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(examResult.sectionBreakdown).map(([sec, data]: [string, any]) => {
                  const secAcc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                  return (
                    <div key={sec} className="p-3.5 rounded-xl bg-surface border border-subtle space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-main truncate">{sec}</span>
                        <span className={`font-bold tabular-nums ${secAcc >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {secAcc}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${secAcc >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${secAcc}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted block">
                        {data.correct} / {data.total} Correct
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Review Mode with Explanations */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-subtle pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold font-heading text-main">Detailed Question Review</h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-xl border border-subtle text-xs">
              {(['all', 'correct', 'wrong', 'unattempted'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setReviewFilter(filterKey)}
                  className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                    reviewFilter === filterKey
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'text-muted hover:text-main'
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q: any, idx: number) => {
              const isSelected = q.selectedOption !== undefined;
              return (
                <div
                  key={q.id || idx}
                  className="p-5 rounded-2xl bg-surface border border-subtle space-y-4"
                >
                  <div className="flex items-center justify-between text-xs border-b border-subtle pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-main font-mono">Q{idx + 1}</span>
                      <span className="text-muted">•</span>
                      <span className="text-indigo-300 font-semibold">{q.topic}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-surface-subtle text-muted">
                        {q.difficulty}
                      </span>
                    </div>

                    <div>
                      {q.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" /> +1.0 Mark (Correct)
                        </span>
                      ) : isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg">
                          <XCircle className="w-3.5 h-3.5" /> -0.25 Mark (Incorrect)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted bg-surface-subtle px-2 py-0.5 rounded-lg">
                          0 Mark (Unattempted)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reading Passage if any */}
                  {q.passage && (
                    <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-muted leading-relaxed max-h-36 overflow-y-auto">
                      <strong className="text-indigo-300 block mb-1">Passage:</strong>
                      {q.passage}
                    </div>
                  )}

                  {/* Question Text & Dataset */}
                  <p className="text-sm font-semibold text-main leading-relaxed">{q.question}</p>

                  {q.dataset && <DataInterpretationView dataset={q.dataset} />}

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options?.map((opt: string, optIdx: number) => {
                      const isCorrectOpt = optIdx === q.correctOption;
                      const isUserChoice = optIdx === q.selectedOption;

                      let style = 'border-subtle bg-surface-subtle text-muted';
                      if (isCorrectOpt) {
                        style = 'border-emerald-500 bg-emerald-500/15 text-emerald-200 font-semibold';
                      } else if (isUserChoice && !q.isCorrect) {
                        style = 'border-rose-500 bg-rose-500/15 text-rose-200';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${style}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] border border-subtle">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                          {isUserChoice && !q.isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation & Shortcut */}
                  <div className="p-4 rounded-xl bg-surface-subtle border border-subtle/80 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-main">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Step-by-Step Solution:</span>
                    </div>
                    <p className="text-muted leading-relaxed text-[11px] sm:text-xs">
                      {q.explanation || 'Detailed verification steps.'}
                    </p>
                    {q.shortcut && (
                      <div className="text-[11px] text-indigo-300 font-medium pt-1 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Shortcut: {q.shortcut}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // VIEW 3: Active Exam Screen
  // -----------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Global Countdown Timer & Exam Header */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-subtle flex flex-wrap items-center justify-between gap-4 sticky top-16 z-20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            {preset === 'full_mock'
              ? 'Full Aptitude Mock'
              : preset === 'sectional'
              ? `Sectional: ${selectedTopic || 'Mixed'}`
              : 'Timed Exam'}
          </span>
          <span className="text-muted text-xs">•</span>
          <span className="text-xs font-mono font-bold text-main tabular-nums">
            Q {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-[11px] text-muted hidden md:inline-block">
            (Pacing hint: <strong className="text-indigo-300">{softTimeHint}</strong>)
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer Display */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-black text-sm tabular-nums transition-all ${
              isUrgent
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse ring-2 ring-rose-500/30'
                : isWarning
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-surface-subtle border-subtle text-main'
            }`}
          >
            <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-indigo-400'}`} />
            <span>{formatTime(timeRemaining)}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="btn-primary text-xs px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Main Exam Grid: Left Question, Right Question Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Question Pane */}
        <div className="lg:col-span-8 space-y-6">
          {currentQ && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-subtle pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-300 uppercase">
                    {currentQ.topic}
                  </span>
                  <span className="text-muted text-xs">•</span>
                  <span className="text-xs text-muted">{currentQ.subtopic || 'General'}</span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      currentQ.difficulty === 'easy'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : currentQ.difficulty === 'medium'
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {currentQ.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMarkForReview}
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      markedForReview.has(currentQ.id)
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-surface-subtle border-subtle text-muted hover:text-main'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{markedForReview.has(currentQ.id) ? 'Marked' : 'Mark for Review (M)'}</span>
                  </button>
                </div>
              </div>

              {/* Shared Passage (if present) */}
              {currentQ.passage && (
                <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 bg-indigo-950/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Reading Passage</span>
                  </div>
                  <p className="text-xs sm:text-sm text-main/90 leading-relaxed max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {currentQ.passage}
                  </p>
                </div>
              )}

              {/* Question Text */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-main leading-relaxed">
                  {currentQ.question}
                </h3>

                {/* Data Interpretation Dataset */}
                {currentQ.dataset && <DataInterpretationView dataset={currentQ.dataset} />}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {currentQ.options.map((optionText: string, idx: number) => {
                  const isSelected = answers[currentQ.id] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200 shadow-sm ring-1 ring-indigo-500/40'
                          : 'border-subtle bg-surface-subtle text-muted hover:text-main hover:border-highlight'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono border ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500/40 text-indigo-300'
                              : 'border-subtle bg-surface text-muted'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm font-medium leading-relaxed">{optionText}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-50 px-1.5 py-0.5 rounded border border-subtle hidden sm:inline-block">
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Action Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-subtle">
                <button
                  onClick={handleClearResponse}
                  disabled={answers[currentQ.id] === undefined}
                  className="btn-secondary text-xs px-3.5 py-2 text-rose-300 disabled:opacity-40"
                >
                  Clear Response
                </button>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((i) => i - 1)}
                    className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Prev (P)</span>
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex((i) => i + 1)}
                      className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
                    >
                      <span>Next (N)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"
                    >
                      <span>Review & Submit</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 4 cols: Question Palette */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-5 rounded-3xl border border-subtle space-y-4 sticky top-36">
            <h4 className="text-xs font-bold font-heading text-main uppercase tracking-wider">
              Question Palette ({questions.length})
            </h4>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-500/30 border border-emerald-500/50" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-amber-500/30 border border-amber-500/50" />
                <span>Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-indigo-500 text-white" />
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-surface-subtle border border-subtle" />
                <span>Not Visited</span>
              </div>
            </div>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar pt-2">
              {questions.map((q, idx) => {
                const isCurr = idx === currentIndex;
                const isAnswered = answers[q.id] !== undefined;
                const isMarked = markedForReview.has(q.id);
                const isVisited = visitedQuestions.has(q.id);

                let btnStyle = 'bg-surface-subtle text-muted border-subtle hover:border-highlight';
                if (isCurr) {
                  btnStyle = 'bg-indigo-500 text-white border-indigo-400 font-extrabold shadow-md';
                } else if (isMarked) {
                  btnStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold';
                } else if (isAnswered) {
                  btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold';
                } else if (isVisited) {
                  btnStyle = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center relative ${btnStyle}`}
                  >
                    {idx + 1}
                    {isMarked && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick summary stats */}
            <div className="pt-3 border-t border-subtle text-xs space-y-1.5">
              <div className="flex justify-between text-muted">
                <span>Total Answered:</span>
                <strong className="text-emerald-400 font-mono">{Object.keys(answers).length}</strong>
              </div>
              <div className="flex justify-between text-muted">
                <span>Marked for Review:</span>
                <strong className="text-amber-400 font-mono">{markedForReview.size}</strong>
              </div>
              <div className="flex justify-between text-muted">
                <span>Tab Switches:</span>
                <strong className="text-main font-mono">{tabSwitches}</strong>
              </div>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="btn-primary w-full py-2.5 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 mt-2"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Submit */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-subtle max-w-md w-full space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-main">Confirm Exam Submission</h3>
                <p className="text-xs text-muted">Are you ready to submit and calculate your score?</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-subtle border border-subtle space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Total Questions:</span>
                <strong className="text-main">{questions.length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Attempted:</span>
                <strong className="text-emerald-400">{Object.keys(answers).length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Unattempted:</span>
                <strong className="text-rose-400">{questions.length - Object.keys(answers).length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Marked for Review:</span>
                <strong className="text-amber-400">{markedForReview.size}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Time Remaining:</span>
                <strong className="text-indigo-300 font-mono">{formatTime(timeRemaining)}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary flex-1 text-xs py-2.5"
              >
                Return to Exam
              </button>
              <button
                onClick={() => handleSubmitExam(false)}
                disabled={isSubmitting}
                className="btn-primary flex-1 text-xs py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Evaluating...' : 'Yes, Submit'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
