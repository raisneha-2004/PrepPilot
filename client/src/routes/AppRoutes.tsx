import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { LandingPage } from '../features/landing/LandingPage';
import { LoginPage } from '../features/auth/LoginPage';
import { OnboardingPage } from '../features/onboarding/OnboardingPage';
import { AssessmentPage } from '../features/assessment/AssessmentPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { StudyPlannerPage } from '../features/planner/StudyPlannerPage';
import { AICoachPage } from '../features/coach/AICoachPage';
import { DSAPracticePage } from '../features/dsa/DSAPracticePage';
import { AptitudePage } from '../features/aptitude/AptitudePage';
import { CSFundamentalsPage } from '../features/cs/CSFundamentalsPage';
import { MockInterviewPage } from '../features/interview/MockInterviewPage';
import { ResumeInterviewPage } from '../features/resume/ResumeInterviewPage';
import { SpacedRevisionPage } from '../features/revision/SpacedRevisionPage';
import { DailyChallengePage } from '../features/daily/DailyChallengePage';
import { CompanyModePage } from '../features/company/CompanyModePage';
import { GamificationPage } from '../features/gamification/GamificationPage';
import { SettingsPage } from '../features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
      {
        path: 'assessment',
        element: (
          <ProtectedRoute>
            <AssessmentPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'planner',
        element: (
          <ProtectedRoute>
            <StudyPlannerPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'coach',
        element: (
          <ProtectedRoute>
            <AICoachPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'dsa',
        element: (
          <ProtectedRoute>
            <DSAPracticePage />
          </ProtectedRoute>
        )
      },
      {
        path: 'aptitude',
        element: (
          <ProtectedRoute>
            <AptitudePage />
          </ProtectedRoute>
        )
      },
      {
        path: 'cs',
        element: (
          <ProtectedRoute>
            <CSFundamentalsPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'interview',
        element: (
          <ProtectedRoute>
            <MockInterviewPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'resume',
        element: (
          <ProtectedRoute>
            <ResumeInterviewPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'revision',
        element: (
          <ProtectedRoute>
            <SpacedRevisionPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'daily',
        element: (
          <ProtectedRoute>
            <DailyChallengePage />
          </ProtectedRoute>
        )
      },
      {
        path: 'companies',
        element: (
          <ProtectedRoute>
            <CompanyModePage />
          </ProtectedRoute>
        )
      },
      {
        path: 'gamification',
        element: (
          <ProtectedRoute>
            <GamificationPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        )
      },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);
