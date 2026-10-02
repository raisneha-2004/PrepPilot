import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic2,
  MicOff,
  Mic,
  Send,
  Sparkles,
  Award,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Volume2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { interviewApi } from '../../lib/api/client';
import { useSpeech } from '../../hooks/useSpeech';
import { useConfetti } from '../../hooks/useConfetti';
import { ShimmerCard } from '../../components/ui/LoadingSkeleton';
import { toast } from 'sonner';

export const MockInterviewPage: React.FC = () => {
  const { triggerConfetti } = useConfetti();
  const [role, setRole] = useState('SDE');
  const [difficulty, setDifficulty] = useState('medium');
  const [session, setSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [finalReport, setFinalReport] = useState<any>(null);

  const { isListening, transcript, isSupported, startListening, stopListening, speak } = useSpeech();

  React.useEffect(() => {
    if (transcript) {
      setCandidateAnswer(transcript);
    }
  }, [transcript]);

  // Start Interview Mutation
  const startMutation = useMutation({
    mutationFn: () => interviewApi.start({ role, difficulty }),
    onSuccess: (data) => {
      setSession(data);
      setCurrentQuestion(data.firstQuestion);
      setEvaluations([]);
      setFinalReport(null);
      toast.success('Mock interview started! Answer using voice or text.');
    }
  });

  // Submit Answer Mutation
  const submitAnswerMutation = useMutation({
    mutationFn: () =>
      interviewApi.submitAnswer(session.interviewId, candidateAnswer),
    onSuccess: (data) => {
      if (isListening) stopListening();
      setCandidateAnswer('');
      setEvaluations((prev) => [...prev, data]);
      setCurrentQuestion(data.nextQuestion);
      toast.success('Answer evaluated! Next question is ready.');
    },
    onError: () => toast.error('Evaluation failed. Please try answering again.')
  });

  // Finish Interview Mutation
  const finishMutation = useMutation({
    mutationFn: () => interviewApi.finish(session.interviewId),
    onSuccess: (report) => {
      setFinalReport(report);
      triggerConfetti();
      toast.success('Mock interview completed! Summary report generated.');
    }
  });

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-3">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
          <Mic2 className="w-4 h-4" />
          <span>AI Voice & Technical Mock Interview</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-heading text-main">
          Simulate Realistic Placement Interviews
        </h1>
        <p className="text-muted text-xs max-w-xl">
          Speak your answers via Web Speech voice input or type them. Receive instant technical correctness, clarity scores, missing concepts, and ideal answers.
        </p>
      </div>

      {/* View 1: Configuration / Start Screen */}
      {!session && !finalReport && (
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-main mb-2">Target Interview Track</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-subtle text-xs text-main outline-none focus:border-indigo-500"
              >
                <option value="SDE">SDE (Algorithms & Systems)</option>
                <option value="Frontend">Frontend Engineering</option>
                <option value="Backend">Backend & Distributed Systems</option>
                <option value="AI-ML">AI / Machine Learning</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-main mb-2">Interview Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-subtle text-xs text-main outline-none focus:border-indigo-500"
              >
                <option value="easy">Easy (Campus Entry Round)</option>
                <option value="medium">Medium (Standard Tier-1 Round)</option>
                <option value="hard">Hard (MAANG Bar Raiser)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="btn-primary w-full py-3 text-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>{startMutation.isPending ? 'Starting Interview Session...' : 'Start Mock Interview Session'}</span>
          </button>
        </div>
      )}

      {/* View 2: Live Interview Session */}
      {session && !finalReport && (
        <div className="space-y-6">
          {/* Question Card */}
          <div className="glass-panel p-6 sm:p-8 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-subtle pb-3">
              <span className="text-xs font-bold text-indigo-400">
                Question {evaluations.length + 1} • {currentQuestion?.category || 'Technical'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-subtle text-muted">
                {role} ({difficulty})
              </span>
            </div>

            <h2 className="text-lg font-bold font-heading text-main leading-relaxed">
              {currentQuestion?.question}
            </h2>

            {/* Expected Core Concepts hint */}
            {currentQuestion?.expectedCoreConcepts && currentQuestion.expectedCoreConcepts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-[10px] text-muted mr-1">Key concepts:</span>
                {currentQuestion.expectedCoreConcepts.map((c: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-surface-subtle border border-subtle text-[10px] text-muted">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Answer Input Workspace */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-main">Your Interview Response</label>
              {isListening && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold animate-pulse">
                  <div className="flex gap-0.5 items-end h-4">
                    <div className="waveform-bar" style={{ animationDelay: '0.1s' }} />
                    <div className="waveform-bar" style={{ animationDelay: '0.3s' }} />
                    <div className="waveform-bar" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span>Listening live...</span>
                </div>
              )}
            </div>

            <textarea
              rows={4}
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              placeholder="Speak using microphone or type your technical answer here..."
              className="w-full p-4 rounded-xl bg-surface-subtle border border-subtle text-xs text-main placeholder:text-muted outline-none focus:border-indigo-500"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {isSupported ? (
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`btn-secondary text-xs px-4 py-2 flex items-center gap-1.5 ${
                      isListening ? 'bg-rose-500/20 border-rose-500 text-rose-400' : ''
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'Stop Mic' : 'Voice Input (Mic)'}</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-muted">Speech API unavailable in this browser.</span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {evaluations.length >= 2 && (
                  <button
                    onClick={() => finishMutation.mutate()}
                    disabled={finishMutation.isPending}
                    className="btn-secondary text-xs px-4 py-2"
                  >
                    <span>Conclude & View Report</span>
                  </button>
                )}

                <button
                  onClick={() => submitAnswerMutation.mutate()}
                  disabled={!candidateAnswer.trim() || submitAnswerMutation.isPending}
                  className="btn-primary text-xs px-5 py-2 flex-1 sm:flex-initial"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitAnswerMutation.isPending ? 'Evaluating...' : 'Submit Answer'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Previous Answer Evaluations History */}
          {evaluations.length > 0 && (
            <div className="space-y-4 pt-4">
              <span className="text-xs font-bold text-main block">Evaluation Feedback for Previous Answers</span>
              {evaluations.map((ev, idx) => (
                <div key={idx} className="glass-card p-5 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-subtle pb-2">
                    <span className="font-bold text-main">Answer {idx + 1} Analysis</span>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-bold">
                        Correctness: {ev.scores?.technicalCorrectness}%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold">
                        Overall: {ev.scores?.overallScore}%
                      </span>
                    </div>
                  </div>

                  <p className="text-muted leading-relaxed">{ev.feedback}</p>

                  {ev.improvedSampleAnswer && (
                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                      <span className="font-bold text-indigo-300 block text-[11px]">Polished Ideal Response:</span>
                      <p className="text-main leading-relaxed text-[11px]">{ev.improvedSampleAnswer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View 3: Final Report */}
      {finalReport && (
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black font-heading text-main">
              Mock Interview Summary Report
            </h2>
            <div className="flex justify-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs">
                Verdict: {finalReport.verdict}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                Score: {finalReport.averageScores?.overallScore}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-xl bg-surface-subtle border border-subtle">
              <span className="text-muted text-[10px] block">Technical Correctness</span>
              <span className="text-lg font-bold text-main">{finalReport.averageScores?.technicalCorrectness}%</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-subtle border border-subtle">
              <span className="text-muted text-[10px] block">Answer Relevance</span>
              <span className="text-lg font-bold text-main">{finalReport.averageScores?.relevance}%</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-subtle border border-subtle">
              <span className="text-muted text-[10px] block">Communication Clarity</span>
              <span className="text-lg font-bold text-main">{finalReport.averageScores?.clarity}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <span className="font-bold text-emerald-300 block">Identified Strengths:</span>
              <ul className="list-disc list-inside text-muted space-y-1">
                {(finalReport.keyStrengths || []).map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
              <span className="font-bold text-rose-300 block">Recommended Focus Areas:</span>
              <ul className="list-disc list-inside text-muted space-y-1">
                {(finalReport.recommendedAreasToImprove || []).map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => {
              setSession(null);
              setFinalReport(null);
            }}
            className="btn-primary w-full py-3 text-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Start Another Mock Session</span>
          </button>
        </div>
      )}
    </div>
  );
};
