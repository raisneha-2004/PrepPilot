import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NotFoundError } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

let cachedCompanies = null;
let cachedDSA = null;
let cachedInterview = null;

async function loadCompanyData() {
  if (!cachedCompanies) {
    const compRaw = await fs.readFile(path.join(DATA_DIR, 'seedCompanies.json'), 'utf-8');
    const dsaRaw = await fs.readFile(path.join(DATA_DIR, 'seedDSA.json'), 'utf-8');
    const intRaw = await fs.readFile(path.join(DATA_DIR, 'seedInterview.json'), 'utf-8');
    cachedCompanies = JSON.parse(compRaw);
    cachedDSA = JSON.parse(dsaRaw);
    cachedInterview = JSON.parse(intRaw);
  }
  return { companies: cachedCompanies, dsa: cachedDSA, interview: cachedInterview };
}

export class CompanyService {
  static async getAllCompanies() {
    const { companies } = await loadCompanyData();
    return companies.map((c) => ({
      id: c.id,
      name: c.name,
      tier: c.tier,
      source: c.source,
      lastVerified: c.lastVerified,
      disclaimer: c.disclaimer,
      roundsCount: c.pattern.rounds,
      recommendedTopics: c.recommendedTopics
    }));
  }

  static async getCompanyById(companyId) {
    const { companies, dsa, interview } = await loadCompanyData();
    const company = companies.find(
      (c) => c.id.toLowerCase() === companyId.toLowerCase() || c.name.toLowerCase() === companyId.toLowerCase()
    );

    if (!company) {
      throw new NotFoundError(`Company '${companyId}' not found. Available companies: ${companies.map((c) => c.id).join(', ')}`);
    }

    // Match recommended DSA problems
    const matchedDSA = dsa
      .filter((p) => company.recommendedTopics.some((t) => t.toLowerCase() === p.topic.toLowerCase()))
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        topic: p.topic
      }));

    // Match sample interview questions
    const matchedInterview = interview.slice(0, 4).map((i) => ({
      id: i.id,
      category: i.category,
      question: i.question
    }));

    return {
      id: company.id,
      name: company.name,
      tier: company.tier,
      source: company.source,
      lastVerified: company.lastVerified,
      disclaimer: company.disclaimer,
      hiringProcess: company.hiringProcess,
      pattern: company.pattern,
      recommendedTopics: company.recommendedTopics,
      preparationResources: {
        recommendedDSAProblems: matchedDSA,
        sampleInterviewQuestions: matchedInterview
      }
    };
  }
}
