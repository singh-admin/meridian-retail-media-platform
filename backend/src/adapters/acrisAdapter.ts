import { Zone } from '../models/types.js';

export interface AcrisQueueEntity {
  id: string;
  type: 'PassengerQueue' | 'AirportZone' | 'Checkpoint';
  name?: { value: string };
  terminal?: { value: string };
  concourse?: { value: string };
  passengerCount?: { value: number };
  waitingTime?: { value: number }; // seconds
  density?: { value: string };
  associatedGates?: { value: string[] };
}

export class AcrisAdapter {
  static parseNgsiLdZone(entity: Record<string, any>): Zone {
    const zoneId = entity.id || `urn:ngsi-ld:AirportZone:${Math.random().toString(36).substring(7)}`;
    const name = entity.name?.value || entity.name || 'Terminal Zone';
    const terminal = (entity.terminal?.value || entity.terminal || 'T1') === 'T2' ? 'T2' : 'T1';
    const concourse = entity.concourse?.value || entity.concourse || 'Concourse A';
    const currentPaxEstimate = entity.passengerCount?.value || entity.passengerCount || 120;
    const waitSeconds = entity.waitingTime?.value || entity.waitingTime || 300;
    const queueWaitMinutes = Math.round(waitSeconds / 60);
    const gatesNearby = entity.associatedGates?.value || entity.associatedGates || [];

    let queueDensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (queueWaitMinutes > 20 || currentPaxEstimate > 400) {
      queueDensity = 'CRITICAL';
    } else if (queueWaitMinutes > 12 || currentPaxEstimate > 250) {
      queueDensity = 'HIGH';
    } else if (queueWaitMinutes > 6 || currentPaxEstimate > 150) {
      queueDensity = 'MEDIUM';
    }

    return {
      zoneId,
      terminal,
      concourse,
      name,
      type: 'RETAIL_CENTRAL',
      gatesNearby,
      currentPaxEstimate,
      queueWaitMinutes,
      queueDensity
    };
  }

  static toNgsiLd(zone: Zone): Record<string, any> {
    return {
      id: `urn:ngsi-ld:AirportZone:${zone.zoneId}`,
      type: 'AirportZone',
      name: { type: 'Property', value: zone.name },
      terminal: { type: 'Property', value: zone.terminal },
      concourse: { type: 'Property', value: zone.concourse },
      passengerCount: { type: 'Property', value: zone.currentPaxEstimate },
      waitingTime: { type: 'Property', value: zone.queueWaitMinutes * 60 },
      density: { type: 'Property', value: zone.queueDensity },
      associatedGates: { type: 'Property', value: zone.gatesNearby },
      dataProvider: { type: 'Property', value: 'ACI-ACRIS-FIWARE-Adapter' }
    };
  }
}
