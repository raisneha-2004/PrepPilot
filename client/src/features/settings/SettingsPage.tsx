import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Languages,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    reducedMotion,
    setReducedMotion,
    profile,
    resetAllData
  } = useAppStore();

  const handleExportData = () => {
    const backup = {
      profile,
      timestamp: new Date().toISOString(),
      localStorageDump: { ...localStorage }
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `preppilot_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Progress backup exported as JSON!');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.localStorageDump) {
            Object.entries(parsed.localStorageDump).forEach(([k, v]) => {
              localStorage.setItem(k, v as string);
            });
            toast.success('Data imported! Reloading page.');
            setTimeout(() => window.location.reload(), 1000);
          } else {
            toast.error('Invalid backup format');
          }
        } catch (_) {
          toast.error('Failed to parse JSON file');
        }
      };
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-2">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
          <Settings className="w-4 h-4" />
          <span>System & Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-heading text-main">
          Application Settings
        </h1>
        <p className="text-muted text-xs">
          Configure appearance, language, accessibility, and local data persistence.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 space-y-6 divide-y divide-subtle">
        {/* Theme Settings */}
        <div className="pb-6 space-y-3">
          <label className="text-xs font-bold text-main block uppercase">Visual Appearance</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 font-bold'
                  : 'border-subtle bg-surface-subtle text-muted hover:text-main'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span className="text-xs">Dark Theme (Aurora Glass)</span>
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                theme === 'light'
                  ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 font-bold'
                  : 'border-subtle bg-surface-subtle text-muted hover:text-main'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-xs">Light Theme</span>
            </button>
          </div>
        </div>

        {/* AI Language Preference */}
        <div className="py-6 space-y-3">
          <label className="text-xs font-bold text-main block uppercase">AI Mentor Language Mode</label>
          <div className="grid grid-cols-3 gap-3">
            {(['English', 'Hindi', 'Hinglish'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  language === lang
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 font-bold'
                    : 'border-subtle bg-surface-subtle text-muted hover:text-main'
                }`}
              >
                <span className="text-xs">{lang}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility */}
        <div className="py-6 space-y-3">
          <label className="text-xs font-bold text-main block uppercase">Accessibility</label>
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-subtle border border-subtle">
            <div>
              <span className="text-xs font-bold text-main block">Reduced Motion</span>
              <span className="text-[11px] text-muted">Disables non-essential page transitions and glow sweeps.</span>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Backup & Import Data */}
        <div className="py-6 space-y-3">
          <label className="text-xs font-bold text-main block uppercase">Data Management (Offline Persist)</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleExportData} className="btn-secondary text-xs flex-1 py-2.5">
              <Download className="w-4 h-4" />
              <span>Export Progress Backup (JSON)</span>
            </button>

            <label className="btn-secondary text-xs flex-1 py-2.5 cursor-pointer text-center flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Import Progress Backup</span>
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>
          </div>
        </div>

        {/* Factory Reset */}
        <div className="pt-6 space-y-3">
          <label className="text-xs font-bold text-rose-400 block uppercase">Danger Zone</label>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all local placement progress? This action cannot be undone.')) {
                resetAllData();
              }
            }}
            className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold w-full transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Local Data & Onboarding</span>
          </button>
        </div>
      </div>
    </div>
  );
};
