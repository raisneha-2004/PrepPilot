import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { ChooseYourPaceSection } from './ChooseYourPaceSection';
import { HeroPreviewCard } from './HeroPreviewCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Code2,
  Bot,
  BrainCircuit,
  Mic2,
  Trophy,
  CheckCircle2,
  Compass,
  Calendar,
  Building2,
  Zap,
  LayoutDashboard,
  CheckSquare,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  FileText,
  Terminal,
  Layers,
  Check
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState<string | null>('01');
  const [activeFeature, setActiveFeature] = useState<string | null>('coach');

  const steps = [
    {
      num: '01',
      title: 'Choose Your Target Role',
      shortLine: "Pick the role and timeline you're aiming for.",
      detail: 'Select SDE, Frontend, Backend or AI/ML, set your placement date, and PrepPilot tunes everything to that hiring bar.',
      icon: Compass,
      link: '/onboarding',
      linkText: 'Configure target role →'
    },
    {
      num: '02',
      title: 'Take the Diagnostic',
      shortLine: 'Find your strengths and weak spots.',
      detail: 'A 40-question test across Aptitude, Core CS, Programming and role-specific topics, with a section-wise score breakdown.',
      icon: BrainCircuit,
      link: '/assessment',
      linkText: 'Start diagnostic test →'
    },
    {
      num: '03',
      title: 'Get Your Adaptive Roadmap',
      shortLine: 'A day-wise plan built for you.',
      detail: 'AI creates daily Learn, Practice and Quiz blocks, and re-plans automatically as your scores change.',
      icon: Calendar,
      link: '/planner',
      linkText: 'View sample roadmap →'
    },
    {
      num: '04',
      title: 'Practice Smartly',
      shortLine: 'DSA problems with guidance.',
      detail: 'Curated problems with hints, time and space complexity review, and Leitner-style spaced revision.',
      icon: Code2,
      link: '/dsa',
      linkText: 'Explore DSA problems →'
    },
    {
      num: '05',
      title: 'Mock Interviews',
      shortLine: 'Speak your answers, get feedback.',
      detail: 'Role-specific voice interviews scored by AI on correctness and clarity, with tips to improve.',
      icon: Mic2,
      link: '/interview',
      linkText: 'Try voice simulation →'
    },
    {
      num: '06',
      title: 'Track Your Readiness',
      shortLine: 'Watch your score climb.',
      detail: 'Follow your Placement Readiness Score, streaks and XP, and unlock tier badges as you improve.',
      icon: Trophy,
      link: '/dashboard',
      linkText: 'Open live dashboard →'
    }
  ];

  const features = [
    {
      id: 'coach',
      title: 'AI Placement Coach',
      tag: 'Instant Answers',
      shortLine: 'Ask doubts anytime, in your language.',
      detail: 'A conversational mentor that explains concepts, breaks down complexity and gives hints in English, Hindi or Hinglish, with responses streamed in real time.',
      icon: Bot,
      link: '/coach',
      linkText: 'Try AI Coach →',
      colSpan: 'lg:col-span-3',
      bullets: ['Trilingual Hinglish Support', 'Real-time Streaming Hints', 'Complexity Breakdown'],
      mockType: 'chat'
    },
    {
      id: 'dsa',
      title: 'Code Studio',
      tag: 'Run and Test',
      shortLine: 'Write, run and debug code in the browser.',
      detail: 'Monaco editor with instant test cases, 3-level progressive hints and Big-O complexity review. Code runs securely via Judge0.',
      icon: Code2,
      link: '/dsa',
      linkText: 'Open Code Studio →',
      colSpan: 'lg:col-span-3',
      bullets: ['Monaco Code Editor', '3-Level Smart Hints', 'Big-O Complexity Review'],
      mockType: 'code'
    },
    {
      id: 'interview',
      title: 'Voice Mock Interviews',
      tag: 'Speak Freely',
      shortLine: 'Practice answering out loud.',
      detail: 'Speech-to-text interviews with live transcript, audio waveform and a score breakdown on correctness and clarity.',
      icon: Mic2,
      link: '/interview',
      linkText: 'Start Voice Simulation →',
      colSpan: 'lg:col-span-2',
      bullets: ['Live Speech Transcript', 'Waveform Visualizer', 'Clarity & Accuracy Score'],
      mockType: 'voice'
    },
    {
      id: 'revision',
      title: 'Spaced Revision',
      tag: '10 Min Daily',
      shortLine: "Never forget what you've learned.",
      detail: 'A Leitner 5-box system (SM-2 based) resurfaces DSA patterns and concepts right before you\'d forget them.',
      icon: Zap,
      link: '/revision',
      linkText: 'Review Spaced Cards →',
      colSpan: 'lg:col-span-2',
      bullets: ['SM-2 Spaced Algorithm', '5-Box Mastery System', 'Daily 10-Min Review Drills'],
      mockType: 'revision'
    },
    {
      id: 'resume',
      title: 'Resume-Based Prep',
      tag: 'Upload PDF',
      shortLine: 'Interview questions from your own resume.',
      detail: 'Upload your resume and PrepPilot extracts your projects and tech stack, then generates questions tailored to them.',
      icon: FileText,
      link: '/resume',
      linkText: 'Analyze Your Resume →',
      colSpan: 'lg:col-span-2',
      bullets: ['PDF Project Extraction', 'Architecture Defense Qs', 'Tech Stack Gap Analysis'],
      mockType: 'resume'
    },
    {
      id: 'companies',
      title: 'Company Tracks',
      tag: 'Top Recruiters',
      shortLine: "Prep for the companies you're targeting.",
      detail: 'Explore interview stages and coding patterns for Google, Amazon, Microsoft, TCS, Infosys and Flipkart.',
      icon: Building2,
      link: '/companies',
      linkText: 'Explore Company Tracks →',
      colSpan: 'lg:col-span-6',
      bullets: ['Round-wise Interview Maps', 'Recurring Coding Patterns', 'Company Readiness Benchmark'],
      companies: ['Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys', 'Flipkart'],
      mockType: 'companies'
    }
  ];

  // Motion variants for stagger
  const fadeInVariant: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
    })
  };

  const handleStepToggle = (num: string) => {
    setActiveStep((prev) => (prev === num ? null : num));
  };

  const handleFeatureToggle = (id: string) => {
    setActiveFeature((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-24 py-4 sm:py-8 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-28">
        {/* Ambient Glows & Subtle Texture */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/15 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none -z-10 opacity-60" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="space-y-6 text-left">
            {/* Two-Tone Split Hero Badge */}
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block max-w-full"
            >
              {/* Padded gradient border wrapper with soft ambient glow */}
              <div className="group relative inline-flex items-center p-[1px] rounded-full bg-linear-to-r from-indigo-500/50 via-violet-500/30 to-cyan-400/50 shadow-[0_0_20px_-6px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_-4px_rgba(99,102,241,0.7)] hover:-translate-y-0.5 hover:brightness-110 transition-all duration-200 cursor-default select-none max-w-full">
                {/* Inner Pill Container with Glass Backdrop */}
                <div className="inline-flex items-center gap-2 sm:gap-2.5 rounded-full bg-[#0a0d18]/90 dark:bg-[#0a0d18]/90 backdrop-blur-xl p-1 pr-3 sm:pr-4 max-w-full overflow-hidden">
                  {/* Left Segment: Solid Gradient AI-POWERED Chip */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-linear-to-r from-indigo-500 to-violet-600 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wide shrink-0 shadow-xs">
                    <Sparkles className="w-3 h-3 text-indigo-200 shrink-0" aria-hidden="true" />
                    <span>AI-POWERED</span>
                  </span>

                  {/* Live Active Product Indicator Dot */}
                  <span className="relative flex h-2 w-2 shrink-0 ml-0.5">
                    {!prefersReducedMotion && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#22d3ee] ${
                        prefersReducedMotion ? '' : 'animate-pulse'
                      }`}
                      aria-hidden="true"
                    />
                  </span>

                  {/* Right Segment: Placement Coach for Engineering Students */}
                  <span className="text-[11px] sm:text-xs md:text-sm text-slate-200 font-medium whitespace-nowrap tracking-tight sm:tracking-normal">
                    Placement Coach for Engineering Students
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeInVariant}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white dark:text-white leading-[1.1] max-w-xl font-heading"
            >
              Get Placement-Ready Faster with Your{' '}
              <span className="bg-linear-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent inline-block">
                Personal AI Mentor
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeInVariant}
              className="text-base sm:text-lg text-slate-300 dark:text-slate-300 leading-relaxed max-w-xl font-normal"
            >
              PrepPilot finds your weak areas, builds a day-wise study roadmap, reviews your DSA code, and runs realistic voice mock interviews, so every hour of prep counts.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeInVariant}
              className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <Link
                to="/assessment"
                className="group h-12 rounded-xl px-6 bg-linear-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_8px_30px_-8px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 hover:shadow-[0_10px_35px_-8px_rgba(99,102,241,0.75)] focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none transition-all duration-200 cursor-pointer"
              >
                <span>Start Free Diagnostic</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150 shrink-0" />
              </Link>

              <Link
                to="/dashboard"
                className="h-12 rounded-xl px-6 bg-white/5 border border-white/15 text-white hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5 backdrop-blur-md font-semibold text-sm flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none transition-all duration-200 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>See Live Dashboard</span>
              </Link>
            </motion.div>

            {/* Microcopy */}
            <motion.p
              custom={4}
              initial="hidden"
              animate="visible"
              variants={fadeInVariant}
              className="mt-4 text-sm text-slate-400 dark:text-slate-400 tracking-wide"
            >
              Takes 45 minutes · Progress autosaves
            </motion.p>

            {/* Feature Pills Row */}
            <motion.div
              custom={5}
              initial="hidden"
              animate="visible"
              variants={fadeInVariant}
              className="mt-6 flex flex-wrap gap-2.5"
            >
              {/* Pill 1: 120+ Aptitude Questions → /aptitude */}
              <Link
                to="/aptitude"
                aria-label="Practice 120+ Aptitude Questions"
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-3.5 py-2.5 min-h-[40px] text-xs sm:text-sm text-slate-200 dark:text-slate-200 hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5 hover:shadow-[0_0_14px_-4px_rgba(52,211,153,0.5)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d18] transition-all duration-150 cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform duration-150" aria-hidden="true" />
                <span>120+ Aptitude Questions</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150" aria-hidden="true" />
              </Link>

              {/* Pill 2: 40 DSA Problem Tracks → /dsa */}
              <Link
                to="/dsa"
                aria-label="Explore 40 DSA Problem Tracks"
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-3.5 py-2.5 min-h-[40px] text-xs sm:text-sm text-slate-200 dark:text-slate-200 hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5 hover:shadow-[0_0_14px_-4px_rgba(34,211,238,0.5)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d18] transition-all duration-150 cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform duration-150" aria-hidden="true" />
                <span>40 DSA Problem Tracks</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150" aria-hidden="true" />
              </Link>

              {/* Pill 3: Voice AI Mock Interviews → /interview */}
              <Link
                to="/interview"
                aria-label="Start Voice AI Mock Interviews"
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-3.5 py-2.5 min-h-[40px] text-xs sm:text-sm text-slate-200 dark:text-slate-200 hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5 hover:shadow-[0_0_14px_-4px_rgba(99,102,241,0.5)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d18] transition-all duration-150 cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform duration-150" aria-hidden="true" />
                <span>Voice AI Mock Interviews</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Premium AI Dashboard Preview Card */}
          <HeroPreviewCard />
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section className="py-20 lg:py-28 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white dark:text-white text-balance tracking-tight">
              Your Path to Placement,{' '}
              <span className="bg-linear-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent inline-block">
                Simplified
              </span>
            </h2>
            <p className="text-slate-300 dark:text-slate-300 text-sm sm:text-base leading-relaxed text-balance">
              Every expert was once a beginner. We just make sure you don't prepare alone.
            </p>
          </div>

          {/* Interactive Steps Grid */}
          <div className="relative">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-start">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isExpanded = activeStep === step.num;
                const cardId = `step-card-${step.num}`;
                const panelId = `step-panel-${step.num}`;

                return (
                  <motion.div
                    key={step.num}
                    custom={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-40px' }}
                    variants={{
                      hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
                      visible: (i: number) => ({
                        opacity: 1,
                        y: 0,
                        transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
                      })
                    }}
                    className={`group rounded-2xl border transition-all duration-300 relative text-left w-full backdrop-blur-xl ${
                      isExpanded
                        ? 'border-indigo-400/50 bg-indigo-500/10 shadow-[0_0_40px_-12px_rgba(99,102,241,0.5)]'
                        : 'border-white/10 bg-white/3 hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-white/6'
                    }`}
                  >
                    <button
                      type="button"
                      id={cardId}
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      onClick={() => handleStepToggle(step.num)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setActiveStep(null);
                        }
                      }}
                      className="w-full p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-2xl cursor-pointer block"
                    >
                      {/* Top Header: Icon & Step Number */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            isExpanded
                              ? 'bg-linear-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30'
                              : 'bg-indigo-500/15 text-indigo-300 group-hover:bg-linear-to-tr group-hover:from-indigo-500 group-hover:to-purple-600 group-hover:text-white'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-mono font-semibold text-white/30 tracking-wider">
                          STEP {step.num}
                        </span>
                      </div>

                      {/* Title & Short Line */}
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-semibold text-white leading-snug">
                          {step.title}
                        </h3>
                        <p className="text-sm text-slate-300 leading-normal">
                          {step.shortLine}
                        </p>
                      </div>

                      {/* Expandable Accordion Panel */}
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={cardId}
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                            <p className="text-sm text-slate-400 leading-relaxed">
                              {step.detail}
                            </p>
                            <Link
                              to={step.link}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200 hover:underline pt-1 transition-colors"
                            >
                              <span>{step.linkText}</span>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Bottom indicator: subtle toggle chevron */}
                      <div className="flex justify-end mt-3 pt-1">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-slate-400 transition-transform duration-300 ${
                            isExpanded ? 'rotate-180 text-indigo-300 bg-indigo-500/20' : 'group-hover:text-white'
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </span>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Continuous Loop Bottom Indicator */}
          <div className="flex justify-center pt-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/4 border border-white/10 text-xs sm:text-sm text-slate-300 shadow-sm backdrop-blur-md">
              <RotateCcw className="w-4 h-4 text-teal-400 animate-spin-slow" />
              <span>
                <strong className="text-white font-medium">Continuous Loop:</strong> Repeat weekly to keep improving your readiness index.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section (Bento Grid) */}
      <section className="py-20 lg:py-28 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              FEATURES
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white dark:text-white text-balance tracking-tight">
              Everything You Need to Get Placement-Ready
            </h2>
            <p className="text-slate-300 dark:text-slate-300 text-sm sm:text-base leading-relaxed text-balance">
              One platform for coaching, coding practice, mock interviews and revision, so you don't need five different apps.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 items-start">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              const isExpanded = activeFeature === feat.id;
              const cardId = `feature-card-${feat.id}`;
              const panelId = `feature-panel-${feat.id}`;

              return (
                <motion.div
                  key={feat.id}
                  custom={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={{
                    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
                    visible: (i: number) => ({
                      opacity: 1,
                      y: 0,
                      transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
                    })
                  }}
                  className={`group rounded-2xl border transition-all duration-300 relative text-left w-full backdrop-blur-xl ${feat.colSpan} ${
                    isExpanded
                      ? 'border-indigo-400/50 bg-indigo-500/10 shadow-[0_0_40px_-12px_rgba(99,102,241,0.5)]'
                      : 'border-white/10 bg-white/3 hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-white/6'
                  }`}
                >
                  <button
                    type="button"
                    id={cardId}
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    onClick={() => handleFeatureToggle(feat.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setActiveFeature(null);
                      }
                    }}
                    className="w-full p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-2xl cursor-pointer block"
                  >
                    {/* Top Row: Icon and Tag */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isExpanded
                            ? 'bg-linear-to-tr from-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-500/30'
                            : 'bg-indigo-500/15 text-indigo-300 group-hover:bg-linear-to-tr group-hover:from-indigo-500 group-hover:to-cyan-400 group-hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs rounded-full px-2.5 py-1 bg-white/5 border border-white/10 text-slate-300 font-medium">
                        {feat.tag}
                      </span>
                    </div>

                    {/* Title & Short Line */}
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-semibold text-white leading-snug">
                        {feat.title}
                      </h3>
                      <p className="text-sm text-slate-300 leading-normal">
                        {feat.shortLine}
                      </p>
                    </div>

                    {/* Expandable Accordion Panel */}
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={cardId}
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="pt-4 mt-4 border-t border-white/10 space-y-3.5">
                          {/* Expanded Detail Text */}
                          <p className="text-sm text-slate-400 leading-relaxed">
                            {feat.detail}
                          </p>

                          {/* Static Mini Preview Mocks */}
                          {feat.mockType === 'chat' && (
                            <div className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-2 text-xs">
                              <div className="flex items-start gap-2 text-slate-300">
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-400 shrink-0">You</span>
                                <p className="text-[11px] truncate">How do I optimize Dijkstra for dense graphs?</p>
                              </div>
                              <div className="flex items-start gap-2 text-indigo-300">
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shrink-0">Coach</span>
                                <p className="text-[11px] truncate">Use an adjacency matrix with $O(V^2)$ rather than a Min-Heap...</p>
                              </div>
                            </div>
                          )}

                          {feat.mockType === 'code' && (
                            <div className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-1.5 text-xs font-mono">
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-cyan-400" /> solution.cpp</span>
                                <span className="text-emerald-400 font-semibold text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">3/3 Tests Passed</span>
                              </div>
                              <p className="text-[11px] text-slate-300 font-mono">Time: O(N log N) · Space: O(1)</p>
                            </div>
                          )}

                          {feat.mockType === 'voice' && (
                            <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5">
                                <div className="flex items-end gap-0.5 h-4">
                                  <span className="w-1 h-2 bg-indigo-400 rounded-full animate-pulse" />
                                  <span className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse" />
                                  <span className="w-1 h-3 bg-indigo-400 rounded-full animate-pulse" />
                                  <span className="w-1 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                </div>
                                <span className="text-[11px] text-slate-300">Live Transcript Active</span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/15">
                                92% Clarity
                              </span>
                            </div>
                          )}

                          {feat.mockType === 'revision' && (
                            <div className="p-2.5 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between text-xs">
                              <span className="text-[11px] text-slate-300">Leitner Box 4 / 5</span>
                              <span className="text-[10px] font-mono text-teal-400 font-semibold">Due in 3 Days</span>
                            </div>
                          )}

                          {feat.mockType === 'resume' && (
                            <div className="p-2.5 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between text-xs">
                              <span className="text-[11px] text-slate-300 truncate">Project: Distributed Key-Value Store</span>
                              <span className="text-[10px] text-indigo-300 font-medium shrink-0 ml-2">4 Custom Qs</span>
                            </div>
                          )}

                          {/* Company Chips for Company Tracks Card */}
                          {feat.companies && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {feat.companies.map((company) => (
                                <span
                                  key={company}
                                  className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-200 hover:border-indigo-400/40 hover:bg-white/10 transition-colors"
                                >
                                  {company}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Sub-feature Bullet Chips */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {feat.bullets.map((bullet) => (
                              <div
                                key={bullet}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300"
                              >
                                <Check className="w-3 h-3 text-indigo-400" />
                                <span>{bullet}</span>
                              </div>
                            ))}
                          </div>

                          {/* CTA Link */}
                          <div className="pt-2">
                            <Link
                              to={feat.link}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200 hover:underline transition-colors"
                            >
                              <span>{feat.linkText}</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom indicator: subtle toggle chevron */}
                    <div className="flex justify-end mt-3 pt-1">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-slate-400 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180 text-indigo-300 bg-indigo-500/20' : 'group-hover:text-white'
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Interactive "Choose Your Pace" Section */}
      <ChooseYourPaceSection />
    </div>
  );
};
