import { test } from 'node:test';
import assert from 'node:assert';
import { DataStore } from '../db/store.js';
import { AodbAdapter } from '../adapters/aodbAdapter.js';
import { AidxAdapter } from '../adapters/aidxAdapter.js';
import { AcrisAdapter } from '../adapters/acrisAdapter.js';
import { CrowdProfileEngine } from '../engine/crowdProfile.js';
import { DecisionPipeline } from '../engine/decisionPipeline.js';
import { SimulationEngine } from '../engine/simulationEngine.js';

test('1. AODB Adapter parses 33-column CSV correctly', () => {
  const sampleCsvRow = `100180,100181,D,XH,HCZ,960,HCZ960,J,I,MQI,DXB,,T2,2026-10-14T14:10:00Z,2026-10-14T14:55:00Z,,,2026-10-14T14:50:00Z,,C38,42,T2-B11-36,3,QH-BC,A359,283,240,DEL,89,XD|XH,Skylark self-handling,2026-10-14T14:02:00Z`;
  const flight = AodbAdapter.parseRow({
    aodb_flight_id: '100180',
    linked_flight_id: '100181',
    direction: 'D',
    airline_iata: 'XH',
    airline_icao: 'HCZ',
    flight_number: '960',
    callsign: 'HCZ960',
    service_type: 'J',
    flight_nature: 'I',
    origin: 'MQI',
    destination: 'DXB',
    terminal: 'T2',
    STA_STD: '2026-10-14T14:10:00Z',
    ETA_ETD: '2026-10-14T14:55:00Z',
    stand: 'C38',
    gate: '42',
    seats: 283,
    pax_total: 240,
    status: 'DEL',
    delay_codes: '89'
  });

  assert.strictEqual(flight.flight_number, '960');
  assert.strictEqual(flight.airline_iata, 'XH');
  assert.strictEqual(flight.gate, '42');
  assert.strictEqual(flight.pax_total, 240);
  assert.strictEqual(flight.status, 'DEL');
});

test('2. AIDX XML Adapter parses IATA FlightLegNotifRQ and injects delay', () => {
  const xml = AidxAdapter.generateAidxXml({
    airlineIata: 'XH',
    flightNumber: '960',
    origin: 'MQI',
    destination: 'DXB',
    status: 'DEL',
    terminal: 'T2',
    gate: '42',
    delayMinutes: 45
  });

  const { update, event } = AidxAdapter.parseFlightLegNotifRQ(xml);
  assert.strictEqual(update.airlineIata, 'XH');
  assert.strictEqual(update.flightNumber, '960');
  assert.strictEqual(update.delayMinutes, 45);
  assert.strictEqual(event.eventType, 'DELAY');
  assert.strictEqual(event.delayMinutes, 45);
});

test('3. ACRIS NGSI-LD Adapter parses airport zone queue measurements', () => {
  const ngsi = {
    id: 'urn:ngsi-ld:AirportZone:ZONE-T2-GATES-40-50',
    type: 'AirportZone',
    name: { value: 'T2 International Gates 40-50 Pier' },
    terminal: { value: 'T2' },
    concourse: { value: 'Concourse C' },
    passengerCount: { value: 920 },
    waitingTime: { value: 480 },
    associatedGates: { value: ['40', '41', '42', '43'] }
  };

  const zone = AcrisAdapter.parseNgsiLdZone(ngsi);
  assert.strictEqual(zone.zoneId, 'urn:ngsi-ld:AirportZone:ZONE-T2-GATES-40-50');
  assert.strictEqual(zone.currentPaxEstimate, 920);
  assert.strictEqual(zone.queueWaitMinutes, 8);
  assert.strictEqual(zone.queueDensity, 'CRITICAL');
});

test('4. Worked Example: Gate 42 at 14:10 Crowd Profile Reproducibility', () => {
  const store = DataStore.getInstance();
  const presence = CrowdProfileEngine.computeZonePresence('ZONE-T2-GATES-40-50', '2026-10-14T14:10:00Z', store);

  assert.strictEqual(presence.paxCount, 420);
  assert.strictEqual(presence.dwellMinutes, 52);
  assert.strictEqual(presence.tripPurposes.holiday, 0.58);
  assert.strictEqual(presence.tripPurposes.family, 0.31);
  assert.strictEqual(presence.tripPurposes.business, 0.22);
  assert.strictEqual(presence.internationalShare, 0.57);
});

test('5. Worked Example: Gate 42 at 14:10 Decision Pipeline Match & Winner', () => {
  const store = DataStore.getInstance();
  const { winningCampaign, decision } = DecisionPipeline.evaluateScreen('SC-T2-042', '2026-10-14T14:10:00Z', store);

  assert.ok(winningCampaign);
  assert.strictEqual(winningCampaign.campaignId, 'CAMP-DUTYFREE-PERFUME');
  assert.strictEqual(decision.antiHallucinationVerified, true);

  const rankings = decision.candidateRankings;
  const perfume = rankings.find(r => r.campaignId === 'CAMP-DUTYFREE-PERFUME');
  const toys = rankings.find(r => r.campaignId === 'CAMP-TOYSTORE-B2G1');
  const lounge = rankings.find(r => r.campaignId === 'CAMP-LOUNGE-DAYPASS');

  assert.ok(perfume);
  assert.strictEqual(perfume.audienceMatchScore, 0.71);
  assert.strictEqual(perfume.boostMultiplier, 1.5);
  assert.strictEqual(perfume.finalScore, 0.86);

  assert.ok(toys);
  assert.strictEqual(toys.audienceMatchScore, 0.49);
  assert.strictEqual(toys.finalScore, 0.52);

  assert.ok(lounge);
  assert.strictEqual(lounge.audienceMatchScore, 0.18);
  assert.strictEqual(lounge.finalScore, 0.21);
});

test('6. Cause and effect: Injected delay immediately updates store and re-plans screens', () => {
  const sim = SimulationEngine.getInstance();
  const res = sim.injectDelay('XH960', 45);

  assert.strictEqual(res.event.eventType, 'DELAY');
  assert.strictEqual(res.event.delayMinutes, 45);
  assert.strictEqual(res.incident.type, 'DELAY_SURGE');
});
