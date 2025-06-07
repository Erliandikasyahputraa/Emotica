import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  analyzeText,
  getAnalysisHistory,
  getAnalysisStats,
} from '../controllers/analysisController.js';

const router = express.Router();

router.use(protect);

router.post('/analyze', analyzeText);
router.get('/history', getAnalysisHistory);
router.get('/stats', getAnalysisStats);

export default router;
