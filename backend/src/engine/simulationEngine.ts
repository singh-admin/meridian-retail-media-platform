import { DataStore } from '../db/store.js';
import { AidxAdapter } from '../adapters/aidxAdapter.js';
import { DecisionPipeline } from './decisionPipeline.js';
import { FlightEvent, IncidentAlert } from '../models/types.js';

export class SimulationEngine {
  private static instance: SimulationEngine;
  private store: DataStore;

  private simulatedTime: Date = new Date('2026-10-14T14:00:00Z');
  private isPlaying: boolean = true;
  private speed: number = 1; // 1x, 10x, 60x
  private timer: NodeJS.Timeout | null = null;
  private tickIntervalMs: number = 1000;
  private lastSlotEvalTimestamp: number = 0;

  private constructor() {
    this.store = DataStore.getInstance();
    this.start();
  }

  public static getInstance(): SimulationEngine {
    if (!SimulationEngine.instance) {
      SimulationEngine.instance = new SimulationEngine();
    }
    return SimulationEngine.instance;
  }

  public start(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), this.tickIntervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private tick(): void {
    if (!this.isPlaying) return;

    // Advance simulated time by (speed * 1000) ms
    const prevTime = this.simulatedTime.getTime();
    this.simulatedTime = new Date(prevTime + this.speed * 1000);

    // Notify simulation clock update
    this.store.notify('SIMULATION_TICK', {
      simulatedTime: this.simulatedTime.toISOString(),
      isPlaying: this.isPlaying,
      speed: this.speed
    });

    // Re-evaluate screens every 15 simulated seconds
    if (prevTime - this.lastSlotEvalTimestamp >= 15000 / Math.max(1, this.speed / 10)) {
      this.lastSlotEvalTimestamp = prevTime;
      this.evaluateActiveScreens();
    }
  }

  public evaluateActiveScreens(): void {
    const timeIso = this.simulatedTime.toISOString();
    // Prioritize key screens: Gate 42 and sample screens
    const keyScreens = ['SC-T2-042', 'SC-T2-043', 'SC-T1-001', 'SC-T1-002'];
    for (const screenId of keyScreens) {
      DecisionPipeline.evaluateScreen(screenId, timeIso, this.store);
    }
  }

  public setPlaying(playing: boolean): void {
    this.isPlaying = playing;
    this.store.notify('SIMULATION_STATE_CHANGED', this.getState());
  }

  public setSpeed(speed: number): void {
    this.speed = Math.max(1, Math.min(60, speed));
    this.store.notify('SIMULATION_STATE_CHANGED', this.getState());
  }

  public setSimulatedTime(isoTime: string): void {
    const parsed = new Date(isoTime);
    if (!isNaN(parsed.getTime())) {
      this.simulatedTime = parsed;
      this.evaluateActiveScreens();
      this.store.notify('SIMULATION_STATE_CHANGED', this.getState());
    }
  }

  public getState(): { simulatedTime: string; isPlaying: boolean; speed: number } {
    return {
      simulatedTime: this.simulatedTime.toISOString(),
      isPlaying: this.isPlaying,
      speed: this.speed
    };
  }

  // --- WOW Event Injectors (<2s Live Cause & Effect) ---

  /**
   * Injects an AIDX flight delay event.
   * Immediately updates:
   * 1. Flight operational status to DEL (+delayMinutes)
   * 2. Raises incident alert for dispatch
   * 3. Re-plans catchment gate screens in < 2 seconds
   * 4. Triggers retailer delay rule & spikes dwell time
   */
  public injectDelay(flightNumber: string = 'XH960', delayMinutes: number = 45): {
    event: FlightEvent;
    incident: IncidentAlert;
    simulatedTime: string;
  } {
    const flights = this.store.getFlights();
    const flight = flights.find(f => f.flight_number === flightNumber || `${f.airline_iata}${f.flight_number}` === flightNumber) || flights[0];

    const xml = AidxAdapter.generateAidxXml({
      airlineIata: flight.airline_iata,
      flightNumber: flight.flight_number,
      origin: flight.origin,
      destination: flight.destination,
      status: 'DEL',
      terminal: flight.terminal,
      gate: flight.gate,
      delayMinutes
    });

    const { event } = AidxAdapter.parseFlightLegNotifRQ(xml);

    // Update flight in store
    const origEta = new Date(flight.STA_STD).getTime();
    const delayedEta = new Date(origEta + delayMinutes * 60 * 1000).toISOString();
    this.store.updateFlight(flight.aodb_flight_id, {
      status: 'DEL',
      ETA_ETD: delayedEta,
      delay_codes: '89'
    });

    // Record AIDX feed heartbeat
    this.store.recordFeedHeartbeat('AIDX', 'HEALTHY');

    // Auto-raise incident alert
    const incident: IncidentAlert = {
      incidentId: `INC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: this.simulatedTime.toISOString(),
      type: 'DELAY_SURGE',
      severity: 'HIGH',
      targetEntityId: `${flight.airline_iata}${flight.flight_number}`,
      targetEntityType: 'GATE',
      title: `AIDX Inbound Weather Delay (+${delayMinutes}m) - Gate ${flight.gate}`,
      description: `Flight ${flight.airline_iata}${flight.flight_number} to ${flight.destination} delayed. Dwell surged to +${delayMinutes} min. Gate screens re-targeted.`,
      owner: 'Airport Operations Control',
      status: 'OPEN'
    };
    this.store.addIncident(incident);

    // Re-plan gate screens immediately (< 2 seconds cause & effect)
    this.evaluateActiveScreens();

    this.store.notify('CAUSE_AND_EFFECT_TRIGGERED', {
      eventType: 'DELAY_INJECTED',
      flightNumber: `${flight.airline_iata}${flight.flight_number}`,
      delayMinutes,
      gate: flight.gate,
      terminal: flight.terminal,
      simulatedTime: this.simulatedTime.toISOString()
    });

    return { event, incident, simulatedTime: this.simulatedTime.toISOString() };
  }

  /**
   * Injects an AIDX Gate Change
   */
  public injectGateChange(flightNumber: string = 'SKJ862', newGate: string = '42'): {
    flightNumber: string;
    newGate: string;
    simulatedTime: string;
  } {
    const flights = this.store.getFlights();
    const flight = flights.find(f => f.flight_number === flightNumber || `${f.airline_iata}${f.flight_number}` === flightNumber) || flights[1];

    this.store.updateFlight(flight.aodb_flight_id, {
      gate: newGate
    });

    this.store.recordFeedHeartbeat('AIDX', 'HEALTHY');

    // Auto-raise incident
    this.store.addIncident({
      incidentId: `INC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: this.simulatedTime.toISOString(),
      type: 'FEED_LAG',
      severity: 'MEDIUM',
      targetEntityId: `${flight.airline_iata}${flight.flight_number}`,
      targetEntityType: 'GATE',
      title: `Gate Change re-allocated to Gate ${newGate}`,
      description: `Flight ${flight.airline_iata}${flight.flight_number} assigned to Gate ${newGate}. Dynamic passenger catchment shifted.`,
      owner: 'Ground Dispatch',
      status: 'OPEN'
    });

    this.evaluateActiveScreens();

    this.store.notify('CAUSE_AND_EFFECT_TRIGGERED', {
      eventType: 'GATE_CHANGE_INJECTED',
      flightNumber: `${flight.airline_iata}${flight.flight_number}`,
      newGate,
      simulatedTime: this.simulatedTime.toISOString()
    });

    return { flightNumber: `${flight.airline_iata}${flight.flight_number}`, newGate, simulatedTime: this.simulatedTime.toISOString() };
  }

  /**
   * Injects Screen Offline Failure
   */
  public injectScreenOffline(screenId: string = 'SC-T2-042'): { screenId: string; status: string } {
    this.store.updateScreen(screenId, {
      status: 'OFFLINE'
    });

    this.store.addIncident({
      incidentId: `INC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: this.simulatedTime.toISOString(),
      type: 'SCREEN_OFFLINE',
      severity: 'CRITICAL',
      targetEntityId: screenId,
      targetEntityType: 'SCREEN',
      title: `Screen ${screenId} Hardware Heartbeat Lost`,
      description: `Digital totem ${screenId} at Gate 42 is unresponsive. Emergency fallback triggered.`,
      owner: 'AV & Signage Support',
      status: 'OPEN'
    });

    this.evaluateActiveScreens();

    this.store.notify('CAUSE_AND_EFFECT_TRIGGERED', {
      eventType: 'SCREEN_OFFLINE_INJECTED',
      screenId,
      simulatedTime: this.simulatedTime.toISOString()
    });

    return { screenId, status: 'OFFLINE' };
  }

  /**
   * Resets simulation to initial state
   */
  public reset(): void {
    this.store.seed();
    this.simulatedTime = new Date('2026-10-14T14:00:00Z');
    this.isPlaying = true;
    this.speed = 1;
    this.evaluateActiveScreens();
    this.store.notify('SIMULATION_RESET', this.getState());
  }
}
