import { Router } from 'express';
import { createLead, getLeadsWithAnalysis } from '../controllers/leadController';
import { validateRequest } from '../middlewares/validateRequest';
import { createLeadSchema } from '../schemas/leadSchema';

const router = Router();

router.post('/', validateRequest(createLeadSchema), createLead);
router.get('/', getLeadsWithAnalysis);

export default router;
