import {
  Building,
  Unit,
  FinancialRecord,
  MaintenanceTicket,
  BulkSmsNotice,
  AgentKYC,
  AuthSession,
  AuthUser,
  DashboardStats,
  MobileConfig
} from '../types';

const API_BASE_URL = '';
const SESSION_KEY = 'findndap.session';

/** Thrown when the server responds with a non-2xx status (as opposed to a network failure). */
export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

let session: AuthSession | null = readStoredSession();
let language: 'en' | 'fr' = 'en';
const sessionListeners = new Set<() => void>();

function readStoredSession(): AuthSession | null {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null;
    const parsed = raw ? (JSON.parse(raw) as AuthSession) : null;
    return parsed && parsed.expiresAt > new Date().toISOString() ? parsed : null;
  } catch {
    return null;
  }
}

function setSession(next: AuthSession | null) {
  session = next;
  try {
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage can be unavailable (private mode); the session then lasts for this page only.
  }
  sessionListeners.forEach((fn) => fn());
}

export const authStore = {
  get: () => session,
  /** Notifies when the session changes, including when the server rejects an expired token. */
  subscribe(fn: () => void): () => void {
    sessionListeners.add(fn);
    return () => {
      sessionListeners.delete(fn);
    };
  }
};

/** Server messages (errors and confirmations) come back in this language. */
export function setApiLanguage(lang: 'en' | 'fr') {
  language = lang;
}

function headers(extra?: HeadersInit): Headers {
  const h = new Headers(extra);
  h.set('Accept-Language', language);
  if (session) h.set('Authorization', `Bearer ${session.token}`);
  return h;
}

async function send(path: string, init: RequestInit = {}): Promise<Response> {
  const sentWithSession = !!session;
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: headers(init.headers) });
  // A 401 on an authenticated request means the session expired or was revoked.
  if (res.status === 401 && sentWithSession) setSession(null);
  return res;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await send(path, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || `Request failed (HTTP ${res.status})`, res.status);
  }
  return data as T;
}

/** Fetches a file (with auth) and saves it through the browser's download flow. */
async function downloadFile(path: string, fallbackName: string) {
  const res = await send(path);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.error || `Download failed (HTTP ${res.status})`, res.status);
  }
  const disposition = res.headers.get('Content-Disposition') || '';
  const name = /filename="([^"]+)"/.exec(disposition)?.[1] || fallbackName;
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function jsonBody(method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  };
}

export interface KycDocumentUpload {
  name: string;
  mimeType: string;
  dataBase64: string;
}

/**
 * FindNdap Unified Core API Service
 * Shared contract between Web Dashboard and Mobile Application (React Native / Flutter / Android)
 */
export const api = {
  // 1. Health & Configuration
  getHealth(): Promise<{ status: string; version: string; uptimeSeconds: number }> {
    return request('/api/health');
  },

  getMobileConfig(): Promise<MobileConfig> {
    return request('/api/mobile/config');
  },

  // 2. Real-Time Dynamic Statistics
  getStats(): Promise<DashboardStats> {
    return request('/api/stats');
  },

  // 3. Buildings
  async getBuildings(): Promise<Building[]> {
    const data = await request<{ buildings?: Building[] }>('/api/buildings');
    return data.buildings || [];
  },

  getBuildingById(id: string): Promise<{ building: Building; units: Unit[] }> {
    return request(`/api/buildings/${id}`);
  },

  createBuilding(
    building: Partial<Building>,
    units: Partial<Unit>[]
  ): Promise<{ success: boolean; building: Building; units: Unit[]; stats: DashboardStats }> {
    return request('/api/buildings', jsonBody('POST', { building, units }));
  },

  // 4. Units
  async getUnits(buildingId?: string, status?: string): Promise<Unit[]> {
    const params = new URLSearchParams();
    if (buildingId) params.append('buildingId', buildingId);
    if (status) params.append('status', status);

    const data = await request<{ units?: Unit[] }>(`/api/units?${params.toString()}`);
    return data.units || [];
  },

  updateUnit(
    unitId: string,
    updates: Partial<Unit>
  ): Promise<{ success: boolean; unit: Unit; stats: DashboardStats }> {
    return request(`/api/units/${unitId}`, jsonBody('PATCH', updates));
  },

  // 5. Transactions & MoMo Collection
  async getTransactions(): Promise<FinancialRecord[]> {
    const data = await request<{ transactions?: FinancialRecord[] }>('/api/transactions');
    return data.transactions || [];
  },

  recordTransaction(
    tx: Partial<FinancialRecord>
  ): Promise<{ success: boolean; transaction: FinancialRecord; stats: DashboardStats }> {
    return request('/api/transactions', jsonBody('POST', tx));
  },

  // 6. Maintenance Tickets
  async getTickets(): Promise<MaintenanceTicket[]> {
    const data = await request<{ tickets?: MaintenanceTicket[] }>('/api/tickets');
    return data.tickets || [];
  },

  createTicket(
    ticket: Partial<MaintenanceTicket> & { unitId?: string }
  ): Promise<{ success: boolean; ticket: MaintenanceTicket; stats: DashboardStats }> {
    return request('/api/tickets', jsonBody('POST', ticket));
  },

  updateTicket(
    ticketId: string,
    updates: Partial<MaintenanceTicket>
  ): Promise<{ success: boolean; ticket: MaintenanceTicket; stats: DashboardStats }> {
    return request(`/api/tickets/${ticketId}`, jsonBody('PATCH', updates));
  },

  // 7. Bulk SMS Broadcasts
  async getSmsHistory(): Promise<BulkSmsNotice[]> {
    const data = await request<{ smsNotices?: BulkSmsNotice[] }>('/api/sms');
    return data.smsNotices || [];
  },

  sendBulkSms(
    notice: { title: string; message: string; target: string }
  ): Promise<{ success: boolean; message: string; notice: BulkSmsNotice }> {
    return request('/api/sms', jsonBody('POST', notice));
  },

  // 8. Authentication
  async login(username: string, password: string): Promise<{ user: AuthUser; agentKYC: AgentKYC | null }> {
    const data = await request<AuthSession & { agentKYC: AgentKYC | null }>(
      '/api/auth/login',
      jsonBody('POST', { username, password })
    );
    setSession({ token: data.token, expiresAt: data.expiresAt, user: data.user });
    return { user: data.user, agentKYC: data.agentKYC };
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setSession(null);
    }
  },

  me(): Promise<{ user: AuthUser; agentKYC: AgentKYC | null }> {
    return request('/api/auth/me');
  },

  // 9. Agent certification (agent applies, admin reviews)
  async getAgentKYC(): Promise<AgentKYC> {
    const data = await request<{ agentKYC: AgentKYC }>('/api/agent/kyc');
    return data.agentKYC;
  },

  submitAgentKYC(application: {
    fullName: string;
    agencyName: string;
    licenseId: string;
    city: string;
    momoNumber: string;
    document?: KycDocumentUpload;
  }): Promise<{ success: boolean; message: string; agentKYC: AgentKYC }> {
    return request('/api/agent/kyc', jsonBody('POST', application));
  },

  async listAgentApplications(): Promise<AgentKYC[]> {
    const data = await request<{ agents: AgentKYC[] }>('/api/admin/agents');
    return data.agents;
  },

  reviewAgent(
    userId: string,
    decision: 'approve' | 'reject',
    note?: string
  ): Promise<{ success: boolean; message: string; agent: AgentKYC; stats: DashboardStats }> {
    return request(`/api/admin/agents/${encodeURIComponent(userId)}/review`, jsonBody('POST', { decision, note }));
  },

  downloadAgentDocument(userId: string): Promise<void> {
    return downloadFile(`/api/admin/agents/${encodeURIComponent(userId)}/document`, 'agent-document');
  },

  // 10. Receipts
  downloadReceipt(transactionId: string): Promise<void> {
    return downloadFile(
      `/api/transactions/${encodeURIComponent(transactionId)}/receipt?lang=${language}`,
      'FindNdap-Receipt.pdf'
    );
  },

  // 11. MTN MoMo / Orange Money Payment Simulator (dev-only, admin; the real webhook requires X-Webhook-Secret)
  simulateMoMoWebhook(payload: {
    amount: number;
    payerMsisdn?: string;
    unitReference?: string;
    description?: string;
    tenantName?: string;
    buildingName?: string;
  }): Promise<{ status: string; message: string; transaction: FinancialRecord; stats: DashboardStats }> {
    return request('/api/momo/simulate', jsonBody('POST', payload));
  }
};