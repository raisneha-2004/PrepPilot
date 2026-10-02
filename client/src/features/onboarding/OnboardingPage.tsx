import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Code2,
  Briefcase,
  Calendar,
  Clock,
  Building,
  Languages,
  Plus,
  X
} from 'lucide-react';
import { useAppStore, UserProfile } from '../../store/useAppStore';
import { profileApi } from '../../lib/api/client';
import { useConfetti } from '../../hooks/useConfetti';
import { toast } from 'sonner';

const POPULAR_SKILLS = [
  'Data Structures & Algorithms',
  'Java',
  'Python',
  'C++',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'SQL / PostgreSQL',
  'MongoDB',
  'System Design',
  'Operating Systems',
  'DBMS',
  'Computer Networks',
  'Docker',
  'Git'
];

const TARGET_COMPANIES_LIST = [
  'Google',
  'Amazon',
  'Microsoft',
  'Flipkart',
  'TCS Digital',
  'Infosys SP',
  'Adobe',
  'Uber',
  'Atlassian',
  'Goldman Sachs'
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, setProfile } = useAppStore();
  const { triggerConfetti } = useConfetti();

  const [step, setStep] = useState(1);
  const [targetRole, setTargetRole] = useState<UserProfile['targetRole']>(profile.targetRole || 'SDE');
  const [experienceLevel, setExperienceLevel] = useState<UserProfile['experienceLevel']>(profile.experienceLevel || 'fresher');
  const [placementDate, setPlacementDate] = useState(profile.placementDate || '2026-11-30');
  const [dailyHours, setDailyHours] = useState(profile.dailyHours || 3);
  const [currentSkills, setCurrentSkills] = useState<string[]>(profile.currentSkills || ['Java', 'SQL', 'Data Structures']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [targetCompanies, setTargetCompanies] = useState<string[]>(profile.targetCompanies || ['Google', 'Amazon', 'Microsoft']);
  const [preferredLanguage, setPreferredLanguage] = useState<UserProfile['preferredLanguage']>(profile.preferredLanguage || 'English');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSkill = (skill: string) => {
    if (currentSkills.includes(skill)) {
      setCurrentSkills(currentSkills.filter((s) => s !== skill));
    } else {
      setCurrentSkills([...currentSkills, skill]);
    }
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillInput.trim() && !currentSkills.includes(newSkillInput.trim())) {
      setCurrentSkills([...currentSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const toggleCompany = (comp: string) => {
    if (targetCompanies.includes(comp)) {
      setTargetCompanies(targetCompanies.filter((c) => c !== comp));
    } else {
      setTargetCompanies([...targetCompanies, comp]);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    const updatedProfile: UserProfile = {
      targetRole,
      experienceLevel,
      placementDate,
      dailyHours,
      currentSkills,
      targetCompanies,
      preferredLanguage,
      onboarded: true
    };

    setProfile(updatedProfile);

    try {
      await profileApi.saveProfile(updatedProfile);
      triggerConfetti();
      toast.success('Placement profile configured successfully!');
      navigate('/assessment');
    } catch (err: any) {
      toast.info('Profile saved locally! Proceeding to diagnostic test.');
      triggerConfetti();
      navigate('/assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Wizard Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step {step} of 4</span>
        </div>
        <h1 className="text-3xl font-extrabold font-heading text-main">
          Tailor Your Placement Preparation
        </h1>
        <p className="text-muted text-xs">
          Help PrepPilot customize your diagnostic test, study roadmap, and interview simulations.
        </p>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-surface-subtle rounded-full overflow-hidden mt-4 border border-subtle">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
            initial={{ width: '25%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Wizard Card Container */}
      <div className="glass-panel p-6 sm:p-8 relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-main mb-3">
                  1. What is your Target Engineering Role?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['SDE', 'Frontend', 'Backend', 'AI-ML'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        targetRole === role
                          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-md shadow-indigo-500/10'
                          : 'border-subtle bg-surface-subtle text-muted hover:text-main'
                      }`}
                    >
                      <Code2 className="w-5 h-5 mb-2 text-indigo-400" />
                      <span className="font-bold text-sm text-main">{role}</span>
                      <span className="text-[11px] text-muted mt-1">
                        {role === 'SDE' && 'Algorithms, Systems & CS Core'}
                        {role === 'Frontend' && 'React, Browser Architecture, Web Vitals'}
                        {role === 'Backend' && 'APIs, Microservices, DB & Caching'}
                        {role === 'AI-ML' && 'Transformers, RAG, Deep Learning'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-main mb-3">
                  2. Experience Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'fresher', label: 'College Fresher', desc: 'Final/Pre-final year' },
                    { id: '1-2-years', label: '1 - 2 Years', desc: 'Early Career' },
                    { id: '3+-years', label: '3+ Years', desc: 'Mid/Senior' }
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setExperienceLevel(lvl.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        experienceLevel === lvl.id
                          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                          : 'border-subtle bg-surface-subtle text-muted hover:text-main'
                      }`}
                    >
                      <span className="font-bold text-xs text-main block">{lvl.label}</span>
                      <span className="text-[10px] text-muted">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-main mb-2">
                  1. Target Placement Drive Date
                </label>
                <p className="text-xs text-muted mb-3">
                  PrepPilot calculates your day-wise study roadmap based on days remaining.
                </p>
                <div className="relative">
                  <input
                    type="date"
                    value={placementDate}
                    onChange={(e) => setPlacementDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-subtle border border-subtle text-sm text-main focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-main">
                    2. Daily Preparation Commitment
                  </label>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs">
                    {dailyHours} Hours / Day
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-surface-subtle rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-muted mt-1">
                  <span>1 hr (Light)</span>
                  <span>3-4 hrs (Recommended)</span>
                  <span>10 hrs (Sprint)</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-bold text-main mb-1">
                  Select Your Current Technical Skills
                </label>
                <p className="text-xs text-muted mb-3">
                  Tap to add skills you are already familiar with.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {POPULAR_SKILLS.map((sk) => {
                    const isSelected = currentSkills.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => toggleSkill(sk)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                            : 'bg-surface-subtle border border-subtle text-muted hover:text-main'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {sk}
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={addCustomSkill} className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Add custom skill (e.g. Next.js, Redis)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-xs text-main outline-none focus:border-indigo-500"
                  />
                  <button type="submit" className="btn-secondary text-xs px-3 py-2">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-main mb-1">
                  1. Target Companies
                </label>
                <p className="text-xs text-muted mb-3">
                  We will prioritize interview questions and coding patterns matching these firms.
                </p>
                <div className="flex flex-wrap gap-2">
                  {TARGET_COMPANIES_LIST.map((comp) => {
                    const isSelected = targetCompanies.includes(comp);
                    return (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => toggleCompany(comp)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-black font-semibold shadow-sm'
                            : 'bg-surface-subtle border border-subtle text-muted hover:text-main'
                        }`}
                      >
                        {comp}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-main mb-2">
                  2. AI Coach Preferred Language
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['English', 'Hindi', 'Hinglish'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setPreferredLanguage(lang)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        preferredLanguage === lang
                          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 font-bold'
                          : 'border-subtle bg-surface-subtle text-muted hover:text-main'
                      }`}
                    >
                      <span className="text-xs">{lang}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-subtle">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn-secondary text-xs px-4 py-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="btn-primary text-xs px-5 py-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinish}
              className="btn-primary text-xs px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              <span>{isSubmitting ? 'Saving...' : 'Complete & Start Assessment'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
