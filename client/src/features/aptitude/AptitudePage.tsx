import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BrainCircuit,
  Clock,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  BookOpen,
  PieChart as PieIcon,
  Layers,
  Award,
  TrendingUp,
  Compass,
  Gauge,
  Flame
} from 'lucide-react';
import { aptitudeApi } from '../../lib/api/client';
import { PracticeSession } from './PracticeSession';
import { TimedExamSession } from './TimedExamSession';
import { ShimmerCard } from '../../components/ui/LoadingSkeleton';

// Topic metadata icons and descriptions
const TOPIC_METADATA: Record<string, { icon: any; color: string; desc: string }> = {
  'Quantitative Aptitude': {
    icon: Target,
    color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
    desc: 'Percentages, Ratio, Work & Time, Simple & Compound Interest'
  },
  'Logical Reasoning': {
    icon: Compass,
    color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
    desc: 'Blood Relations, Seating Arrangement, Direction Sense, Coding-Decoding'
  },
  'Verbal Ability': {
    icon: BookOpen,
    color: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    desc: 'Reading Comprehension, Para Jumbles, Error Spotting, Synonyms & Antonyms'
  },
  'Data Interpretation': {
    icon: PieIcon,
    color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    desc: 'Bar Charts, Pie Charts, Tables & Multi-tier Analytical Dashboards'
  },
  'Probability & Permutations': {
    icon: Sparkles,
    color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    desc: 'Permutations, Combinations, Dice, Card Decks & Conditional Probability'
  },
  'Speed & Distance': {
    icon: Zap,
    color: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
    desc: 'Relative Speed, Trains Crossing, Boats & Streams, Races & Circular Tracks'
  },
  'Profit & Loss': {
    icon: TrendingUp,
    color: 'text-teal-400 bg-teal-500/15 border-teal-500/30',
    desc: 'Marked Price, Successive Discounts, Dishonest Dealer & Margin Margins'
  },
  'Syllogisms': {
    icon: Layers,
    color: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    desc: 'Venn Diagram Deductions, Either-Or, Possibility Cases & 3-Statement Logic'
  },
  'Number Series': {
    icon: Gauge,
    color: 'text-violet-400 bg-violet-500/15 border-violet-500/30',
    desc: 'Prime Increments, Triangular Steps, Fibonacci & Alternating Patterns'
  }
};

export const AptitudePage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'practice' | 'exam'>('practice');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('mini');
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);

  // Fetch live topics with data-backed counts
  const { data: topicsData, isLoading: isLoadingTopics, isError: isTopicsError, refetch: refetchTopics } = useQuery({
    queryKey: ['aptitudeTopics'],
    queryFn: aptitudeApi.getTopics
  });

  const topics = topicsData?.topics || [];
  const totalQuestions = topics.reduce((sum: number, t: any) => sum + (t.count || 0), 0);

  // Start a practice session
  const handleStartPractice = (topicName = '') => {
    setSelectedTopic(topicName);
    setActiveMode('practice');
    setIsSessionActive(true);
  };

  // Start an exam session with preset
  const handleStartExam = (presetName: string, topicName = '') => {
    set开展Preset(presetName);
    setSelectedTopic(topicName);
    setActiveMode('exam');
    setIsSessionActive(true);
  };

  function set开展Preset(p: string) {
    setSelectedPreset(p);
  }

  // -------------------------------------------------------------
  // ACTIVE SESSION: Practice or Timed Exam
  // -------------------------------------------------------------
  if (isSessionActive) {
    if (activeMode === 'practice') {
      return (
        <div className="w-full max-w-5xl pb-12">
          <PracticeSession
            initialTopic={selectedTopic || ''}
            onExit={() => {
              setIsSessionActive(false);
              setSelectedTopic(null);
            }}
          />
        </div>
      );
    }

    return (
      <div className="w-full max-w-5xl pb-12">
        <TimedExamSession
          initialPreset={selectedPreset}
          initialTopic={selectedTopic || ''}
          onExit={() => {
            setIsSessionActive(false);
            setSelectedTopic(null);
          }}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN VIEW: Aptitude Hub Overview & Topic Selector
  // -------------------------------------------------------------
  return (
    <div className="w-full max-w-5xl space-y-8 pb-12 pt-2 sm:pt-4">
      {/* Top Banner */}
      <div className="glass-card p-6 sm:p-8 pt-8 sm:pt-10 rounded-3xl gradient-border-glow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <BrainCircuit className="w-4 h-4 shrink-0" />
              <span>Campus Placement Aptitude Master</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-main leading-tight tracking-tight">
              Campus Aptitude Preparation
            </h1>
            <p className="text-muted text-xs sm:text-sm max-w-2xl leading-relaxed">
              {totalQuestions > 0 ? totalQuestions : '360'}+ rigorously validated campus placement questions across 9 domains with step-by-step solutions, shortcuts, and separate practice & exam pools.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-2xl border border-subtle shrink-0">
            <button
              onClick={() => setActiveMode('practice')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'practice'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-muted hover:text-main'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Practice Mode</span>
            </button>
            <button
              onClick={() => setActiveMode('exam')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'exam'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-muted hover:text-main'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timed Exam</span>
            </button>
          </div>
        </div>

        {/* Mode Feature Spotlight Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 items-stretch">
          {activeMode === 'practice' ? (
            <>
              <div className="w-full p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3 text-xs">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="font-bold text-indigo-200 block text-xs">Instant Solutions & Hints</span>
                  <span className="text-muted text-[11px] leading-relaxed block">2-step progressive hints, formulas, and adaptive difficulty.</span>
                </div>
              </div>
              <div className="w-full p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-3 text-xs">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                  <Flame className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="font-bold text-cyan-200 block text-xs">Concept-Building Pool</span>
                  <span className="text-muted text-[11px] leading-relaxed block">Spaced repetition sync and retry wrong questions at the end.</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-full p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3 text-xs">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="font-bold text-purple-200 block text-xs">Strict Exam Simulator</span>
                  <span className="text-muted text-[11px] leading-relaxed block">Countdown timer, -0.25 negative marking, and tab switch tracker.</span>
                </div>
              </div>
              <div className="w-full p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="font-bold text-emerald-200 block text-xs">Diagnostic Score Report</span>
                  <span className="text-muted text-[11px] leading-relaxed block">Section-wise accuracy breakdown, slowest questions, and XP rewards.</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* TIMED EXAM PRESETS (Shown when Timed Exam mode is selected) */}
      {activeMode === 'exam' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-main">Timed Exam Presets</h2>
            <span className="text-xs text-muted">Select an exam format to begin</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Mini Mock */}
            <div
              onClick={() => handleStartExam('mini')}
              className="glass-card p-5 rounded-2xl cursor-pointer border border-subtle hover:border-indigo-500 transition-all space-y-3 group"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  Sprint Drill
                </span>
                <span className="text-muted font-mono font-bold">+20 XP</span>
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-main group-hover:text-indigo-300">
                  Mini Test
                </h3>
                <p className="text-muted text-xs mt-0.5">10 Questions • 15 Minutes • Mixed Topics</p>
              </div>
              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-indigo-400">
                <span>Start Mini Test</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. Sectional Drill */}
            <div
              onClick={() => handleStartExam('sectional')}
              className="glass-card p-5 rounded-2xl cursor-pointer border border-subtle hover:border-cyan-500 transition-all space-y-3 group"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  Section Focus
                </span>
                <span className="text-muted font-mono font-bold">+50 XP</span>
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-main group-hover:text-cyan-300">
                  Sectional Test
                </h3>
                <p className="text-muted text-xs mt-0.5">20 Questions • 30 Minutes • Pick 1 Topic</p>
              </div>
              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>Start Sectional</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. Full Aptitude Mock */}
            <div
              onClick={() => handleStartExam('full_mock')}
              className="glass-card p-5 rounded-2xl cursor-pointer border border-subtle hover:border-emerald-500 transition-all space-y-3 group"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Campus Mock
                </span>
                <span className="text-muted font-mono font-bold">+120 XP</span>
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-main group-hover:text-emerald-300">
                  Full Aptitude Mock
                </h3>
                <p className="text-muted text-xs mt-0.5">45 Questions • 60 Minutes • All 9 Domains</p>
              </div>
              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Launch Full Mock</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOPIC CARDS GRID (9 Domains) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold font-heading text-main">
              {activeMode === 'practice' ? 'Select Domain to Practice' : 'Sectional Topic Selection'}
            </h2>
            <p className="text-xs text-muted">
              Choose a specific topic to begin an isolated {activeMode === 'practice' ? 'practice drill' : 'timed test'}.
            </p>
          </div>

          {/* Mixed Drill Card CTA */}
          <button
            onClick={() => {
              if (activeMode === 'practice') handleStartPractice('');
              else handleStartExam('mini', '');
            }}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 transition-all"
          >
            <span>All 9 Topics Combined</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoadingTopics ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <ShimmerCard key={i} className="h-44" />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface-subtle border border-subtle space-y-3">
            <p className="text-sm text-muted">Unable to load placement topics right now.</p>
            <button
              onClick={() => refetchTopics()}
              className="btn-secondary text-xs px-4 py-2"
            >
              Retry Loading Topics
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((t: any) => {
              const meta = TOPIC_METADATA[t.topic] || {
                icon: Target,
                color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
                desc: 'Placement aptitude preparation'
              };
              const IconComp = meta.icon;

              return (
                <div
                  key={t.topic}
                  onClick={() => {
                    if (activeMode === 'practice') handleStartPractice(t.topic);
                    else handleStartExam('sectional', t.topic);
                  }}
                  className="glass-card p-5 rounded-2xl cursor-pointer hover:border-highlight transition-all space-y-3 group relative overflow-hidden"
                >
                  {/* Card Header: Icon + Difficulty Count Badges */}
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${meta.color}`}>
                      <IconComp className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-surface-subtle text-muted border border-subtle tabular-nums">
                        {t.easy ?? 15}E • {t.medium ?? 15}M • {t.hard ?? 10}H
                      </span>
                    </div>
                  </div>

                  {/* Topic Title & Subtitle */}
                  <div>
                    <h3 className="text-base font-bold font-heading text-main group-hover:text-indigo-300 transition-colors">
                      {t.topic}
                    </h3>
                    <p className="text-muted text-[11px] leading-relaxed line-clamp-2 mt-1">
                      {meta.desc}
                    </p>
                  </div>

                  {/* Footer Stats & CTA */}
                  <div className="pt-2 border-t border-subtle flex items-center justify-between text-xs">
                    <span className="text-muted font-medium text-[11px]">
                      {t.count} Total Questions
                    </span>
                    <span className="font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px]">
                      <span>{activeMode === 'practice' ? 'Practice' : 'Timed Test'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Community Pattern Notice Footer */}
      <div className="p-4 rounded-2xl bg-surface-subtle/50 border border-subtle/70 text-center text-xs text-muted flex items-center justify-center gap-2">
        <HelpCircle className="w-4 h-4 text-muted/80" />
        <span>
          Questions are synthetically generated and modeled on community-reported placement patterns • Last verified: September 2026.
        </span>
      </div>
    </div>
  );
};
export default AptitudePage;
