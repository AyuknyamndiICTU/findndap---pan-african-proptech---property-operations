export interface Building {
  id: string;
  name: string;
  cadastreNumber: string; // Titre Foncier #
  city: string;
  neighborhood: string;
  propertyType: 'Residential Complex' | 'Commercial' | 'Mixed Use' | 'Student Residence';
  totalUnits: number;
  availableUnits: number;
  monthlyRevenueXAF: number;
  occupancyRate: number;
  photoUrl: string;
  amenities: string[];
  registeredBy: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Unit {
  id: string;
  buildingId: string;
  unitNumber: string;
  type: string; // e.g. "2 Bedroom Modern", "Studio Deluxe"
  rentAmountXAF: number;
  status: 'Available' | 'Occupied' | 'Under Maintenance';
  tenantName?: string;
  tenantPhone?: string;
  balanceDueXAF?: number;
  lastPaymentDate?: string;
}

export interface AgentKYC {
  fullName: string;
  agencyName: string;
  licenseId: string;
  city: string;
  momoNumber: string;
  documentName?: string;
  isCertified: boolean;
  status: 'unverified' | 'in-review' | 'certified';
  badgeId?: string;
  submittedAt?: string;
}

export interface MaintenanceTicket {
  id: string;
  buildingName: string;
  unitNumber: string;
  tenantName: string;
  category: 'Plumbing' | 'Electrical' | 'Generator' | 'Security' | 'Masonry';
  description: string;
  status: 'Logged' | 'In-Review' | 'Dispatched' | 'Resolved';
  reportedDate: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  assignedVendor?: string;
  costXAF?: number;
  photoUrl?: string;
}

export interface FinancialRecord {
  id: string;
  tenantName: string;
  buildingName: string;
  unitNumber: string;
  amountXAF: number;
  method: 'MTN MoMo' | 'Orange Money';
  date: string;
  status: 'Completed' | 'Escrow_Locked' | 'Arrears';
  txRef: string;
}

export interface BulkSmsNotice {
  id: string;
  title: string;
  message: string;
  target: string;
  recipientCount: number;
  sentAt: string;
}

export interface DashboardStats {
  totalBuildings: number;
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  underMaintenanceUnits: number;
  occupancyRate: number; // percentage, e.g. 87.5
  totalMonthlyRevenueXAF: number;
  collectedRevenueXAF: number;
  pendingArrearsXAF: number;
  collectionRatePercent: number; // percentage, e.g. 91.2
  collectedUnitsCount: number;
  pendingArrearsUnitsCount: number;
  activeTicketsCount: number;
  resolvedTicketsCount: number;
  certifiedAgentsCount: number;
  recentTransactionsCount: number;
  lastUpdated: string;
}

export interface MobileConfig {
  appName: string;
  version: string;
  environment: string;
  currency: string;
  momoGatewayStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  orangeMoneyGatewayStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  endpoints: {
    stats: string;
    buildings: string;
    units: string;
    transactions: string;
    tickets: string;
    sms: string;
    agentKYC: string;
    momoWebhook: string;
  };
}
