import { profileRepo } from '../repositories/index.js';
import { NotFoundError } from '../utils/errors.js';

export class ProfileService {
  static async getProfile(userId) {
    const profile = await profileRepo.findById(userId);
    if (!profile) {
      return null;
    }
    return profile;
  }

  static async saveProfile(userId, profileData) {
    const existing = await profileRepo.findById(userId);
    const doc = {
      userId,
      targetRole: profileData.targetRole,
      experienceLevel: profileData.experienceLevel,
      placementDate: profileData.placementDate,
      dailyHours: profileData.dailyHours,
      currentSkills: profileData.currentSkills || [],
      targetCompanies: profileData.targetCompanies || [],
      preferredLanguage: profileData.preferredLanguage || 'English',
      onboarded: true,
      updatedAt: new Date().toISOString()
    };

    if (existing) {
      return profileRepo.update(userId, doc);
    } else {
      return profileRepo.create({ id: userId, ...doc });
    }
  }
}
