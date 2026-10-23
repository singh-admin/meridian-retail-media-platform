import { Router, Request, Response } from 'express';
import { SimulationEngine } from '../engine/simulationEngine.js';

export const simulationRouter = Router();
const sim = SimulationEngine.getInstance();

// 1. Current Simulation State
simulationRouter.get('/state', (_req: Request, res: Response) => {
  res.json(sim.getState());
});

// 2. Play / Pause
simulationRouter.post('/play', (req: Request, res: Response) => {
  const { playing } = req.body;
  sim.setPlaying(Boolean(playing));
  res.json(sim.getState());
});

// 3. Set Speed (1x, 10x, 60x)
simulationRouter.post('/speed', (req: Request, res: Response) => {
  const { speed } = req.body;
  sim.setSpeed(Number(speed) || 1);
  res.json(sim.getState());
});

// 4. Jump to Time
simulationRouter.post('/jump', (req: Request, res: Response) => {
  const { timeIso } = req.body;
  if (!timeIso) {
    return res.status(400).json({ error: 'timeIso is required' });
  }
  sim.setSimulatedTime(timeIso);
  res.json(sim.getState());
});

// 5. Inject AIDX Delay (+45m on XH960/Gate 42)
simulationRouter.post('/inject/delay', (req: Request, res: Response) => {
  const { flightNumber = 'XH960', delayMinutes = 45 } = req.body;
  const result = sim.injectDelay(flightNumber, delayMinutes);
  res.json({
    success: true,
    message: `AIDX Delay Injected: Flight ${flightNumber} delayed by ${delayMinutes} mins. Gate screens re-targeted.`,
    ...result
  });
});

// 6. Inject AIDX Gate Change
simulationRouter.post('/inject/gate-change', (req: Request, res: Response) => {
  const { flightNumber = 'SKJ862', newGate = '42' } = req.body;
  const result = sim.injectGateChange(flightNumber, newGate);
  res.json({
    success: true,
    message: `AIDX Gate Change Injected: Flight ${flightNumber} reallocated to Gate ${newGate}.`,
    ...result
  });
});

// 7. Inject Screen Offline
simulationRouter.post('/inject/screen-offline', (req: Request, res: Response) => {
  const { screenId = 'SC-T2-042' } = req.body;
  const result = sim.injectScreenOffline(screenId);
  res.json({
    success: true,
    message: `Screen Offline Injected: Screen ${screenId} marked offline and ticket opened.`,
    ...result
  });
});

// 8. Reset Simulation
simulationRouter.post('/reset', (_req: Request, res: Response) => {
  sim.reset();
  res.json({ success: true, state: sim.getState() });
});
