import { Router, Request, Response } from 'express';
import { GenAiAssistant } from '../engine/genAiAssistant.js';
import { DataStore } from '../db/store.js';

export const aiRouter = Router();
const store = DataStore.getInstance();

// 1. GenAI Creative Assistant (Brief -> Template Creative in EN + FR)
aiRouter.post('/generate-creative', async (req: Request, res: Response) => {
  const { brief, audience, discount } = req.body;
  if (!brief) {
    return res.status(400).json({ error: 'Brief is required' });
  }

  try {
    const result = await GenAiAssistant.generateCreative(brief, audience, discount);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate creative', message: error.message });
  }
});

// 2. Smart Recommendation: Best 3 slots for this campaign tomorrow
aiRouter.post('/recommend-slots', (req: Request, res: Response) => {
  const { campaignId } = req.body;
  const recommendations = GenAiAssistant.recommendSlots(campaignId || 'CAMP-DUTYFREE-PERFUME', store);
  res.json({
    campaignId,
    recommendations
  });
});
