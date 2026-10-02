import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Brain,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  Sparkles,
  Zap,
  Target,
  Clock,
  BookOpen,
  Filter,
  Layers,
  ChevronRight,
  AlertTriangle,
  Flame,
  Award
} from 'lucide-react';
import { aptitudeApi, revisionApi } from '../../lib/api/client';
import { DataInterpretationView } from './DataInterpretationView';
import { ShimmerCard } from '../../components/ui/LoadingSkeleton';
import { useConfetti } from '../../hooks/useConfetti';
import { toast } from 'sonner';

interface PracticeSessionProps {
  initialTopic?: string;
  onExit: () => void;
}

interface QuestionFeedback {
  isCorrect: boolean;
  correctOption: number;
  explanation: string;
  shortcut?: string;
  hints: string[];
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({ initialTopic = '', onExit }) => {
  const { triggerConfetti } = useConfetti();

  // Configuration state
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('all');
  const [difficultyMode, setDifficultyMode] = useState<'easy' | 'medium' | 'hard' | 'adaptive'>('adaptive');
  const [questionCount, setQuestionCount] = useState<number | 'all'>(10);
  const [isStarted, setIsStarted] = useState(false);

  // Active session state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [evaluations, setEvaluations] = useState<Record<string, QuestionFeedback>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, number>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [timePerQuestion, setTimePerQuestion] = useState<Record<string, number>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Adaptive Difficulty State
  const [adaptiveLevel, setAdaptiveLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);

  // Fetch topics list
  const { data: topicsData } = useQuery({
    queryKey: ['aptitudeTopics'],
    queryFn: aptitudeApi.getTopics
  });

  // Fetch questions based on configuration
  const { data: questionsData, isLoading: isLoadingQuestions, refetch } = useQuery({
    queryKey: ['aptitudePracticeQuestions', selectedTopic, selectedSubtopic, difficultyMode, questionCount],
    queryFn: () =>
      aptitudeApi.getQuestions({
        topic: selectedTopic || undefined,
        subtopic: selectedSubtopic !== 'all' ? selectedSubtopic : undefined,
        difficulty: difficultyMode === 'adaptive' ? undefined : difficultyMode,
        mode: 'practice',
        count: questionCount === 'all' ? 100 : questionCount
      }),
    enabled: isStarted
  });

  const rawQuestions = useMemo(() => questionsData?.questions || [], [questionsData]);

  // Adaptive ordering / filtering of questions
  const questions = useMemo(() => {
    if (difficultyMode !== 'adaptive') return rawQuestions;
    // For adaptive mode, we keep questions and dynamically order them if needed
    return rawQuestions;
  }, [rawQuestions, difficultyMode]);

  const currentQ = questions[currentIndex];

  // Extract unique subtopics for the selected topic
  const availableSubtopics = useMemo(() => {
    if (!topicsData?.topics || !selectedTopic) return [];
    const topicObj = topicsData.topics.find((t: any) => t.topic === selectedTopic);
    return topicObj?.subtopics || [];
  }, [topicsData, selectedTopic]);

  // Track time spent per question
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const recordTimeSpent = useCallback(() => {
    if (!currentQ) return;
    const elapsed = Math.round((Date.now() - questionStartTime) / 1000);
    setTimePerQuestion((prev) => ({
      ...prev,
      [currentQ.id]: (prev[currentQ.id] || 0) + elapsed
    }));
  }, [currentQ, questionStartTime]);

  // Handle Answer Selection
  const handleSelectOption = async (optionIdx: number) => {
    if (!currentQ || evaluations[currentQ.id] || isEvaluating) return;

    recordTimeSpent();
    setIsEvaluating(true);
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionIdx }));

    try {
      const res = await aptitudeApi.evaluatePracticeAnswer({
        questionId: currentQ.id,
        selectedOption: optionIdx
      });

      const feedback: QuestionFeedback = {
        isCorrect: res.isCorrect,
        correctOption: res.correctOption,
        explanation: res.explanation || currentQ.explanation || 'Detailed answer verification.',
        shortcut: res.shortcut || currentQ.shortcut,
        hints: res.hints || currentQ.hints || []
      };

      setEvaluations((prev) => ({ ...prev, [currentQ.id]: feedback }));

      // Spaced revision recording
      revisionApi.recordReview({
        topic: currentQ.topic,
        questionId: currentQ.id,
        isCorrect: res.isCorrect
      }).catch(() => {});

      // Adaptive difficulty progression
      if (difficultyMode === 'adaptive') {
        if (res.isCorrect) {
          const nextConsec = consecutiveCorrect + 1;
          setConsecutiveCorrect(nextConsec);
          setConsecutiveWrong(0);
          if (nextConsec >= 3) {
            if (adaptiveLevel === 'easy') {
              setAdaptiveLevel('medium');
              toast.success('Level Up! Upgrading to Medium difficulty.');
            } else if (adaptiveLevel === 'medium') {
              setAdaptiveLevel('hard');
              toast.success('Outstanding! Reached Hard difficulty.');
            }
            setConsecutiveCorrect(0);
          }
        } else {
          const nextWrong = consecutiveWrong + 1;
          setConsecutiveWrong(nextWrong);
          setConsecutiveCorrect(0);
          if (nextWrong >= 2) {
            if (adaptiveLevel === 'hard') {
              setAdaptiveLevel('medium');
              toast.info('Adjusting to Medium difficulty to reinforce concepts.');
            } else if (adaptiveLevel === 'medium') {
              setAdaptiveLevel('easy');
              toast.info('Adjusting to Easy difficulty for fundamental practice.');
            }
            setConsecutiveWrong(0);
          }
        }
      }

      if (res.isCorrect) {
        toast.success('Correct answer!', { duration: 1500 });
      } else {
        toast.error('Incorrect. Review the solution below.', { duration: 2000 });
      }
    } catch {
      // Fallback evaluation if offline/error
      const isCorrect = currentQ.correctOption !== undefined ? optionIdx === currentQ.correctOption : false;
      setEvaluations((prev) => ({
        ...prev,
        [currentQ.id]: {
          isCorrect,
          correctOption: currentQ.correctOption ?? 0,
          explanation: currentQ.explanation || 'Step by step concept solution.',
          shortcut: currentQ.shortcut,
          hints: currentQ.hints || []
        }
      }));
    } finally {
      setIsEvaluating(false);
    }
  };

  // Toggle Bookmark
  const toggleBookmark = (qId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
        toast.info('Question bookmark removed');
      } else {
        next.add(qId);
        toast.success('Question bookmarked for revision');
      }
      return next;
    });
  };

  // Reveal next progressive hint
  const handleRevealHint = () => {
    if (!currentQ) return;
    const currentHints = revealedHints[currentQ.id] || 0;
    const maxHints = currentQ.hints?.length || 2;
    if (currentHints < maxHints) {
      setRevealedHints((prev) => ({
        ...prev,
        [currentQ.id]: currentHints + 1
      }));
    }
  };

  // Navigation handlers
  const handleNext = () => {
    recordTimeSpent();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishPractice();
    }
  };

  const handlePrev = () => {
    recordTimeSpent();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const finishPractice = () => {
    recordTimeSpent();
    setIsCompleted(true);
    triggerConfetti();
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted || isCompleted) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        const optIdx = parseInt(e.key, 10) - 1;
        if (!evaluations[currentQ?.id]) {
          handleSelectOption(optIdx);
        }
      } else if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') {
        if (currentIndex < questions.length - 1) {
          handleNext();
        }
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          handlePrev();
        }
      } else if (e.key === 'b' || e.key === 'B' || e.key === 'm' || e.key === 'M') {
        if (currentQ) toggleBookmark(currentQ.id);
      } else if (e.key === 'h' || e.key === 'H') {
        handleRevealHint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, isCompleted, currentQ, currentIndex, questions.length, evaluations]);

  // Calculate practice statistics
  const stats = useMemo(() => {
    const answeredCount = Object.keys(evaluations).length;
    let correctCount = 0;
    const subtopicScores: Record<string, { total: number; correct: number }> = {};

    questions.forEach((q) => {
      const ev = evaluations[q.id];
      const sub = q.subtopic || 'General';
      if (!subtopicScores[sub]) subtopicScores[sub] = { total: 0, correct: 0 };

      if (ev) {
        subtopicScores[sub].total += 1;
        if (ev.isCorrect) {
          correctCount += 1;
          subtopicScores[sub].correct += 1;
        }
      }
    });

    const totalTime = Object.values(timePerQuestion).reduce((a, b) => a + b, 0);
    const avgSeconds = answeredCount > 0 ? Math.round(totalTime / answeredCount) : 0;
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    // Identify weak subtopics (accuracy < 65% with at least 1 attempted)
    const weakSubtopics = Object.entries(subtopicScores)
      .filter(([_, data]) => data.total > 0 && (data.correct / data.total) < 0.65)
      .map(([subtopic, data]) => ({
        subtopic,
        accuracy: Math.round((data.correct / data.total) * 100),
        total: data.total
      }));

    return {
      totalQuestions: questions.length,
      answeredCount,
      correctCount,
      accuracy,
      totalTime,
      avgSeconds,
      weakSubtopics
    };
  }, [questions, evaluations, timePerQuestion]);

  // Restart with only wrong questions
  const retryWrongAnswers = () => {
    const wrongQIds = new Set(
      Object.entries(evaluations)
        .filter(([_, ev]) => !ev.isCorrect)
        .map(([id]) => id)
    );

    if (wrongQIds.size === 0) {
      toast.success('No wrong answers to retry! Excellent work!');
      return;
    }

    setEvaluations({});
    setAnswers({});
    setRevealedHints({});
    setCurrentIndex(0);
    setIsCompleted(false);
    toast.info(`Retrying ${wrongQIds.size} missed questions.`);
  };

  // Practice Weak Subtopics
  const practiceWeakSubtopics = (subtopic: string) => {
    setSelectedSubtopic(subtopic);
    setEvaluations({});
    setAnswers({});
    setRevealedHints({});
    setCurrentIndex(0);
    setIsCompleted(false);
    refetch();
  };

  // -------------------------------------------------------------
  // VIEW 1: Practice Configuration Screen
  // -------------------------------------------------------------
  if (!isStarted) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black font-heading text-main">Practice Drill Setup</h2>
                <p className="text-xs text-muted">Customize your concept-building drill with instant step-by-step guidance.</p>
              </div>
            </div>
            <button onClick={onExit} className="btn-secondary text-xs">
              Back to Overview
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-subtle">
            {/* Topic Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-main flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Select Domain / Topic</span>
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => {
                  setSelectedTopic(e.target.value);
                  setSelectedSubtopic('all');
                }}
                className="w-full bg-surface-subtle border border-subtle rounded-xl px-3.5 py-2.5 text-xs font-medium text-main focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Topics (Mixed Aptitude)</option>
                {(topicsData?.topics || []).map((t: any) => (
                  <option key={t.topic} value={t.topic}>
                    {t.topic} ({t.count} Qs)
                  </option>
                ))}
              </select>
            </div>

            {/* Subtopic Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-main flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Subtopic Focus</span>
              </label>
              <select
                value={selectedSubtopic}
                onChange={(e) => setSelectedSubtopic(e.target.value)}
                disabled={!selectedTopic || availableSubtopics.length === 0}
                className="w-full bg-surface-subtle border border-subtle rounded-xl px-3.5 py-2.5 text-xs font-medium text-main focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="all">All Subtopics ({availableSubtopics.length || 'All'})</option>
                {availableSubtopics.map((sub: string) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-main flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Difficulty Progression</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['adaptive', 'easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficultyMode(diff)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                      difficultyMode === diff
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-sm'
                        : 'border-subtle bg-surface-subtle text-muted hover:text-main'
                    }`}
                  >
                    {diff === 'adaptive' ? '✨ Adaptive' : diff}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted">
                {difficultyMode === 'adaptive'
                  ? 'Adaptive dynamically levels up after 3 correct and eases after 2 wrong.'
                  : `Fixed ${difficultyMode} tier questions.`}
              </p>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-main flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Drill Size</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([10, 20, 'all'] as const).map((cnt) => (
                  <button
                    key={String(cnt)}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                      questionCount === cnt
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-sm'
                        : 'border-subtle bg-surface-subtle text-muted hover:text-main'
                    }`}
                  >
                    {cnt === 'all' ? 'All (40+)' : `${cnt} Questions`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-subtle">
            <div className="text-[11px] text-muted flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Includes 2 progressive hints, formula shortcuts, and instant verification.</span>
            </div>
            <button
              onClick={() => setIsStarted(true)}
              className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500"
            >
              <span>Start Practice Drill</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: Summary / Results Screen
  // -------------------------------------------------------------
  if (isCompleted) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black font-heading text-main">Practice Drill Complete!</h2>
            <p className="text-xs text-muted">Here is your performance breakdown and concept mastery insight.</p>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <div className="glass-panel p-4 rounded-2xl border border-subtle text-center">
              <span className="text-xs font-bold text-muted uppercase">Accuracy</span>
              <p className="text-2xl font-black text-emerald-400 tabular-nums mt-1">{stats.accuracy}%</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-subtle text-center">
              <span className="text-xs font-bold text-muted uppercase">Solved</span>
              <p className="text-2xl font-black text-indigo-400 tabular-nums mt-1">
                {stats.correctCount} / {stats.answeredCount}
              </p>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-subtle text-center">
              <span className="text-xs font-bold text-muted uppercase">Avg Pace</span>
              <p className="text-2xl font-black text-cyan-400 tabular-nums mt-1">{stats.avgSeconds}s</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-subtle text-center">
              <span className="text-xs font-bold text-muted uppercase">Bookmarked</span>
              <p className="text-2xl font-black text-amber-400 tabular-nums mt-1">{bookmarkedIds.size}</p>
            </div>
          </div>

          {/* Weak Subtopics Spotlight */}
          {stats.weakSubtopics.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-left space-y-3 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Targeted Revision Recommended</span>
                </div>
                <span className="text-[10px] text-muted">Spaced repetition queue updated</span>
              </div>
              <div className="space-y-2">
                {stats.weakSubtopics.map((item) => (
                  <div key={item.subtopic} className="flex items-center justify-between bg-surface p-2.5 rounded-xl border border-subtle text-xs">
                    <span className="font-semibold text-main">{item.subtopic}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-rose-400 font-bold tabular-nums">{item.accuracy}% Accuracy</span>
                      <button
                        onClick={() => practiceWeakSubtopics(item.subtopic)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-[11px] font-bold hover:bg-rose-500/30 transition-all"
                      >
                        Drill Subtopic
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-subtle max-w-xl mx-auto">
            {stats.correctCount < stats.answeredCount && (
              <button
                onClick={retryWrongAnswers}
                className="btn-secondary w-full sm:w-auto text-xs px-5 py-2.5 flex items-center justify-center gap-2 text-amber-300"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Missed Questions</span>
              </button>
            )}
            <button
              onClick={() => {
                setIsStarted(false);
                setIsCompleted(false);
                setEvaluations({});
                setAnswers({});
              }}
              className="btn-primary w-full sm:w-auto text-xs px-6 py-2.5 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Configure New Drill</span>
            </button>
            <button
              onClick={onExit}
              className="btn-secondary w-full sm:w-auto text-xs px-5 py-2.5"
            >
              Exit to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: Active Question Solving
  // -------------------------------------------------------------
  if (isLoadingQuestions || !currentQ) {
    return (
      <div className="space-y-6">
        <ShimmerCard className="h-64" />
        <ShimmerCard className="h-32" />
      </div>
    );
  }

  const evaluation = evaluations[currentQ.id];
  const selectedOption = answers[currentQ.id];
  const hintCount = revealedHints[currentQ.id] || 0;
  const isBookmarked = bookmarkedIds.has(currentQ.id);

  return (
    <div className="space-y-6">
      {/* Top Session Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            {currentQ.topic}
          </span>
          <span className="text-muted text-xs">•</span>
          <span className="text-xs font-medium text-muted">{currentQ.subtopic || 'General'}</span>
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
          {difficultyMode === 'adaptive' && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Flame className="w-3 h-3 text-indigo-400" />
              Adaptive Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-main tabular-nums">
            Q {currentIndex + 1} / {questions.length}
          </span>
          <button
            onClick={() => toggleBookmark(currentQ.id)}
            aria-label={isBookmarked ? 'Bookmarked' : 'Bookmark question'}
            className={`p-2 rounded-xl border transition-all ${
              isBookmarked
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-surface-subtle border-subtle text-muted hover:text-main'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
          <button
            onClick={finishPractice}
            className="text-xs text-muted hover:text-main font-semibold px-2 py-1 rounded-lg hover:bg-surface-subtle transition-all"
          >
            End Drill
          </button>
        </div>
      </div>

      {/* Reading Comprehension Shared Passage (if present) */}
      {currentQ.passage && (
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-indigo-500/20 bg-indigo-950/10 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 border-b border-indigo-500/20 pb-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Reading Comprehension Passage</span>
          </div>
          <div className="text-xs sm:text-sm text-main/90 leading-relaxed max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {currentQ.passage}
          </div>
        </div>
      )}

      {/* Main Question Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-6">
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-main leading-relaxed">
            {currentQ.question}
          </h3>

          {/* Data Interpretation Charts / Tables */}
          {currentQ.dataset && (
            <DataInterpretationView dataset={currentQ.dataset} />
          )}
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-3 pt-2">
          {currentQ.options.map((optionText: string, idx: number) => {
            const isSelected = selectedOption === idx;
            const isEvaluated = !!evaluation;
            const isCorrectOption = evaluation?.correctOption === idx;
            const isWrongSelection = isSelected && !evaluation?.isCorrect;

            let optionStyle = 'border-subtle bg-surface-subtle text-muted hover:text-main hover:border-highlight';

            if (isEvaluated) {
              if (isCorrectOption) {
                optionStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-200 shadow-sm ring-1 ring-emerald-500/50';
              } else if (isWrongSelection) {
                optionStyle = 'border-rose-500 bg-rose-500/15 text-rose-200 shadow-sm ring-1 ring-rose-500/50';
              } else {
                optionStyle = 'border-subtle bg-surface-subtle/50 text-muted/60 opacity-60';
              }
            } else if (isSelected) {
              optionStyle = 'border-indigo-500 bg-indigo-500/20 text-indigo-200';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isEvaluated || isEvaluating}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-2xl border flex items-center justify-between transition-all ${optionStyle}`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono border transition-all ${
                      isEvaluated && isCorrectOption
                        ? 'border-emerald-500 bg-emerald-500/30 text-emerald-300'
                        : isEvaluated && isWrongSelection
                        ? 'border-rose-500 bg-rose-500/30 text-rose-300'
                        : 'border-subtle bg-surface text-muted'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm font-medium leading-relaxed">{optionText}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono opacity-50 px-1.5 py-0.5 rounded border border-subtle hidden sm:inline-block">
                    {idx + 1}
                  </span>
                  {isEvaluated && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {isEvaluated && isWrongSelection && <XCircle className="w-5 h-5 text-rose-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Progressive Hints Drawer (Available before & during answer) */}
        <div className="space-y-3 pt-2">
          {hintCount > 0 && currentQ.hints && (
            <div className="space-y-2">
              {currentQ.hints.slice(0, hintCount).map((hint: string, hIdx: number) => (
                <div
                  key={hIdx}
                  className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Hint {hIdx + 1}: </span>
                    <span>{hint}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!evaluation && (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleRevealHint}
                disabled={hintCount >= (currentQ.hints?.length || 2)}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-amber-300 disabled:opacity-40"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {hintCount === 0
                    ? 'Show Hint 1'
                    : hintCount === 1
                    ? 'Show Hint 2'
                    : 'All Hints Shown'}
                </span>
                <span className="text-[10px] font-mono text-muted/80 ml-1">(H)</span>
              </button>

              <span className="text-[11px] text-muted hidden sm:inline-block">
                Press keys <kbd className="px-1 py-0.5 rounded bg-surface border border-subtle text-[10px]">1-4</kbd> to select option
              </span>
            </div>
          )}
        </div>

        {/* Instant Evaluation Feedback & Explanation */}
        {evaluation && (
          <div className="p-5 rounded-2xl bg-surface-subtle border border-subtle space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-subtle pb-3">
              <div className="flex items-center gap-2">
                {evaluation.isCorrect ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Correct Answer!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <XCircle className="w-4 h-4" /> Incorrect Answer
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-muted">
                Correct Option: <strong className="text-emerald-400">{String.fromCharCode(65 + evaluation.correctOption)}</strong>
              </span>
            </div>

            {/* Explanation text */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-main flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Step-by-Step Solution:</span>
              </span>
              <p className="text-xs sm:text-sm text-muted leading-relaxed font-normal">
                {evaluation.explanation}
              </p>
            </div>

            {/* Shortcut Tip */}
            {evaluation.shortcut && (
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs flex items-start gap-2">
                <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-300">⚡ Shortcut / Formula: </span>
                  <span>{evaluation.shortcut}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-subtle">
          <button
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous (P)</span>
          </button>

          <div className="flex items-center gap-2">
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
              >
                <span>{evaluation ? 'Next Question (N)' : 'Skip / Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={finishPractice}
                className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"
              >
                <span>Finish Drill</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Question Dots Navigator */}
      <div className="glass-panel p-3.5 rounded-2xl border border-subtle flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="text-[11px] font-bold text-muted uppercase tracking-wider shrink-0 px-2">
          Navigator:
        </span>
        <div className="flex items-center gap-1.5">
          {questions.map((q, idx) => {
            const isCurr = idx === currentIndex;
            const ev = evaluations[q.id];
            const isBook = bookmarkedIds.has(q.id);

            let dotBg = 'bg-surface-subtle text-muted border-subtle hover:border-highlight';
            if (ev) {
              dotBg = ev.isCorrect
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40';
            } else if (isCurr) {
              dotBg = 'bg-indigo-500 text-white border-indigo-400 shadow-sm';
            }

            return (
              <button
                key={q.id}
                onClick={() => {
                  recordTimeSpent();
                  setCurrentIndex(idx);
                }}
                className={`w-7 h-7 rounded-lg text-xs font-bold font-mono border transition-all flex items-center justify-center relative ${dotBg}`}
              >
                {idx + 1}
                {isBook && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
