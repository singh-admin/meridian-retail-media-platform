import { createServer } from './server.js';
import { SimulationEngine } from './engine/simulationEngine.js';

const PORT = parseInt(process.env.PORT || '4000', 10);
const { server } = createServer();

// Start Simulation Engine
const sim = SimulationEngine.getInstance();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` Meridian Airport Retail Media Platform API`);
  console.log(` Running on: http://0.0.0.0:${PORT}`);
  console.log(` WebSocket:  Endpoint mounted at /ws`);
  console.log(` Simulation: Active (${sim.getState().simulatedTime})`);
  console.log(`=======================================================`);
});
