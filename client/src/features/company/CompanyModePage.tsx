import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  ShieldAlert,
  CheckCircle2,
  Code2,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { companyApi } from '../../lib/api/client';
import { ShimmerCard } from '../../components/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';

export const CompanyModePage: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('google');

  const { data: companiesData, isLoading: isListLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companyApi.getAll
  });

  const { data: companyDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['companyDetail', selectedCompanyId],
    queryFn: () => companyApi.getById(selectedCompanyId),
    enabled: !!selectedCompanyId
  });

  if (isListLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <ShimmerCard className="h-28" />
        <ShimmerCard className="h-64" />
      </div>
    );
  }

  const companies = companiesData?.companies || [];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-3">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
          <Building2 className="w-4 h-4" />
          <span>Targeted Company Tracks</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-heading text-main">
          Company Specific Hiring Patterns
        </h1>
        <p className="text-muted text-xs max-w-xl">
          Review reported interview stages, Online Assessment (OA) formats, and curated coding questions for top product and service firms.
        </p>
      </div>

      {/* Company Selector Chips */}
      <div className="flex flex-wrap gap-2">
        {companies.map((c: any) => (
          <button
            key={c.id}
            onClick={() => setSelectedCompanyId(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedCompanyId === c.id
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20'
                : 'glass-card text-muted hover:text-main'
            }`}
          >
            <span>{c.name}</span>
            <span className="text-[10px] opacity-75 font-normal">({c.tier})</span>
          </button>
        ))}
      </div>

      {/* Company Details */}
      {isDetailLoading ? (
        <ShimmerCard className="h-96" />
      ) : (
        <div className="space-y-6">
          {/* Main Info & Disclaimer Badge */}
          <div className="glass-panel p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-subtle pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  {companyDetail?.tier} Tier Focus
                </span>
                <h2 className="text-2xl font-black font-heading text-main">
                  {companyDetail?.name}
                </h2>
              </div>

              {/* Source & Community Reported Disclaimer */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] flex items-start gap-2 max-w-sm">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Community-Reported Archive</span>
                  <span className="text-muted text-[10px]">
                    Source: {companyDetail?.source} • Last verified: {companyDetail?.lastVerified}. Always verify on the official careers portal.
                  </span>
                </div>
              </div>
            </div>

            {/* Hiring Process Rounds */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-main flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Hiring Process Stages ({companyDetail?.pattern?.rounds || 4} Rounds)</span>
              </span>
              <div className="space-y-2">
                {(companyDetail?.hiringProcess || []).map((stage: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-surface-subtle border border-subtle text-xs text-main flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{stage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended DSA Problems */}
            {companyDetail?.preparationResources?.recommendedDSAProblems?.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-main flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <span>High-Probability DSA Coding Problems</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {companyDetail.preparationResources.recommendedDSAProblems.map((p: any) => (
                    <Link
                      key={p.id}
                      to="/dsa"
                      className="p-3.5 rounded-xl bg-surface-subtle border border-subtle hover:border-highlight flex items-center justify-between transition-all group"
                    >
                      <div>
                        <span className="font-bold text-xs text-main block group-hover:text-indigo-300">
                          {p.title}
                        </span>
                        <span className="text-[10px] text-muted">{p.topic}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300">
                        {p.difficulty}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
