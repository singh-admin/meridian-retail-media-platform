import { Flight, FlightEvent } from '../models/types.js';

export interface FlightSource {
  stream(): AsyncIterable<FlightEvent>;
  getFlights(): Promise<Flight[]>;
  injectEvent(event: FlightEvent): void;
}

export class MockAidxFlightSource implements FlightSource {
  private queue: FlightEvent[] = [];
  private listeners: ((event: FlightEvent) => void)[] = [];
  private flightsProvider: () => Promise<Flight[]>;

  constructor(flightsProvider: () => Promise<Flight[]>) {
    this.flightsProvider = flightsProvider;
  }

  async *stream(): AsyncIterable<FlightEvent> {
    while (true) {
      if (this.queue.length > 0) {
        yield this.queue.shift()!;
      } else {
        await new Promise<void>((resolve) => {
          const handler = () => {
            const idx = this.listeners.indexOf(handler);
            if (idx >= 0) this.listeners.splice(idx, 1);
            resolve();
          };
          this.listeners.push(handler);
        });
      }
    }
  }

  injectEvent(event: FlightEvent): void {
    this.queue.push(event);
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  async getFlights(): Promise<Flight[]> {
    return this.flightsProvider();
  }
}

export class VendorApiFlightSource implements FlightSource {
  private flightsProvider: () => Promise<Flight[]>;

  constructor(flightsProvider: () => Promise<Flight[]>) {
    this.flightsProvider = flightsProvider;
  }

  async *stream(): AsyncIterable<FlightEvent> {
    // Stub vendor API stream for external enterprise feeds
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }

  injectEvent(_event: FlightEvent): void {
    // Vendor API stub
  }

  async getFlights(): Promise<Flight[]> {
    return this.flightsProvider();
  }
}

export function createFlightSource(
  type: 'mock-aidx' | 'vendor-api',
  flightsProvider: () => Promise<Flight[]>
): FlightSource {
  if (type === 'vendor-api') {
    return new VendorApiFlightSource(flightsProvider);
  }
  return new MockAidxFlightSource(flightsProvider);
}
