import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LandlordWorkflowSection } from './components/LandlordWorkflowSection';
import { AgentCertificationSection, AgentApplication } from './components/AgentCertificationSection';
import { DeveloperSandboxSection } from './components/DeveloperSandboxSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CallToActionSection } from './components/CallToActionSection';
import { Footer } from './components/Footer';
import { BuildingRegistrationModal } from './components/BuildingRegistrationModal';
import { LandlordConsoleModal, ConsoleTab, NewTicketInput } from './components/LandlordConsoleModal';
import { LoginModal } from './components/LoginModal';
import { CursorGlowFollower } from './components/CursorGlowFollower';
import { FuturisticHudDock } from './components/FuturisticHudDock';

import { Building, Unit, FinancialRecord, MaintenanceTicket, AgentKYC, AuthUser, DashboardStats } from './types';
import { api, ApiError, authStore } from './services/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useI18n } from './i18n/LanguageContext';

type Toast = { kind: 'success' | 'error'; text: string };

export default function App() {
  const { t, locale } = useI18n();
  // Stable access to the current translator from memoised callbacks (avoids refetching data on language change).
  const tRef = useRef(t);
  tRef.current = t;
  const errorText = (err: unknown) => (err instanceof ApiError ? err.message : t('app.errorUnreachable'));

  // Signed-in account (null = visitor) and, for agents, their certification record
  const [user, setUser] = useState<AuthUser | null>(authStore.get()?.user ?? null);
  const [agentKYC, setAgentKYC] = useState<AgentKYC | null>(null);

  // Portfolio data, always loaded from the server
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [transactions, setTransactions] = useState<FinancialRecord[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Modals State
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isLandlordConsoleOpen, setIsLandlordConsoleOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [consoleDefaultTab, setConsoleDefaultTab] = useState<ConsoleTab>('overview');

  const [toast, setToast] = useState<Toast | null>(null);

  // Futuristic Theme Mode ('dark' by default to showcase the high-tech video aesthetic)
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [activeHeroTab, setActiveHeroTab] = useState<'console' | 'radar'>('console');

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = useCallback((text: string, kind: Toast['kind'] = 'success') => {
    setToast({ kind, text });
    setTimeout(() => setToast((current) => (current?.text === text ? null : current)), 4500);
  }, []);

  // Load live data from API endpoints
  const refreshAllData = useCallback(async () => {
    const [statsData, bldData, unitData, txData, tktData] = await Promise.all([
      api.getStats().catch(() => null),
      api.getBuildings().catch(() => null),
      api.getUnits().catch(() => null),
      api.getTransactions().catch(() => null),
      api.getTickets().catch(() => null)
    ]);

    if (statsData) setStats(statsData);
    if (bldData) setBuildings(bldData);
    if (unitData) setUnits(unitData);
    if (txData) setTransactions(txData);
    if (tktData) setTickets(tktData);
    if (!statsData && !bldData) showToast(tRef.current('app.loadFailed'), 'error');
  }, [showToast]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Restore the session on load, and follow sign-outs (including expired tokens rejected by the server).
  useEffect(() => {
    if (authStore.get()) {
      api
        .me()
        .then(({ user: u, agentKYC: k }) => {
          setUser(u);
          setAgentKYC(k);
        })
        .catch(() => {
          setUser(null);
          setAgentKYC(null);
        });
    }
    return authStore.subscribe(() => {
      const current = authStore.get();
      setUser(current?.user ?? null);
      if (!current) setAgentKYC(null);
    });
  }, []);

  const openLogin = () => setIsLoginOpen(true);

  const handleSignedIn = (u: AuthUser, kyc: AgentKYC | null) => {
    setUser(u);
    setAgentKYC(kyc);
    showToast(t('app.signedInAs', { username: u.username }));
  };

  const handleSignOut = async () => {
    await api.logout().catch(() => {});
    setIsLandlordConsoleOpen(false);
    setIsBuildingModalOpen(false);
    showToast(t('app.signedOut'));
  };

  // Agent submits (or resubmits) a certification application. Resolves to an error message, or null.
  const handleSubmitApplication = async (application: AgentApplication): Promise<string | null> => {
    try {
      const res = await api.submitAgentKYC(application);
      setAgentKYC(res.agentKYC);
      showToast(res.message);
      return null;
    } catch (err) {
      return errorText(err);
    }
  };

  // Add newly registered building + units via API. Resolves to an error message, or null on success.
  const handleAddBuilding = async (newBuilding: Building, newUnits: Unit[]): Promise<string | null> => {
    try {
      const res = await api.createBuilding(newBuilding, newUnits);
      setBuildings((prev) => [res.building, ...prev]);
      setUnits((prev) => [...prev, ...res.units]);
      if (res.stats) setStats(res.stats);
      showToast(t('app.buildingPublished', { name: res.building.name, count: res.units.length }));
      return null;
    } catch (err) {
      return errorText(err);
    }
  };

  // Ticket Status progression via API
  const handleUpdateTicketStatus = async (ticketId: string, nextStatus: MaintenanceTicket['status']) => {
    try {
      const res = await api.updateTicket(ticketId, { status: nextStatus });
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? res.ticket : t)));
      if (res.stats) setStats(res.stats);
      showToast(t('app.ticketStageUpdated', { status: t(`enums.ticketStatus.${nextStatus}`) }));
    } catch (err) {
      showToast(errorText(err), 'error');
    }
  };

  const handleCreateTicket = async (input: NewTicketInput): Promise<string | null> => {
    try {
      const res = await api.createTicket(input);
      setTickets((prev) => [res.ticket, ...prev]);
      if (res.stats) setStats(res.stats);
      showToast(t('app.ticketLogged', { unit: res.ticket.unitNumber }));
      return null;
    } catch (err) {
      return errorText(err);
    }
  };

  // Add payment deposit via API. Resolves to an error message, or null on success.
  const handleAddTransaction = async (record: Partial<FinancialRecord>): Promise<string | null> => {
    try {
      const res = await api.recordTransaction(record);
      setTransactions((prev) => [res.transaction, ...prev]);
      if (res.stats) setStats(res.stats);
      // Refresh units to reflect cleared arrears
      api.getUnits().then(setUnits).catch(() => {});
      showToast(
        t('app.depositRecorded', {
          amount: res.transaction.amountXAF.toLocaleString(locale),
          method: res.transaction.method
        })
      );
      return null;
    } catch (err) {
      return errorText(err);
    }
  };

  // Update a unit (rent, lease, status) via API. Resolves to an error message, or null on success.
  const handleUpdateUnit = async (unitId: string, updates: Partial<Unit>): Promise<string | null> => {
    try {
      const res = await api.updateUnit(unitId, updates);
      setUnits((prev) => prev.map((u) => (u.id === unitId ? res.unit : u)));
      if (res.stats) setStats(res.stats);
      // Building totals are derived from units on the server.
      api.getBuildings().then(setBuildings).catch(() => {});
      if (updates.rentAmountXAF !== undefined) {
        showToast(
          t('app.rentUpdated', { unit: res.unit.unitNumber, amount: res.unit.rentAmountXAF.toLocaleString(locale) })
        );
      } else if (updates.status === 'Occupied') {
        showToast(t('app.unitLeased', { unit: res.unit.unitNumber, tenant: res.unit.tenantName ?? '' }));
      } else {
        showToast(
          t('app.unitStatusChanged', { unit: res.unit.unitNumber, status: t(`enums.unitStatus.${res.unit.status}`) })
        );
      }
      return null;
    } catch (err) {
      return errorText(err);
    }
  };

  const handleOpenLandlordConsole = (tab: ConsoleTab = 'overview') => {
    setConsoleDefaultTab(tab);
    setIsLandlordConsoleOpen(true);
  };

  const scrollToAgentSection = () => {
    const el = document.getElementById('agent-portal');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToCertification = () => {
    setIsBuildingModalOpen(false);
    scrollToAgentSection();
  };

  return (
    <div className={`min-h-screen flex flex-col antialiased selection:bg-[#ff9827] selection:text-white relative transition-colors duration-700 ${
      themeMode === 'dark' ? 'bg-[#050b14] text-white' : 'bg-[#faf8ff] text-[#131b2e]'
    }`}>
      {/* Ambient cursor spotlight tracking user motion */}
      <CursorGlowFollower />

      {/* Fixed Sticky Header */}
      <Navbar
        user={user}
        agentKYC={agentKYC}
        onSignIn={openLogin}
        onSignOut={handleSignOut}
        onOpenBuildingModal={() => setIsBuildingModalOpen(true)}
        onOpenLandlordConsole={() => handleOpenLandlordConsole('overview')}
        onOpenApprovals={() => handleOpenLandlordConsole('agents')}
        onOpenAgentModal={scrollToAgentSection}
      />

      {/* Main Content (Offset for fixed dual-layer navbar) */}
      <main className="flex-1 pt-24 lg:pt-28">
        {/* Toast Alert floating */}
        <div aria-live="polite" role="status" className="contents">
          {toast && (
            <div
              className={`fixed top-28 right-4 z-[70] max-w-md text-white p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-fade-in ${
                toast.kind === 'error' ? 'bg-rose-700' : 'bg-[#002044]'
              }`}
            >
              {toast.kind === 'error' ? (
                <AlertCircle className="w-5 h-5 text-white shrink-0" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#ff9827] shrink-0" aria-hidden="true" />
              )}
              <span className="text-xs font-semibold leading-snug">{toast.text}</span>
            </div>
          )}
        </div>

        {/* Hero Section with Live Dynamically Recomputed Stats & 3D Interactive Console */}
        <HeroSection
          onRegisterAgentClick={scrollToAgentSection}
          onOpenLandlordConsole={() => handleOpenLandlordConsole('overview')}
          stats={stats}
          buildings={buildings}
          transactions={transactions}
          themeMode={themeMode}
          activeTab={activeHeroTab}
          onTabChange={setActiveHeroTab}
        />

        {/* Landlord Workflow: Digital Onboarding, Automated MoMo Collection, SMS Broadcasts, Maintenance Hub */}
        <LandlordWorkflowSection
          onOpenLandlordConsole={handleOpenLandlordConsole}
        />

        {/* Certified Agent Network & KYC Registration */}
        <AgentCertificationSection
          user={user}
          agentKYC={agentKYC}
          onSignIn={openLogin}
          onSubmitApplication={handleSubmitApplication}
          onOpenBuildingModal={() => setIsBuildingModalOpen(true)}
          onOpenApprovals={() => handleOpenLandlordConsole('agents')}
        />

        {/* Developer Hub & Physical Android APK Download Sandbox with Live API Inspector */}
        <DeveloperSandboxSection onDataRefresh={refreshAllData} />

        {/* Testimonials & Security Trust Badges */}
        <TestimonialsSection />

        {/* Bottom CTA Banner */}
        <CallToActionSection
          onRegisterAgentClick={scrollToAgentSection}
          onOpenLandlordConsole={() => handleOpenLandlordConsole('overview')}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenAgentModal={scrollToAgentSection}
        onOpenLandlordConsole={() => handleOpenLandlordConsole('overview')}
      />

      {/* Futuristic Floating HUD Dock (Persistent Cybernetic Controller from Video) */}
      <FuturisticHudDock
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        onOpenAgentModal={scrollToAgentSection}
        onOpenLandlordConsole={() => handleOpenLandlordConsole('overview')}
        activeHeroTab={activeHeroTab}
        onSwitchToConsole={() => setActiveHeroTab('console')}
        onSwitchToRadar={() => setActiveHeroTab('radar')}
      />

      {/* MODAL 1: Certified Agent Building Registration Studio (unmounted when closed so the form resets) */}
      {isBuildingModalOpen && (
        <BuildingRegistrationModal
          isOpen={isBuildingModalOpen}
          onClose={() => setIsBuildingModalOpen(false)}
          user={user}
          agentKYC={agentKYC}
          onAddBuilding={handleAddBuilding}
          onSignIn={openLogin}
          onGoToCertification={goToCertification}
        />
      )}

      {/* MODAL 2: Interactive Landlord Mobile Operations Suite */}
      <LandlordConsoleModal
        isOpen={isLandlordConsoleOpen}
        onClose={() => setIsLandlordConsoleOpen(false)}
        defaultTab={consoleDefaultTab}
        canEdit={user?.role === 'admin'}
        onSignIn={openLogin}
        buildings={buildings}
        units={units}
        transactions={transactions}
        tickets={tickets}
        onUpdateTicketStatus={handleUpdateTicketStatus}
        onCreateTicket={handleCreateTicket}
        onAddTransaction={handleAddTransaction}
        onUpdateUnit={handleUpdateUnit}
        onAgentReviewed={(newStats) => setStats(newStats)}
        onDownloadError={(message) => showToast(message, 'error')}
      />

      {/* MODAL 3: Sign in */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSignedIn={handleSignedIn} />
    </div>
  );
}
