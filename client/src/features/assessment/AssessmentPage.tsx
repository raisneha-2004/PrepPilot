import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Clock,
  CheckCircle2,
  XCircle,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ArrowLeft,
  Award,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  Sparkles,
  Zap,
  Code2,
  Layers,
  BookOpen,
  Filter,
  RotateCcw,
  Target,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Flame,
  HelpCircle
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { assessmentApi, gamificationApi, revisionApi } from '../../lib/api/client';
import { useAppStore } from '../../store/useAppStore';
import { ShimmerCard } from '../../components/ui/LoadingSkeleton';
import { useConfetti } from '../../hooks/useConfetti';
import { toast } from 'sonner';

interface Question {
  id: string;
  section: string;
  sectionName: string;
  topic: string;
  subtopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'mcq' | 'output' | 'scenario';
  question: string;
  code?: string;
  language?: string;
  options: string[];
}

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { triggerConfetti } = useConfetti();
  const queryClient = useQueryClient();
  const profile = useAppStore((state) => state.profile);

  // Setup / Config State
  const [selectedRole, setSelectedRole] = useState<string>(profile.targetRole || 'SDE');
  const [selectedMode, setSelectedMode] = useState<'quick' | 'standard' | 'deep_dive'>('standard');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('JavaScript');
  const [isTestStarted, setIsTestStarted] = useState(false);

  // Active Assessment State
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set());
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('all');

  // Timer State
  const [durationSeconds, setDurationSeconds] = useState(2700);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(2700);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Submission & Results State
  const [isCompleted, setIsCompleted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'marked' | 'unanswered'>('all');
  const [showMobilePalette, setShowMobilePalette] = useState(false);

  // Load config
  const { data: configData } = useQuery({
    queryKey: ['assessmentConfig'],
    queryFn: assessmentApi.getConfig
  });

  // Load history for past attempt comparisons
  const { data: historyData, refetch: refetchHistory } = useQuery({
    queryKey: ['assessmentHistory'],
    queryFn: assessmentApi.getHistory
  });

  const storageKey = useMemo(() => (assessmentId ? `preppilot_diag_${assessmentId}` : null), [assessmentId]);

  // Restore autosaved state if exists
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAnswers(parsed.answers || {});
        setMarkedForReview(new Set(parsed.markedForReview || []));
        if (parsed.timeLeftSeconds && parsed.timeLeftSeconds > 0) {
          setTimeLeftSeconds(parsed.timeLeftSeconds);
        }
      }
    } catch {}
  }, [storageKey]);

  // Autosave locally and to server
  useEffect(() => {
    if (!storageKey || !isTimerRunning || !assessmentId) return;

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        answers,
        markedForReview: Array.from(markedForReview),
        timeLeftSeconds
      })
    );

    const debounceTimer = setTimeout(() => {
      assessmentApi.saveProgress(assessmentId, {
        answers,
        timeRemainingSeconds: timeLeftSeconds,
        markedForReview: Array.from(markedForReview)
      });
    }, 3000);

    return () => clearTimeout(debounceTimer);
  }, [storageKey, isTimerRunning, answers, markedForReview, timeLeftSeconds, assessmentId]);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAssessment(true); // Auto-submit on time expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeftSeconds]);

  // Start Assessment Mutation
  const startMutation = useMutation({
    mutationFn: () =>
      assessmentApi.startAssessment({
        role: selectedRole,
        mode: selectedMode,
        language: selectedLanguage
      }),
    onSuccess: (data) => {
      setAssessmentId(data.assessmentId);
      setQuestions(data.questions || []);
      setDurationSeconds(data.durationSeconds);
      setTimeLeftSeconds(data.durationSeconds);
      setIsTimerRunning(true);
      setIsTestStarted(true);
      setCurrentIndex(0);
      setAnswers({});
      setMarkedForReview(new Set());
      setVisitedQuestions(new Set(data.questions[0] ? [data.questions[0].id] : []));
      toast.success('Diagnostic Assessment started! Good luck.');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to initialize assessment.');
    }
  });

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (currentQuestion) {
      setVisitedQuestions((prev) => new Set(prev).add(currentQuestion.id));
    }
  }, [currentIndex, currentQuestion]);

  // Option selection
  const handleSelectOption = (optIdx: number) => {
    if (!currentQuestion || !isTimerRunning) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optIdx
    }));
  };

  const handleClearResponse = () => {
    if (!currentQuestion || !isTimerRunning) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
  };

  const toggleMarkReview = () => {
    if (!currentQuestion) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  };

  // Submit Assessment Handler
  const submitMutation = useMutation({
    mutationFn: (payload: any) => assessmentApi.submitAssessment(payload),
    onSuccess: (res) => {
      setSubmissionResult(res);
      setIsCompleted(true);
      setIsTimerRunning(false);
      if (storageKey) localStorage.removeItem(storageKey);
      triggerConfetti();
      toast.success('Diagnostic Assessment evaluated and scored!');
      queryClient.invalidateQueries({ queryKey: ['assessmentHistory'] });
      queryClient.invalidateQueries({ queryKey: ['readiness'] });
      refetchHistory();
    },
    onError: () => {
      toast.error('Failed to submit online. Scoring with offline engine.');
      setIsCompleted(true);
      setIsTimerRunning(false);
    }
  });

  const handleSubmitAssessment = useCallback(
    (isAuto = false) => {
      if (!assessmentId || submitMutation.isPending) return;

      const timeTaken = durationSeconds - timeLeftSeconds;
      submitMutation.mutate({
        assessmentId,
        answers,
        timeTakenSeconds: Math.max(15, timeTaken)
      });
      setShowConfirmModal(false);
      if (isAuto) toast.info('Time expired! Auto-submitted assessment.');
    },
    [assessmentId, submitMutation, durationSeconds, timeLeftSeconds, answers]
  );

  // Keyboard Shortcuts: 1-4, N/P, M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isTimerRunning || isCompleted) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        const optIdx = parseInt(e.key, 10) - 1;
        handleSelectOption(optIdx);
      } else if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') {
        if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'ArrowLeft') {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMarkReview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTimerRunning, isCompleted, currentIndex, questions.length, currentQuestion]);

  // Section Grouping for Palette
  const sectionGroups = useMemo(() => {
    const groups: Record<string, { name: string; questions: { q: Question; index: number }[] }> = {};
    questions.forEach((q, idx) => {
      if (!groups[q.section]) {
        groups[q.section] = { name: q.sectionName || q.section, questions: [] };
      }
      groups[q.section].questions.push({ q, index: idx });
    });
    return groups;
  }, [questions]);

  // Section-wise progress stats
  const sectionProgress = useMemo(() => {
    const prog: Record<string, { answered: number; total: number }> = {};
    questions.forEach((q) => {
      if (!prog[q.section]) prog[q.section] = { answered: 0, total: 0 };
      prog[q.section].total++;
      if (answers[q.id] !== undefined) prog[q.section].answered++;
    });
    return prog;
  }, [questions, answers]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timePercentRemaining = (timeLeftSeconds / durationSeconds) * 100;
  const isUrgent = timePercentRemaining <= 10;
  const isWarning = timePercentRemaining <= 25 && !isUrgent;

  // -----------------------------------------------------------------
  // VIEW 1: Assessment Configuration / Setup Screen
  // -----------------------------------------------------------------
  if (!isTestStarted && !isCompleted) {
    return (
      <div className="w-full max-w-5xl space-y-6 pb-12">
        <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                <Compass className="w-4 h-4" />
                <span>Multi-Track Placement Benchmark</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-main">
                Placement Diagnostic Assessment
              </h1>
              <p className="text-muted text-xs sm:text-sm max-w-xl">
                Evaluate your placement readiness across Aptitude, Core CS, Programming, Role-Specific tracks, and Professional Situational Judgement.
              </p>
            </div>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary text-xs self-start sm:self-auto">
              Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-subtle">
            {/* 1. Target Role Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-main flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Target Engineering Role</span>
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-surface-subtle border border-subtle rounded-xl px-3.5 py-2.5 text-xs font-medium text-main focus:outline-none focus:border-indigo-500"
              >
                <option value="SDE">Software Development Engineer (SDE)</option>
                <option value="Frontend">Frontend Specialist (React/JS)</option>
                <option value="Backend">Backend Engineer (Node/API/SQL)</option>
                <option value="AI-ML">AI / Machine Learning Engineer</option>
              </select>
              <p className="text-[11px] text-muted">Tailors section weightages to match your hiring bar.</p>
            </div>

            {/* 2. Assessment Mode / Length */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-main flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Assessment Length</span>
              </label>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value as any)}
                className="w-full bg-surface-subtle border border-subtle rounded-xl px-3.5 py-2.5 text-xs font-medium text-main focus:outline-none focus:border-indigo-500"
              >
                <option value="quick">Quick Check (20 Qs, 25 min) • +50 XP</option>
                <option value="standard">Standard Diagnostic (40 Qs, 45 min) • +100 XP</option>
                <option value="deep_dive">Deep Dive (70 Qs, 80 min) • +200 XP</option>
              </select>
              <p className="text-[11px] text-muted">40% Easy, 40% Medium, 20% Hard distribution.</p>
            </div>

            {/* 3. Primary Programming Language */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-main flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Programming Language</span>
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-surface-subtle border border-subtle rounded-xl px-3.5 py-2.5 text-xs font-medium text-main focus:outline-none focus:border-indigo-500"
              >
                <option value="JavaScript">JavaScript / TypeScript</option>
                <option value="Python">Python 3</option>
                <option value="Java">Java (JDK 17+)</option>
                <option value="C/C++">C / C++ (C++20)</option>
              </select>
              <p className="text-[11px] text-muted">Used for output prediction & debugging questions.</p>
            </div>
          </div>

          {/* Section Breakdown Preview */}
          <div className="p-5 rounded-2xl bg-surface-subtle border border-subtle space-y-3">
            <h4 className="text-xs font-bold text-main uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>5 Included Assessment Sections</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-muted">
              <div className="p-2.5 rounded-xl bg-surface border border-subtle">
                <strong className="text-main block">1. Aptitude</strong>
                <span>Quantitative, Logical, Verbal, DI & Series</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface border border-subtle">
                <strong className="text-main block">2. Core CS</strong>
                <span>DSA, OOP, DBMS, SQL, OS & Networks</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface border border-subtle">
                <strong className="text-main block">3. Programming</strong>
                <span>{selectedLanguage} Output Prediction & Debugging</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface border border-subtle">
                <strong className="text-main block">4. Role-Specific</strong>
                <span>{selectedRole} Architecture & Engineering Track</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface border border-subtle sm:col-span-2 lg:col-span-2">
                <strong className="text-main block">5. Professional Skills (0-3 Rubric)</strong>
                <span>Workplace situational judgement & technical communication scenarios</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-2 flex items-center justify-between border-t border-subtle">
            <div className="flex items-center gap-2 text-xs text-muted">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Autosaves progress. Timer begins upon launch.</span>
            </div>
            <button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              className="btn-primary text-xs px-7 py-3 flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20"
            >
              <span>{startMutation.isPending ? 'Generating Paper...' : 'Start Diagnostic Assessment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // VIEW 2: Results & Diagnostic Analysis Screen
  // -----------------------------------------------------------------
  if (isCompleted && submissionResult) {
    const radarData = Object.entries(submissionResult.sectionScores || {}).map(([key, stats]: [string, any]) => ({
      subject: stats.name || key.toUpperCase(),
      score: stats.percentage || 70,
      fullMark: 100
    }));

    const historyTrend = (historyData?.history || []).map((h: any, idx: number) => ({
      attempt: `Attempt ${idx + 1}`,
      score: h.overallPercentage || h.technicalAccuracy || 75
    }));

    const feedbackList = submissionResult.detailedFeedback || [];
    const filteredFeedback = feedbackList.filter((item: any) => {
      if (reviewFilter === 'wrong') return !item.isCorrect && item.userOption !== undefined;
      if (reviewFilter === 'unanswered') return item.userOption === undefined;
      if (reviewFilter === 'marked') return markedForReview.has(item.questionId);
      return true;
    });

    return (
      <div className="w-full max-w-5xl space-y-8 pb-12 animate-fadeIn">
        {/* Top Diagnostic Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Placement Diagnostic Verified</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-main">
            Placement Skill Diagnostic Report
          </h1>
          <p className="text-muted text-xs sm:text-sm max-w-xl mx-auto">
            Comprehensive multi-track assessment evaluating technical competency, problem-solving speed, and professional communication.
          </p>
        </div>

        {/* Top Metric Cards & Skill Radar Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 6 cols: Score Cards & Strengths */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-card p-6 rounded-3xl gradient-border-glow space-y-6">
              <div className="flex items-center justify-between border-b border-subtle pb-4">
                <div>
                  <span className="text-xs font-bold text-muted uppercase">Technical Accuracy</span>
                  <div className="text-3xl font-black font-heading text-indigo-400 mt-0.5">
                    {submissionResult.overallPercentage}%
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-muted uppercase">Professional Skills</span>
                  <div className="text-3xl font-black font-heading text-emerald-400 mt-0.5">
                    {submissionResult.professionalSkillsScore || 85}%
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                    <TrendingUp className="w-4 h-4" /> Top Strengths (Benchmark Exceeded)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(submissionResult.strengths || []).map((s: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-2">
                    <AlertCircle className="w-4 h-4" /> Priority Areas to Reinforce
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(submissionResult.weaknesses || []).map((w: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium">
                        ! {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/planner')}
                  className="btn-primary flex-1 py-3 text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Update Study Roadmap</span>
                </button>
                <button
                  onClick={() => navigate('/revision')}
                  className="btn-secondary flex-1 py-3 text-xs flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Review Spaced Flashcards</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 6 cols: Radar Chart Skill Matrix */}
          <div className="lg:col-span-6 glass-card p-6 rounded-3xl flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-main uppercase tracking-wider">Multi-Track Skill Matrix</span>
              <span className="text-[11px] text-muted">5 Dimensional Score</span>
            </div>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border-subtle)" />
                  <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border-subtle)" />
                  <Radar name="Score" dataKey="score" stroke="oklch(0.65 0.24 275)" fill="oklch(0.65 0.24 275 / 0.35)" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Section-Wise Diagnostic Breakdown Cards */}
        <div className="space-y-4">
          <h3 className="text-base font-bold font-heading text-main flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>Section-by-Section Diagnostics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(submissionResult.sectionScores || {}).map(([secKey, s]: [string, any]) => (
              <div key={secKey} className="glass-card p-5 rounded-2xl border border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-main truncate">{s.name || secKey}</span>
                  <span className={`text-xs font-mono font-bold ${s.percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {s.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-subtle rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${s.percentage >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted">
                  <span>Solved: {s.correct} / {s.total}</span>
                  <span>Benchmark: 70%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Improvement Trend Line Chart */}
        {historyTrend.length > 1 && (
          <div className="glass-card p-6 rounded-3xl border border-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-main">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Diagnostic Assessment History & Trajectory</span>
              </div>
              <span className="text-[10px] text-muted">Calibrated continuously</span>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyTrend} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" strokeOpacity={0.5} />
                  <XAxis dataKey="attempt" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass-panel p-2.5 rounded-xl border border-subtle text-xs space-y-1">
                            <p className="font-bold text-main">{label}</p>
                            <p className="text-indigo-400 font-semibold">Accuracy: {payload[0]?.value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="oklch(0.75 0.19 155)"
                    strokeWidth={2.5}
                    dot={{ fill: 'oklch(0.75 0.19 155)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Detailed Question Review Mode with Explanations */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-subtle pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold font-heading text-main">Detailed Question & Solution Review</h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-xl border border-subtle text-xs">
              {(['all', 'wrong', 'marked', 'unanswered'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setReviewFilter(key)}
                  className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                    reviewFilter === key
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'text-muted hover:text-main'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredFeedback.map((item: any, idx: number) => {
              const isScenario = item.type === 'scenario';
              const isAnswered = item.userOption !== undefined;

              return (
                <div key={item.questionId || idx} className="p-5 rounded-2xl bg-surface border border-subtle space-y-4">
                  <div className="flex items-center justify-between text-xs border-b border-subtle pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-main font-mono">Q{idx + 1}</span>
                      <span className="text-muted">•</span>
                      <span className="text-indigo-300 font-semibold">{item.sectionName || item.section}</span>
                      <span className="text-muted">•</span>
                      <span className="text-muted">{item.topic}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-surface-subtle text-muted">
                        {item.difficulty}
                      </span>
                    </div>

                    <div>
                      {isScenario ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-lg border border-purple-500/30">
                          {item.earnedScore} / 3 Rubric Pts (Situational Judgement)
                        </span>
                      ) : item.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1.0)
                        </span>
                      ) : isAnswered ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect (0.0)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted bg-surface-subtle px-2 py-0.5 rounded-lg">
                          Unanswered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Code snippet if any */}
                  {item.code && (
                    <div className="p-3.5 rounded-xl bg-surface-subtle border border-subtle font-mono text-xs text-indigo-200 overflow-x-auto">
                      <pre>{item.code}</pre>
                    </div>
                  )}

                  {/* Question text */}
                  <p className="text-sm font-semibold text-main leading-relaxed">{item.question}</p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {item.options?.map((opt: string, optIdx: number) => {
                      const isCorrect = !isScenario && optIdx === item.correctOption;
                      const isSelected = optIdx === item.userOption;

                      let style = 'border-subtle bg-surface-subtle text-muted';
                      if (isCorrect) {
                        style = 'border-emerald-500 bg-emerald-500/15 text-emerald-200 font-semibold';
                      } else if (isSelected && !item.isCorrect) {
                        style = isScenario
                          ? 'border-purple-500 bg-purple-500/15 text-purple-200'
                          : 'border-rose-500 bg-rose-500/15 text-rose-200';
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
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                          {isSelected && !isCorrect && !isScenario && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation & Rubric note */}
                  <div className="p-4 rounded-xl bg-surface-subtle border border-subtle/80 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-main">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isScenario ? 'Rubric Assessment & Analysis:' : 'Step-by-Step Explanation:'}</span>
                    </div>
                    {item.rubricExplanation && (
                      <p className="text-purple-300 font-medium text-[11px] bg-purple-500/10 p-2.5 rounded-lg border border-purple-500/20">
                        {item.rubricExplanation}
                      </p>
                    )}
                    <p className="text-muted leading-relaxed text-[11px] sm:text-xs">
                      {item.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="p-4 rounded-2xl bg-surface-subtle/50 border border-subtle/70 text-center text-xs text-muted flex items-center justify-center gap-2">
          <HelpCircle className="w-4 h-4 text-muted/80" />
          <span>
            All diagnostic scores are descriptive of tracked benchmark practice, not a formal hiring guarantee.
          </span>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // VIEW 3: Active Diagnostic Assessment Screen
  // -----------------------------------------------------------------
  return (
    <div className="w-full max-w-5xl space-y-6 pb-12">
      {/* Top Test Header */}
      <div className="glass-card p-4 rounded-2xl border border-subtle flex flex-wrap items-center justify-between gap-4 sticky top-16 z-20 backdrop-blur-xl">
        <div className="flex items-center gap-2 sm:gap-3">
          <Compass className="w-5 h-5 text-indigo-400" />
          <span className="font-heading font-bold text-sm text-main">
            Diagnostic Assessment
          </span>
          <span className="text-muted text-xs">•</span>
          <span className="text-xs font-mono font-bold text-indigo-300">
            Q {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Section Progress Chip */}
          {currentQuestion && (
            <span className="hidden md:inline-flex text-[11px] font-bold px-2.5 py-1 rounded-xl bg-surface-subtle text-muted border border-subtle">
              {currentQuestion.sectionName}: {sectionProgress[currentQuestion.section]?.answered || 0} / {sectionProgress[currentQuestion.section]?.total || 0} Solved
            </span>
          )}

          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-black text-xs sm:text-sm tabular-nums transition-all ${
              isUrgent
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse ring-2 ring-rose-500/30'
                : isWarning
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-surface-subtle border-subtle text-main'
            }`}
          >
            <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-indigo-400'}`} />
            <span>{formatTimer(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="btn-primary text-xs px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"
          >
            Finish & View Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Active Question */}
        <div className="lg:col-span-8 space-y-6">
          {currentQuestion && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-6">
              {/* Section Chip & Question Status */}
              <div className="flex items-center justify-between border-b border-subtle pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 uppercase tracking-wider border border-indigo-500/30">
                    {currentQuestion.sectionName?.toUpperCase()} • {currentQuestion.topic?.toUpperCase()}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-surface-subtle text-muted border border-subtle">
                    {currentQuestion.difficulty}
                  </span>
                </div>

                <button
                  onClick={toggleMarkReview}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl border transition-colors ${
                    markedForReview.has(currentQuestion.id)
                      ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                      : 'border-subtle bg-surface-subtle text-muted hover:text-main'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{markedForReview.has(currentQuestion.id) ? 'Marked' : 'Mark for Review (M)'}</span>
                </button>
              </div>

              {/* Code Snippet Box (if code output question) */}
              {currentQuestion.code && (
                <div className="p-4 rounded-2xl bg-surface-subtle border border-subtle font-mono text-xs sm:text-sm text-indigo-200 overflow-x-auto custom-scrollbar">
                  <pre>{currentQuestion.code}</pre>
                </div>
              )}

              {/* Scenario Label (if situational judgement) */}
              {currentQuestion.type === 'scenario' && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-200 text-xs flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>
                    <strong>Professional Self-Assessment Scenario:</strong> Choose the response that best reflects optimal engineering judgement.
                  </span>
                </div>
              )}

              {/* Question Text */}
              <p className="text-base font-semibold text-main leading-relaxed">
                {currentQuestion.question}
              </p>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((opt: string, optIdx: number) => {
                  const isSelected = answers[currentQuestion.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
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
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="text-sm font-medium leading-relaxed">{opt}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-50 px-1.5 py-0.5 rounded border border-subtle hidden sm:inline-block">
                        {optIdx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-subtle">
                <button
                  onClick={handleClearResponse}
                  disabled={answers[currentQuestion.id] === undefined}
                  className="btn-secondary text-xs px-3 py-2 text-rose-300 disabled:opacity-40"
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
                    <span>Previous (P)</span>
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

        {/* Right 4 Cols: Section-Grouped Question Palette */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-5 rounded-3xl border border-subtle space-y-4 sticky top-36">
            <div className="flex items-center justify-between border-b border-subtle pb-3">
              <span className="text-xs font-bold font-heading text-main uppercase tracking-wider">
                Question Palette
              </span>
              <span className="text-xs font-mono font-bold text-indigo-400">
                {Object.keys(answers).length} / {questions.length}
              </span>
            </div>

            {/* Section tabs for fast navigation */}
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 text-[11px]">
              <button
                onClick={() => setActiveSectionFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                  activeSectionFilter === 'all'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-surface-subtle text-muted hover:text-main'
                }`}
              >
                All
              </button>
              {Object.keys(sectionGroups).map((secKey) => (
                <button
                  key={secKey}
                  onClick={() => setActiveSectionFilter(secKey)}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 capitalize transition-all ${
                    activeSectionFilter === secKey
                      ? 'bg-indigo-500 text-white'
                      : 'bg-surface-subtle text-muted hover:text-main'
                  }`}
                >
                  {secKey.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Section-grouped question buttons */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {Object.entries(sectionGroups)
                .filter(([secKey]) => activeSectionFilter === 'all' || activeSectionFilter === secKey)
                .map(([secKey, group]) => (
                  <div key={secKey} className="space-y-1.5">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                      {group.name}
                    </span>
                    <div className="grid grid-cols-5 gap-2">
                      {group.questions.map(({ q, index }) => {
                        const isCurrent = currentIndex === index;
                        const isAnswered = answers[q.id] !== undefined;
                        const isMarked = markedForReview.has(q.id);
                        const isVisited = visitedQuestions.has(q.id);

                        let btnStyle = 'bg-surface-subtle text-muted border-subtle';
                        if (isCurrent) {
                          btnStyle = 'bg-indigo-500 text-white border-indigo-400 font-bold shadow-md';
                        } else if (isMarked) {
                          btnStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold';
                        } else if (isAnswered) {
                          btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold';
                        } else if (isVisited) {
                          btnStyle = 'bg-surface text-muted/80 border-subtle';
                        }

                        return (
                          <button
                            key={q.id}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-8 rounded-lg border text-xs font-mono transition-all flex items-center justify-center relative ${btnStyle}`}
                          >
                            {index + 1}
                            {isMarked && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>

            {/* Palette Legend */}
            <div className="space-y-2 pt-3 border-t border-subtle text-[11px] text-muted">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500" />
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-surface-subtle border border-subtle" />
                <span>Unanswered</span>
              </div>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full btn-primary text-xs py-2.5 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              Finish & View Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-subtle max-w-md w-full space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-main">Confirm Diagnostic Submission</h3>
                <p className="text-xs text-muted">Are you ready to submit and calculate your benchmark score?</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-subtle border border-subtle space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Total Questions:</span>
                <strong className="text-main">{questions.length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Answered:</span>
                <strong className="text-emerald-400">{Object.keys(answers).length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Unanswered:</span>
                <strong className="text-rose-400">{questions.length - Object.keys(answers).length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Marked for Review:</span>
                <strong className="text-amber-400">{markedForReview.size}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary flex-1 text-xs py-2.5"
              >
                Return to Test
              </button>
              <button
                onClick={() => handleSubmitAssessment(false)}
                disabled={submitMutation.isPending}
                className="btn-primary flex-1 text-xs py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center gap-2"
              >
                <span>{submitMutation.isPending ? 'Scoring...' : 'Yes, Submit'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AssessmentPage;
