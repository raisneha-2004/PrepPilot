import { FileRepository } from './FileRepository.js';

export const profileRepo = new FileRepository('profiles');
export const assessmentRepo = new FileRepository('assessments');
export const plannerRepo = new FileRepository('planners');
export const coachRepo = new FileRepository('coach_history');
export const dsaRepo = new FileRepository('dsa_progress');
export const aptitudeRepo = new FileRepository('aptitude_progress');
export const interviewRepo = new FileRepository('interviews');
export const resumeRepo = new FileRepository('resumes');
export const revisionRepo = new FileRepository('spaced_revisions');
export const gamificationRepo = new FileRepository('gamification');
export const dailyRepo = new FileRepository('daily_challenges');
export const userRepo = new FileRepository('users');

export { FileRepository };
