import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Binary,
  BookOpen,
  HelpCircle,
  Code2,
  CheckCircle2,
  Sparkles,
  MessageSquareQuote,
  Lightbulb
} from 'lucide-react';
import { csApi } from '../../lib/api/client';
import { ShimmerCard } from '../../components/ui/LoadingSkeleton';
import { useConfetti } from '../../hooks/useConfetti';
import { toast } from 'sonner';

const SUBJECTS = [
  { id: 'oop', name: 'Object-Oriented (OOP)', icon: Code2 },
  { id: 'dbms', name: 'DBMS & ACID', icon: Binary },
  { id: 'os', name: 'Operating Systems', icon: BookOpen },
  { id: 'cn', name: 'Computer Networks', icon: Sparkles },
  { id: 'sql', name: 'SQL & Querying', icon: HelpCircle }
];

export const CSFundamentalsPage: React.FC = () => {
  const { triggerConfetti } = useConfetti();
  const [activeSubject, setActiveSubject] = useState('oop');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);

  const { data: subjectData, isLoading } = useQuery({
    queryKey: ['csSubject', activeSubject],
    queryFn: () => csApi.getSubject(activeSubject)
  });

  const submitQuizMutation = useMutation({
    mutationFn: (payload: any[]) => csApi.submitQuiz(activeSubject, payload),
    onSuccess: (res) => {
      setQuizResult(res);
      triggerConfetti();
      toast.success('Quiz submitted and scored!');
    }
  });

  const handleSelectMCQ = (mcqId: string, optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [mcqId]: optIdx }));
  };

  const handleQuizSubmit = () => {
    const formatted = Object.entries(answers).map(([qId, opt]) => ({
      questionId: qId,
      selectedOption: opt
    }));

    submitQuizMutation.mutate(formatted);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Subject Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-subtle">
        {SUBJECTS.map((s) => {
          const Icon = s.icon;
          const isActive = activeSubject === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                setActiveSubject(s.id);
                setAnswers({});
                setQuizResult(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20'
                  : 'glass-card text-muted hover:text-main'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{s.name}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <ShimmerCard className="h-96" />
      ) : (
        <div className="space-y-6">
          {/* Concept Overview Card */}
          <div className="glass-panel p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <Lightbulb className="w-4 h-4" />
              <span>Core Subject Theory</span>
            </div>

            <h1 className="text-2xl font-bold font-heading text-main">
              {subjectData?.name}
            </h1>

            <div className="p-4 rounded-xl bg-surface-subtle border border-subtle space-y-2 text-xs">
              <span className="font-bold text-main block">Concept Summary:</span>
              <p className="text-muted leading-relaxed">{subjectData?.concept}</p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/25 space-y-1 text-xs">
              <span className="font-bold text-indigo-300 block">Intuitive Real-World Analogy:</span>
              <p className="text-main leading-relaxed">{subjectData?.simpleExplanation}</p>
            </div>

            {subjectData?.example && (
              <div className="p-4 rounded-xl bg-surface-subtle border border-subtle space-y-1 text-xs font-mono">
                <span className="font-bold text-cyan-400 block font-sans">Engineering Example:</span>
                <p className="text-muted">{subjectData.example}</p>
              </div>
            )}
          </div>

          {/* Key Placement Interview Questions */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <MessageSquareQuote className="w-4 h-4" />
              <span>High-Frequency Placement Interview Questions</span>
            </div>

            <div className="space-y-2.5">
              {(subjectData?.keyInterviewQuestions || []).map((q: string, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-surface-subtle border border-subtle text-xs text-main flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Topic MCQs Quiz */}
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-subtle pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-main">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Concept Checkpoint MCQs ({subjectData?.mcqs?.length || 0} Questions)</span>
              </div>
              {quizResult && (
                <span className="text-xs font-bold text-emerald-400">
                  Score: {quizResult.scorePercentage}%
                </span>
              )}
            </div>

            <div className="space-y-5">
              {(subjectData?.mcqs || []).map((mcq: any, i: number) => {
                const selectedOpt = answers[mcq.id];
                const feedbackItem = quizResult?.feedback?.find((f: any) => f.questionId === mcq.id);

                return (
                  <div key={mcq.id} className="space-y-3 p-4 rounded-xl bg-surface-subtle border border-subtle text-xs">
                    <p className="font-semibold text-main">
                      Q{i + 1}: {mcq.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mcq.options.map((opt: string, optIdx: number) => {
                        const isSelected = selectedOpt === optIdx;
                        let btnStyle = 'border-subtle bg-surface text-muted';

                        if (feedbackItem) {
                          if (feedbackItem.correctOption === optIdx) {
                            btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-bold';
                          } else if (isSelected) {
                            btnStyle = 'border-rose-500 bg-rose-500/15 text-rose-300';
                          }
                        } else if (isSelected) {
                          btnStyle = 'border-indigo-500 bg-indigo-500/15 text-indigo-300';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectMCQ(mcq.id, optIdx)}
                            className={`p-2.5 rounded-lg border text-left transition-all ${btnStyle}`}
                          >
                            <span className="font-bold mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {feedbackItem && (
                      <p className="text-[11px] text-muted pt-2 border-t border-subtle leading-relaxed">
                        <span className="font-semibold text-main">Explanation:</span> {feedbackItem.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleQuizSubmit}
              disabled={submitQuizMutation.isPending || Object.keys(answers).length === 0}
              className="btn-primary w-full py-3 text-xs disabled:opacity-40"
            >
              <span>{submitQuizMutation.isPending ? 'Scoring...' : 'Submit Quiz & Check Explanations'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
