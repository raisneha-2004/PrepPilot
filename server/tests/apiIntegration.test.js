import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('PrepPilot API Integration Tests', () => {
  let app;
  const testUserId = 'test-integration-user-123';

  beforeAll(() => {
    app = createApp();
  });

  it('GET /health - returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  it('POST /api/v1/profile & GET /api/v1/profile - manages profile lifecycle', async () => {
    const saveRes = await request(app)
      .post('/api/v1/profile')
      .set('X-User-Id', testUserId)
      .send({
        targetRole: 'SDE',
        experienceLevel: 'fresher',
        dailyHours: 3,
        currentSkills: ['Java', 'JavaScript', 'SQL'],
        targetCompanies: ['Google', 'Amazon'],
        preferredLanguage: 'English'
      });

    expect(saveRes.status).toBe(201);
    expect(saveRes.body.ok).toBe(true);
    expect(saveRes.body.data.targetRole).toBe('SDE');

    const getRes = await request(app)
      .get('/api/v1/profile')
      .set('X-User-Id', testUserId);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.targetRole).toBe('SDE');
  });

  it('GET /api/v1/assessment/questions & POST /api/v1/assessment/submit - diagnoses baseline', async () => {
    const qRes = await request(app)
      .get('/api/v1/assessment/questions?sections=aptitude,dsa,oop,dbms&count=4')
      .set('X-User-Id', testUserId);

    expect(qRes.status).toBe(200);
    expect(qRes.body.data.questions.length).toBeGreaterThanOrEqual(1);

    const questions = qRes.body.data.questions;
    const submitRes = await request(app)
      .post('/api/v1/assessment/submit')
      .set('X-User-Id', testUserId)
      .send({
        answers: questions.map((q) => ({
          questionId: q.id,
          section: q.section,
          selectedOption: 0
        })),
        timeTakenSeconds: 120
      });

    expect(submitRes.status).toBe(201);
    expect(submitRes.body.data).toHaveProperty('overallPercentage');
    expect(submitRes.body.data).toHaveProperty('strengths');
    expect(submitRes.body.data).toHaveProperty('weaknesses');
  });

  it('GET /api/v1/dsa/topics & GET /api/v1/dsa/problems - fetches DSA catalog', async () => {
    const topicsRes = await request(app)
      .get('/api/v1/dsa/topics')
      .set('X-User-Id', testUserId);

    expect(topicsRes.status).toBe(200);
    expect(topicsRes.body.data.topics.length).toBe(9);

    const problemsRes = await request(app)
      .get('/api/v1/dsa/problems?topic=Arrays')
      .set('X-User-Id', testUserId);

    expect(problemsRes.status).toBe(200);
    expect(problemsRes.body.data.problems.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/dsa/problems/:id/hint - progressive hints', async () => {
    const hintRes = await request(app)
      .post('/api/v1/dsa/problems/dsa_1/hint')
      .set('X-User-Id', testUserId)
      .send({ level: 1 });

    expect(hintRes.status).toBe(200);
    expect(hintRes.body.data).toHaveProperty('hint');
  });

  it('GET /api/v1/aptitude/topics & /api/v1/aptitude/questions - aptitude practice', async () => {
    const aptRes = await request(app)
      .get('/api/v1/aptitude/questions?topic=Quantitative%20Aptitude&count=5')
      .set('X-User-Id', testUserId);

    expect(aptRes.status).toBe(200);
    expect(aptRes.body.data.questions.length).toBe(5);
  });

  it('GET /api/v1/cs/dbms - CS fundamentals', async () => {
    const csRes = await request(app)
      .get('/api/v1/cs/dbms')
      .set('X-User-Id', testUserId);

    expect(csRes.status).toBe(200);
    expect(csRes.body.data.name).toBe('Database Management Systems');
    expect(csRes.body.data.mcqs.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/interview/start & /api/v1/interview/history - mock interview session', async () => {
    const startRes = await request(app)
      .post('/api/v1/interview/start')
      .set('X-User-Id', testUserId)
      .send({ role: 'SDE', difficulty: 'medium' });

    expect(startRes.status).toBe(201);
    expect(startRes.body.data).toHaveProperty('interviewId');
    expect(startRes.body.data).toHaveProperty('firstQuestion');

    const historyRes = await request(app)
      .get('/api/v1/interview/history')
      .set('X-User-Id', testUserId);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.data.history.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/companies - company tracks with disclaimers', async () => {
    const compRes = await request(app)
      .get('/api/v1/companies')
      .set('X-User-Id', testUserId);

    expect(compRes.status).toBe(200);
    expect(compRes.body.data.companies.length).toBe(6);
    expect(compRes.body.data.companies[0]).toHaveProperty('source');
    expect(compRes.body.data.companies[0]).toHaveProperty('disclaimer');
  });

  it('GET /api/v1/daily - deterministic daily challenge', async () => {
    const dailyRes = await request(app)
      .get('/api/v1/daily')
      .set('X-User-Id', testUserId);

    expect(dailyRes.status).toBe(200);
    expect(dailyRes.body.data.items).toHaveProperty('aptitude');
    expect(dailyRes.body.data.items).toHaveProperty('dsa');
    expect(dailyRes.body.data.items).toHaveProperty('csMCQs');
    expect(dailyRes.body.data.items).toHaveProperty('interviewQuestion');
  });

  it('GET /api/v1/readiness & GET /api/v1/progress - readiness score & gamification status', async () => {
    const readinessRes = await request(app)
      .get('/api/v1/readiness')
      .set('X-User-Id', testUserId);

    expect(readinessRes.status).toBe(200);
    expect(readinessRes.body.data).toHaveProperty('readinessScore');
    expect(readinessRes.body.data).toHaveProperty('disclaimer');

    const progRes = await request(app)
      .get('/api/v1/progress')
      .set('X-User-Id', testUserId);

    expect(progRes.status).toBe(200);
    expect(progRes.body.data).toHaveProperty('xp');
    expect(progRes.body.data).toHaveProperty('level');
  });
});
