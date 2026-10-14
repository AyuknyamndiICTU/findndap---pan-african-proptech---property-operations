import {
  Building,
  Unit,
  FinancialRecord,
  MaintenanceTicket,
  BulkSmsNotice,
  AgentKYC,
  DashboardStats,
  MobileConfig
} from '../types';

const API_BASE_URL = '';

/**
 * FindNdap Unified Core API Service
 * Shared contract between Web Dashboard and Mobile Application (React Native / Flutter / Android)
 */
export const api = {
  // 1. Health & Configuration
  async getHealth(): Promise<{ status: string; version: string; uptimeSeconds: number }> {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return res.json();
  },

  async getMobileConfig(): Promise<MobileConfig> {
    const res = await fetch(`${API_BASE_URL}/api/mobile/config`);
    return res.json();
  },

  // 2. Real-Time Dynamic Statistics
  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE_URL}/api/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // 3. Buildings
  async getBuildings(): Promise<Building[]> {
    const res = await fetch(`${API_BASE_URL}/api/buildings`);
    const data = await res.json();
    return data.buildings || [];
  },

  async getBuildingById(id: string): Promise<{ building: Building; units: Unit[] }> {
    const res = await fetch(`${API_BASE_URL}/api/buildings/${id}`);
    return res.json();
  },

  async createBuilding(
    building: Partial<Building>,
    units: Partial<Unit>[]
  ): Promise<{ success: boolean; building: Building; stats: DashboardStats }> {
    const res = await fetch(`${API_BASE_URL}/api/buildings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ building, units })
    });
    return res.json();
  },

  // 4. Units
  async getUnits(buildingId?: string, status?: string): Promise<Unit[]> {
    const params = new URLSearchParams();
    if (buildingId) params.append('buildingId', buildingId);
    if (status) params.append('status', status);

    const res = await fetch(`${API_BASE_URL}/api/units?${params.toString()}`);
    const data = await res.json();
    return data.units || [];
  },

  async updateUnit(
    unitId: string,
    updates: Partial<Unit>
  ): Promise<{ success: boolean; unit: Unit; stats: DashboardStats }> {
    const res = await fetch(`${API_BASE_URL}/api/units/${unitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // 5. Transactions & MoMo Collection
  async getTransactions(): Promise<FinancialRecord[]> {
    const res = await fetch(`${API_BASE_URL}/api/transactions`);
    const data = await res.json();
    return data.transactions || [];
  },

  async recordTransaction(
    tx: Partial<FinancialRecord>
  ): Promise<{ success: boolean; transaction: FinancialRecord; stats: DashboardStats }> {
    const res = await fetch(`${API_BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    });
    return res.json();
  },

  // 6. Maintenance Tickets
  async getTickets(): Promise<MaintenanceTicket[]> {
    const res = await fetch(`${API_BASE_URL}/api/tickets`);
    const data = await res.json();
    return data.tickets || [];
  },

  async createTicket(
    ticket: Partial<MaintenanceTicket>
  ): Promise<{ success: boolean; ticket: MaintenanceTicket; stats: DashboardStats }> {
    const res = await fetch(`${API_BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket)
    });
    return res.json();
  },

  async updateTicket(
    ticketId: string,
    updates: Partial<MaintenanceTicket>
  ): Promise<{ success: boolean; ticket: MaintenanceTicket; stats: DashboardStats }> {
    const res = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // 7. Bulk SMS Broadcasts
  async getSmsHistory(): Promise<BulkSmsNotice[]> {
    const res = await fetch(`${API_BASE_URL}/api/sms`);
    const data = await res.json();
    return data.smsNotices || [];
  },

  async sendBulkSms(
    notice: { title: string; message: string; target: string }
  ): Promise<{ success: boolean; notice: BulkSmsNotice }> {
    const res = await fetch(`${API_BASE_URL}/api/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notice)
    });
    return res.json();
  },

  // 8. Agent KYC & Accreditation
  async getAgentKYC(): Promise<AgentKYC> {
    const res = await fetch(`${API_BASE_URL}/api/agent/kyc`);
    const data = await res.json();
    return data.agentKYC;
  },

  async submitAgentKYC(
    kyc: Partial<AgentKYC>
  ): Promise<{ success: boolean; agentKYC: AgentKYC; stats: DashboardStats }> {
    const res = await fetch(`${API_BASE_URL}/api/agent/kyc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kyc)
    });
    return res.json();
  },

  async toggleAgentDemoMode(): Promise<{ success: boolean; agentKYC: AgentKYC; stats: DashboardStats }> {
    const res = await fetch(`${API_BASE_URL}/api/agent/toggle-demo`, {
      method: 'POST'
    });
    return res.json();
  },

  // 9. MTN MoMo / Orange Money Payment Simulator (dev-only; the real webhook requires X-Webhook-Secret)
  async simulateMoMoWebhook(payload: {
    amount: number;
    payerMsisdn?: string;
    unitReference?: string;
    description?: string;
    tenantName?: string;
    buildingName?: string;
  }): Promise<{ status: string; message: string; transaction: FinancialRecord; stats: DashboardStats }> {
    const res = await fetch(`${API_BASE_URL}/api/momo/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Payment simulation failed (HTTP ${res.status})`);
    }
    return res.json();
  }
};
