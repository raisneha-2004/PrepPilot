import { CompanyService } from '../services/CompanyService.js';
import { sendSuccess } from '../utils/responseEnvelope.js';

export class CompanyController {
  static async getAll(req, res, next) {
    try {
      const companies = await CompanyService.getAllCompanies();
      return sendSuccess(res, { count: companies.length, companies });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const company = await CompanyService.getCompanyById(id);
      return sendSuccess(res, company);
    } catch (err) {
      next(err);
    }
  }
}
