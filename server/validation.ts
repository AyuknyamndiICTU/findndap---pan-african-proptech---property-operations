import { randomBytes } from 'crypto';
import { Building, Unit, FinancialRecord, MaintenanceTicket } from '../src/types.js';

export const UNIT_STATUSES: Unit['status'][] = ['Available', 'Occupied', 'Under Maintenance'];
export const PROPERTY_TYPES: Building['propertyType'][] = ['Residential Complex', 'Commercial', 'Mixed Use', 'Student Residence'];
export const PAYMENT_METHODS: FinancialRecord['method'][] = ['MTN MoMo', 'Orange Money'];
export const TX_STATUSES: FinancialRecord['status'][] = ['Completed', 'Escrow_Locked', 'Arrears'];
export const TICKET_STATUSES: MaintenanceTicket['status'][] = ['Logged', 'In-Review', 'Dispatched', 'Resolved'];
export const TICKET_CATEGORIES: MaintenanceTicket['category'][] = ['Plumbing', 'Electrical', 'Generator', 'Security', 'Masonry'];
export const TICKET_URGENCIES: MaintenanceTicket['urgency'][] = ['Low', 'Medium', 'High', 'Emergency'];

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isAmount(value: unknown, { allowZero }: { allowZero: boolean }): boolean {
  if (typeof value !== 'number' && typeof value !== 'string') return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  const n = Number(value);
  return Number.isFinite(n) && (allowZero ? n >= 0 : n > 0);
}

export function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

// Cameroon mobile numbers: 9 digits starting with 6, optionally prefixed by country code 237.
export function isCameroonMobile(value: unknown): boolean {
  return typeof value === 'string' && /^(237)?6\d{8}$/.test(value.replace(/\D/g, ''));
}

/** Formats a valid Cameroon mobile number as "+237 6XX XX XX XX". */
export function formatCameroonMobile(value: string): string {
  const d = value.replace(/\D/g, '').replace(/^237/, '');
  return `+237 ${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`;
}

/** Collision-resistant id with a readable prefix, e.g. "tx-3f9a1c0b7e2d". */
export function newId(prefix: string): string {
  return `${prefix}-${randomBytes(6).toString('hex')}`;
}
