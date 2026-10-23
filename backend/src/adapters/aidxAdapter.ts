import { FlightEvent } from '../models/types.js';

export interface AidxFlightUpdate {
  airlineIata: string;
  flightNumber: string;
  departureAirport?: string;
  arrivalAirport?: string;
  publicStatus?: string;
  stand?: string;
  gate?: string;
  terminal?: 'T1' | 'T2';
  estimatedTime?: string;
  actualTime?: string;
  delayMinutes?: number;
  rawXml?: string;
}

export class AidxAdapter {
  /**
   * Safely parses standard IATA AIDX FlightLegNotifRQ XML messages without vulnerable external entities
   */
  static parseFlightLegNotifRQ(xml: string): { update: AidxFlightUpdate; event: FlightEvent } {
    // Safe extraction of key AIDX XML tags
    const airlineMatch = xml.match(/<Airline[^>]*>([^<]+)<\/Airline>/i);
    const flightNumberMatch = xml.match(/<FlightNumber>([^<]+)<\/FlightNumber>/i);
    const depAirportMatch = xml.match(/<DepartureAirport[^>]*>([^<]+)<\/DepartureAirport>/i);
    const arrAirportMatch = xml.match(/<ArrivalAirport[^>]*>([^<]+)<\/ArrivalAirport>/i);
    const statusMatch = xml.match(/<PublicStatus>([^<]+)<\/PublicStatus>/i);
    const standMatch = xml.match(/<AircraftParkingPosition>([^<]+)<\/AircraftParkingPosition>/i);
    const terminalMatch = xml.match(/<AircraftTerminal>([^<]+)<\/AircraftTerminal>/i);
    const gateMatch = xml.match(/<BoardingGate>([^<]+)<\/BoardingGate>/i);

    const airlineIata = (airlineMatch ? airlineMatch[1] : 'XH').trim();
    const flightNumber = (flightNumberMatch ? flightNumberMatch[1] : '960').trim();
    const departureAirport = depAirportMatch ? depAirportMatch[1].trim() : undefined;
    const arrivalAirport = arrAirportMatch ? arrAirportMatch[1].trim() : undefined;
    const publicStatus = statusMatch ? statusMatch[1].trim() : 'ARR';
    const stand = standMatch ? standMatch[1].trim() : undefined;
    const terminal = (terminalMatch && terminalMatch[1].trim() === 'T1' ? 'T1' : 'T2') as 'T1' | 'T2';
    const gate = gateMatch ? gateMatch[1].trim() : undefined;

    // Check for delay indicator
    let delayMinutes = 0;
    const delayMatch = xml.match(/<DelayMinutes>(\d+)<\/DelayMinutes>/i);
    if (delayMatch) {
      delayMinutes = parseInt(delayMatch[1], 10);
    } else if (publicStatus.toUpperCase() === 'DEL') {
      delayMinutes = 45;
    }

    const update: AidxFlightUpdate = {
      airlineIata,
      flightNumber,
      departureAirport,
      arrivalAirport,
      publicStatus,
      stand,
      gate,
      terminal,
      delayMinutes,
      rawXml: xml
    };

    const event: FlightEvent = {
      eventId: `AIDX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      source: 'AIDX',
      timestamp: new Date().toISOString(),
      flightId: `${airlineIata}${flightNumber}`,
      flightNumber: `${airlineIata}${flightNumber}`,
      airlineIata,
      eventType: delayMinutes > 0 ? 'DELAY' : gate ? 'GATE_CHANGE' : 'STATUS_CHANGE',
      oldValue: 'SCH',
      newValue: publicStatus,
      delayMinutes,
      reason: delayMinutes > 0 ? `AIDX Notif: Inbound weather/turnaround delay (+${delayMinutes}m)` : `AIDX Notif: Status updated to ${publicStatus}`
    };

    return { update, event };
  }

  /**
   * Generates a compliant IATA AIDX XML payload for test or simulation events
   */
  static generateAidxXml(params: {
    airlineIata: string;
    flightNumber: string;
    origin: string;
    destination: string;
    status: string;
    terminal: string;
    gate?: string;
    delayMinutes?: number;
  }): string {
    const timestamp = new Date().toISOString();
    return `<?xml version="1.0" encoding="UTF-8"?>
<IATA_AIDX_FlightLegNotifRQ xmlns="http://www.iata.org/IATA/2007/00" Version="16.1" Target="Production" TimeStamp="${timestamp}">
  <Originator CompanyShortName="MQI" Code="MQI" />
  <FlightLeg>
    <LegIdentifier>
      <Airline>${params.airlineIata}</Airline>
      <FlightNumber>${params.flightNumber}</FlightNumber>
      <DepartureAirport>${params.origin}</DepartureAirport>
      <ArrivalAirport>${params.destination}</ArrivalAirport>
      <OriginDate>${timestamp.split('T')[0]}</OriginDate>
    </LegIdentifier>
    <LegData>
      <PublicStatus>${params.status}</PublicStatus>
      <AirportResources>
        <Resource>
          <AircraftTerminal>${params.terminal}</AircraftTerminal>
          ${params.gate ? `<BoardingGate>${params.gate}</BoardingGate>` : ''}
        </Resource>
      </AirportResources>
      ${params.delayMinutes ? `<DelayMinutes>${params.delayMinutes}</DelayMinutes>` : ''}
    </LegData>
  </FlightLeg>
</IATA_AIDX_FlightLegNotifRQ>`;
  }
}
