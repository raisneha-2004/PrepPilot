import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller.js';

const router = Router();

router.get('/', CompanyController.getAll);
router.get('/:id', CompanyController.getById);

export default router;
