import { Building, Unit } from '../types';

export interface SmsAudience {
  id: string;
  label: string;
  recipients: Unit[];
}

/**
 * Bulk SMS audiences derived from live portfolio data. Shared by the server (to
 * compute real recipient counts) and the console (to label the audience picker).
 * Only tenants with a phone number on file are reachable.
 */
export function listSmsAudiences(buildings: Building[], units: Unit[]): SmsAudience[] {
  const reachable = units.filter((u) => !!u.tenantPhone);
  return [
    { id: 'all', label: 'All Building Tenants', recipients: reachable },
    ...buildings.map((b) => ({
      id: `building:${b.id}`,
      label: b.name,
      recipients: reachable.filter((u) => u.buildingId === b.id)
    })),
    {
      id: 'arrears',
      label: 'Tenants in Arrears',
      recipients: reachable.filter((u) => (u.balanceDueXAF || 0) > 0)
    }
  ];
}

/** Accepts an audience id (e.g. "all", "arrears", "building:bld-001") or its label. */
export function resolveSmsAudience(
  target: string,
  buildings: Building[],
  units: Unit[]
): SmsAudience | undefined {
  const key = target.trim().toLowerCase();
  return listSmsAudiences(buildings, units).find(
    (a) => a.id.toLowerCase() === key || a.label.toLowerCase() === key
  );
}
