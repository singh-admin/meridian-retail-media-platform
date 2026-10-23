import { Flight, FlightDirection, FlightNature, FlightStatus } from '../models/types.js';

export interface RawAodbRow {
  aodb_flight_id: string;
  linked_flight_id?: string;
  direction: string;
  airline_iata: string;
  airline_icao: string;
  flight_number: string;
  callsign?: string;
  service_type?: string;
  flight_nature: string;
  origin: string;
  destination: string;
  via?: string;
  terminal: string;
  STA_STD: string;
  ETA_ETD?: string;
  ELDT_ETOT?: string;
  ALDT_ATOT?: string;
  AIBT_AOBT?: string;
  TOBT?: string;
  TSAT?: string;
  stand?: string;
  gate?: string;
  checkin_counters?: string;
  baggage_belt?: string;
  aircraft_reg?: string;
  aircraft_type_icao?: string;
  seats?: string | number;
  pax_total?: string | number;
  status: string;
  delay_codes?: string;
  codeshares?: string;
  handler?: string;
  last_update_utc?: string;
}

export class AodbAdapter {
  static parseRow(row: RawAodbRow): Flight {
    const direction: FlightDirection = (row.direction?.toUpperCase() === 'A' ? 'A' : 'D');
    const flightNature: FlightNature = (row.flight_nature?.toUpperCase() === 'I' ? 'I' : 'D');
    const terminal = (row.terminal?.toUpperCase() === 'T2' ? 'T2' : 'T1') as 'T1' | 'T2';
    
    let status: FlightStatus = 'SCH';
    const rawStatus = (row.status || '').toUpperCase().trim();
    if (['ARR', 'DEP', 'CNL', 'DEL', 'BRD', 'GATE', 'AIR'].includes(rawStatus)) {
      status = rawStatus as FlightStatus;
    } else if (rawStatus === 'BOARDING') {
      status = 'BRD';
    } else if (rawStatus === 'DELAYED') {
      status = 'DEL';
    } else {
      status = direction === 'A' ? 'ARR' : 'DEP';
    }

    const seats = typeof row.seats === 'number' ? row.seats : parseInt(String(row.seats || '180'), 10) || 180;
    const pax_total = typeof row.pax_total === 'number' ? row.pax_total : parseInt(String(row.pax_total || '140'), 10) || 140;

    return {
      aodb_flight_id: String(row.aodb_flight_id || ''),
      linked_flight_id: String(row.linked_flight_id || ''),
      direction,
      airline_iata: String(row.airline_iata || '').trim(),
      airline_icao: String(row.airline_icao || '').trim(),
      flight_number: String(row.flight_number || '').trim(),
      callsign: String(row.callsign || `${row.airline_icao}${row.flight_number}`).trim(),
      service_type: String(row.service_type || 'J').trim(),
      flight_nature: flightNature,
      origin: String(row.origin || 'MQI').trim(),
      destination: String(row.destination || 'MQI').trim(),
      via: String(row.via || '').trim(),
      terminal,
      STA_STD: String(row.STA_STD || new Date().toISOString()),
      ETA_ETD: String(row.ETA_ETD || row.STA_STD || new Date().toISOString()),
      ELDT_ETOT: String(row.ELDT_ETOT || ''),
      ALDT_ATOT: String(row.ALDT_ATOT || ''),
      AIBT_AOBT: String(row.AIBT_AOBT || ''),
      TOBT: String(row.TOBT || ''),
      TSAT: String(row.TSAT || ''),
      stand: String(row.stand || 'C1').trim(),
      gate: String(row.gate || 'Gate 1').trim(),
      checkin_counters: String(row.checkin_counters || '').trim(),
      baggage_belt: String(row.baggage_belt || '').trim(),
      aircraft_reg: String(row.aircraft_reg || 'QM-ABC').trim(),
      aircraft_type_icao: String(row.aircraft_type_icao || 'A320').trim(),
      seats,
      pax_total,
      status,
      delay_codes: String(row.delay_codes || '').trim(),
      codeshares: String(row.codeshares || '').trim(),
      handler: String(row.handler || 'Meridian Ground Services').trim(),
      last_update_utc: String(row.last_update_utc || new Date().toISOString())
    };
  }

  static parseCsv(csvText: string): Flight[] {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const flights: Flight[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Basic CSV splitter respecting simple commas
      const cols = line.split(',');
      if (cols.length < headers.length) continue;

      const rawRow: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        rawRow[headers[j]] = cols[j];
      }

      flights.push(AodbAdapter.parseRow(rawRow as unknown as RawAodbRow));
    }

    return flights;
  }
}
