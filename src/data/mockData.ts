import { Building, MaintenanceTicket, FinancialRecord, Unit, AgentKYC } from '../types';

export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'bld-001',
    name: 'Résidence Le Cristal',
    cadastreNumber: 'TF-DLA/2019/94821',
    city: 'Douala',
    neighborhood: 'Bonapriso',
    propertyType: 'Residential Complex',
    totalUnits: 16,
    availableUnits: 0,
    monthlyRevenueXAF: 4800000,
    occupancyRate: 100,
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDf3WEX1sKc9FkcldI6HjJmX-OpbcplXW1r2hLcq1ooldXoYv_YbrawUjuMlsygNKJ0Kf460FFLoDPgYyNzNJgcB8qfmh8Kg2iFgXi-p-N9wITrUznqZyLK1zRjKEV7_n2SHJZb1InsUvMaY9n_8_yjr0pVgGmaQ36VWoOUrlh9AcHwI3UMW3FbqaxZGrF1f8DHIWv8q1TeqykeD7OkAORRN5mDEKWKglZgTrSHp6FT6xPgduydp3esVw',
    amenities: ['Borehole (Forage)', 'Standby Genset', '24/7 Security Guard', 'Solar Inverter', 'Dedicated Parking'],
    registeredBy: 'Béatrice Mengue (Cert. #AG-8492)',
    isVerified: true,
    createdAt: '2025-01-14'
  },
  {
    id: 'bld-002',
    name: 'Les Terrasses d’Akwa',
    cadastreNumber: 'TF-DLA/2021/41203',
    city: 'Douala',
    neighborhood: 'Akwa Commercial',
    propertyType: 'Mixed Use',
    totalUnits: 32,
    availableUnits: 2,
    monthlyRevenueXAF: 9600000,
    occupancyRate: 94,
    photoUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    amenities: ['Fiber Optic', 'Standby Genset', '24/7 Security Guard', 'Underground Reservoir', 'CCTV'],
    registeredBy: 'Étienne Nguemo (Cert. #AG-1092)',
    isVerified: true,
    createdAt: '2025-02-01'
  },
  {
    id: 'bld-003',
    name: 'Bastos Prestige Manor',
    cadastreNumber: 'TF-YDE/2023/11840',
    city: 'Yaoundé',
    neighborhood: 'Bastos Diplomatic',
    propertyType: 'Residential Complex',
    totalUnits: 12,
    availableUnits: 1,
    monthlyRevenueXAF: 4200000,
    occupancyRate: 92,
    photoUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    amenities: ['Borehole (Forage)', 'Swimming Pool', 'Electric Fence', '24/7 Concierge', 'Solar Microgrid'],
    registeredBy: 'Armand Tchounkeu (Cert. #AG-5519)',
    isVerified: true,
    createdAt: '2025-02-18'
  }
];

export const INITIAL_UNITS: Unit[] = [
  {
    id: 'u-101',
    buildingId: 'bld-001',
    unitNumber: 'Apt 101',
    type: '2-Bedroom Luxury Suite',
    rentAmountXAF: 300000,
    status: 'Occupied',
    tenantName: 'Dr. Jean-Marc Bella',
    tenantPhone: '+237 671 22 33 44',
    balanceDueXAF: 0,
    lastPaymentDate: '2025-09-01'
  },
  {
    id: 'u-102',
    buildingId: 'bld-001',
    unitNumber: 'Apt 102',
    type: '3-Bedroom Executive',
    rentAmountXAF: 450000,
    status: 'Occupied',
    tenantName: 'Sophie Ebanda',
    tenantPhone: '+237 699 88 77 66',
    balanceDueXAF: 0,
    lastPaymentDate: '2025-09-02'
  },
  {
    id: 'u-103',
    buildingId: 'bld-001',
    unitNumber: 'Apt 103',
    type: '1-Bedroom Penthouse',
    rentAmountXAF: 220000,
    status: 'Occupied',
    tenantName: 'Alain Kouam',
    tenantPhone: '+237 650 11 22 33',
    balanceDueXAF: 220000, // in arrears
    lastPaymentDate: '2025-08-01'
  },
  {
    id: 'u-201',
    buildingId: 'bld-002',
    unitNumber: 'Suite 204',
    type: 'Modern Studio Deluxe',
    rentAmountXAF: 180000,
    status: 'Available',
    balanceDueXAF: 0
  },
  {
    id: 'u-202',
    buildingId: 'bld-002',
    unitNumber: 'Suite 205',
    type: '2-Bedroom Balcony',
    rentAmountXAF: 280000,
    status: 'Available',
    balanceDueXAF: 0
  }
];

export const INITIAL_TRANSACTIONS: FinancialRecord[] = [
  {
    id: 'tx-001',
    tenantName: 'Dr. Jean-Marc Bella',
    buildingName: 'Résidence Le Cristal',
    unitNumber: 'Apt 101',
    amountXAF: 300000,
    method: 'MTN MoMo',
    date: 'Today, 08:14 AM',
    status: 'Completed',
    txRef: 'MOMO-CMR-9821498'
  },
  {
    id: 'tx-002',
    tenantName: 'Sophie Ebanda',
    buildingName: 'Résidence Le Cristal',
    unitNumber: 'Apt 102',
    amountXAF: 450000,
    method: 'Orange Money',
    date: 'Yesterday, 17:30 PM',
    status: 'Completed',
    txRef: 'OM-CMR-4109823'
  },
  {
    id: 'tx-003',
    tenantName: 'Paul Valery Fosso',
    buildingName: 'Les Terrasses d’Akwa',
    unitNumber: 'Suite 302',
    amountXAF: 320000,
    method: 'MTN MoMo',
    date: '05 Sep 2025',
    status: 'Escrow_Locked',
    txRef: 'ESCROW-9831-MOMO'
  },
  {
    id: 'tx-004',
    tenantName: 'Alain Kouam',
    buildingName: 'Résidence Le Cristal',
    unitNumber: 'Apt 103',
    amountXAF: 220000,
    method: 'MTN MoMo',
    date: 'Overdue (5 days)',
    status: 'Arrears',
    txRef: 'PENDING_REMINDER_SENT'
  }
];

export const INITIAL_TICKETS: MaintenanceTicket[] = [
  {
    id: 'tkt-101',
    buildingName: 'Résidence Le Cristal',
    unitNumber: 'Apt 102',
    tenantName: 'Sophie Ebanda',
    category: 'Plumbing',
    description: 'Borehole booster pump valve pressure drop in master bathroom',
    status: 'In-Review',
    reportedDate: 'Today, 09:20 AM',
    urgency: 'Medium',
    assignedVendor: 'Ets. Plomberie Centrale Douala',
    costXAF: 35000,
    photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'tkt-102',
    buildingName: 'Les Terrasses d’Akwa',
    unitNumber: 'Suite 104',
    tenantName: 'Christian Mbia',
    category: 'Electrical',
    description: 'Automatic transfer switch tripping during ENEO grid transition',
    status: 'Dispatched',
    reportedDate: 'Yesterday',
    urgency: 'High',
    assignedVendor: 'Electro-Services Littoral',
    costXAF: 65000,
    photoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'tkt-103',
    buildingName: 'Bastos Prestige Manor',
    unitNumber: 'Villa 2B',
    tenantName: 'Helene Talla',
    category: 'Security',
    description: 'Digital intercom gate buzzer speaker crackling on visitor call',
    status: 'Resolved',
    reportedDate: '04 Sep 2025',
    urgency: 'Low',
    assignedVendor: 'SafeCam Surveillance Tech',
    costXAF: 20000
  }
];

export const DEFAULT_CERTIFIED_AGENT: AgentKYC = {
  fullName: 'Béatrice Mengue',
  agencyName: 'Yaoundé Realty & Asset Partners',
  licenseId: 'RC/YDE/2021/B/8492',
  city: 'Yaoundé (Centre, Cameroon)',
  momoNumber: '+237 677 44 55 66',
  documentName: 'RCCM_License_Cadastral_2025.pdf',
  isCertified: true,
  status: 'certified',
  badgeId: 'FND-CERT-2025-0849',
  submittedAt: '2025-01-12'
};
