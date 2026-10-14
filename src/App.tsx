import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LandlordWorkflowSection } from './components/LandlordWorkflowSection';
import { AgentCertificationSection } from './components/AgentCertificationSection';
import { DeveloperSandboxSection } from './components/DeveloperSandboxSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CallToActionSection } from './components/CallToActionSection';
import { Footer } from './components/Footer';
import { BuildingRegistrationModal } from './components/BuildingRegistrationModal';
import { LandlordConsoleModal } from './components/LandlordConsoleModal';
import { CursorGlowFollower } from './components/CursorGlowFollower';
import { FuturisticHudDock } from './components/FuturisticHudDock';

import {
  INITIAL_BUILDINGS,
  INITIAL_UNITS,
  INITIAL_TRANSACTIONS,
  INITIAL_TICKETS,
  DEFAULT_CERTIFIED_AGENT
} from './data/mockData';

import { Building, Unit, FinancialRecord, MaintenanceTicket, AgentKYC, DashboardStats } from './types';
import { api } from './services/api';
import { CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';

export default function App() {
  // Agent Certification State
  const [agentKYC, setAgentKYC] = useState<AgentKYC>(DEFAULT_CERTIFIED_AGENT);

  // Buildings State
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);

  // Units State
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);

  // Financial Transactions State
  const [transactions, setTransactions] = useState<FinancialRecord[]>(INITIAL_TRANSACTIONS);

  // Maintenance Tickets State
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(INITIAL_TICKETS);

  // Real-Time Dynamic Dashboard Stats (Live from /api/stats)
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Modals State
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isLandlordConsoleOpen, setIsLandlordConsoleOpen] = useState(false);
  const [consoleDefaultTab, setConsoleDefaultTab] = useState<'overview' | 'ledger' | 'sms' | 'maintenance' | 'units'>('overview');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Futuristic Theme Mode ('dark' by default to showcase the high-tech video aesthetic)
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [activeHeroTab, setActiveHeroTab] = useState<'console' | 'radar'>('console');

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Load live data from API endpoints
  const refreshAllData = useCallback(async () => {
    try {
      const [statsData, bldData, unitData, txData, tktData, kycData] = await Promise.all([
        api.getStats().catch(() => null),
        api.getBuildings().catch(() => null),
        api.getUnits().catch(() => null),
        api.getTransactions().catch(() => null),
        api.getTickets().catch(() => null),
        api.getAgentKYC().catch(() => null)
      ]);

      if (statsData) setStats(statsData);
      if (bldData && bldData.length > 0) setBuildings(bldData);
      if (unitData && unitData.length > 0) setUnits(unitData);
      if (txData && txData.length > 0) setTransactions(txData);
      if (tktData && tktData.length > 0) setTickets(tktData);
      if (kycData) setAgentKYC(kycData);
    } catch (err) {
      console.warn('API sync warning (using client cached state):', err);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Toggle certified agent demo state via API
  const handleToggleAgentMode = async () => {
    try {
      const res = await api.toggleAgentDemoMode();
      setAgentKYC(res.agentKYC);
      if (res.stats) setStats(res.stats);
      if (res.agentKYC.isCertified) {
        showToast('Switched to Certified Agent Mode (Béatrice Mengue - Cert #FND-CERT-2025-0849). Building registration unlocked!');
      } else {
        showToast('Switched to Uncertified Agent Mode. Building registration is now locked.');
      }
    } catch {
      // Fallback
      if (agentKYC.isCertified) {
        setAgentKYC({
          fullName: 'Unverified Guest',
          agencyName: 'Unregistered Broker',
          licenseId: 'NONE',
          city: 'Douala',
          momoNumber: '',
          isCertified: false,
          status: 'unverified'
        });
        showToast('Switched to Uncertified Agent Mode. Building registration is now locked.');
      } else {
        setAgentKYC(DEFAULT_CERTIFIED_AGENT);
        showToast('Switched to Certified Agent Mode. Building registration unlocked!');
      }
    }
  };

  // Certified Agent Registration handler via API
  const handleRegisterAgent = async (data: Partial<AgentKYC>) => {
    try {
      const res = await api.submitAgentKYC(data);
      setAgentKYC(res.agentKYC);
      if (res.stats) setStats(res.stats);
      showToast(`Congratulations ${res.agentKYC.fullName}! You are now an Accredited Certified Agent.`);
    } catch {
      const updated: AgentKYC = { ...agentKYC, ...data };
      setAgentKYC(updated);
      if (updated.isCertified) {
        showToast(`Congratulations ${updated.fullName}! You are now an Accredited Certified Agent.`);
      }
    }
  };

  // Add newly registered building + units via API
  const handleAddBuilding = async (newBuilding: Building, newUnits: Unit[]) => {
    try {
      const res = await api.createBuilding(newBuilding, newUnits);
      if (res.success) {
        setBuildings((prev) => [res.building, ...prev]);
        setUnits((prev) => [...newUnits, ...prev]);
        if (res.stats) setStats(res.stats);
        showToast(`"${res.building.name}" (${newUnits.length} units) published to FindNdap Cadastral Registry!`);
        return;
      }
    } catch (err) {
      console.error('Failed to create building via API:', err);
    }
    setBuildings([newBuilding, ...buildings]);
    setUnits([...newUnits, ...units]);
    showToast(`"${newBuilding.name}" (${newUnits.length} units) published to FindNdap Cadastral Registry!`);
  };

  // Ticket Status progression via API
  const handleUpdateTicketStatus = async (ticketId: string, nextStatus: MaintenanceTicket['status']) => {
    try {
      const res = await api.updateTicket(ticketId, { status: nextStatus });
      if (res.success) {
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? res.ticket : t)));
        if (res.stats) setStats(res.stats);
        showToast(`Work-Order updated to stage "${nextStatus}".`);
        return;
      }
    } catch (err) {
      console.error('Failed to update ticket via API:', err);
    }
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t)));
    showToast(`Work-Order updated to stage "${nextStatus}".`);
  };

  // Add payment deposit via API
  const handleAddTransaction = async (record: FinancialRecord) => {
    try {
      const res = await api.recordTransaction(record);
      if (res.success) {
        setTransactions((prev) => [res.transaction, ...prev]);
        if (res.stats) setStats(res.stats);
        // Refresh units to reflect cleared arrears
        api.getUnits().then((u) => setUnits(u));
        showToast(`Deposit of ${record.amountXAF.toLocaleString()} XAF recorded via ${record.method}.`);
        return;
      }
    } catch (err) {
      console.error('Failed to record transaction via API:', err);
    }
    setTransactions([record, ...transactions]);
    showToast(`Deposit of ${record.amountXAF.toLocaleString()} XAF recorded via ${record.method}.`);
  };

  // Update Unit Status or Rent via API
  const handleUpdateUnitStatus = async (unitId: string, status: Unit['status'], rent?: number) => {
    try {
      const res = await api.updateUnit(unitId, { status, rentAmountXAF: rent });
      if (res.success) {
        setUnits((prev) => prev.map((u) => (u.id === unitId ? res.unit : u)));
        if (res.stats) setStats(res.stats);
        showToast(`Unit status updated to ${status}.`);
        return;
      }
    } catch (err) {
      console.error('Failed to update unit via API:', err);
    }
    setUnits((prev) =>
      prev.map((u) =>
        u.id === unitId
          ? {
              ...u,
              status,
              rentAmountXAF: rent !== undefined ? rent : u.rentAmountXAF
            }
          : u
      )
    );
    showToast(`Unit status updated to ${status}.`);
  };

  const handleOpenLandlordConsole = (tab: 'overview' | 'ledger' | 'sms' | 'maintenance' | 'units' = 'overview') => {
    setConsoleDefaultTab(tab);
    setIsLandlordConsoleOpen(true);
  };

  const scrollToAgentSection = () => {
    const el = document.getElementById('agent-portal');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToDeveloperSandbox = () => {
    const el = document.getElementById('developer-sandbox');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col antialiased selection:bg-[#ff9827] selection:text-white relative transition-colors duration-700 ${
      themeMode === 'dark' ? 'bg-[#050b14] text-white' : 'bg-[#faf8ff] text-[#131b2e]'
    }`}>
      {/* Ambient cursor spotlight tracking user motion */}
      <CursorGlowFollower />

      {/* Fixed Sticky Header */}
      <Navbar
        agentKYC={agentKYC}
        onToggleAgentMode={handleToggleAgentMode}
        onOpenBuildingModal={() => setIsBuildingModalOpen(true)}
        onOpenLandlordConsole={() => handleOpenLandlordConsole('overview')}
        onOpenAgentModal={scrollToAgentSection}
      />

      {/* Main Content (Offset for fixed dual-layer navbar) */}
      <main className="flex-1 pt-24 lg:pt-28">
        {/* Toast Alert floating */}
        {toastMessage && (
          <div className="fixed top-28 right-4 z-50 max-w-md bg-[#002044] text-white p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-[#ff9827] shrink-0" />
            <span className="text-xs font-semibold leading-snug">{toastMessage}</span>
          </div>
        )}

        {/* Hero Section with Live Dynamically Recomputed Stats & 3D Interactive Console */}
        <HeroSection
          onRegisterAgentClick={scrollToAgentSection}
          onOpenLandlordConsole={() => handleOpenLandlordConsole('overview')}
          stats={stats}
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
          agentKYC={agentKYC}
          onRegisterAgent={handleRegisterAgent}
          onOpenBuildingModal={() => setIsBuildingModalOpen(true)}
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
        onOpenAgentPortal={scrollToAgentSection}
        onOpenLandlordConsole={() => handleOpenLandlordConsole('overview')}
        onOpenDeveloperSandbox={scrollToDeveloperSandbox}
        onOpenCadastralRadar={() => {
          setActiveHeroTab('radar');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* MODAL 1: Certified Agent Building Registration Studio */}
      <BuildingRegistrationModal
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
        agentKYC={agentKYC}
        onAddBuilding={handleAddBuilding}
        onEnableCertification={() => {
          setAgentKYC(DEFAULT_CERTIFIED_AGENT);
          showToast('Certified Agent status activated! You can now register buildings.');
        }}
      />

      {/* MODAL 2: Interactive Landlord Mobile Operations Suite */}
      <LandlordConsoleModal
        isOpen={isLandlordConsoleOpen}
        onClose={() => setIsLandlordConsoleOpen(false)}
        defaultTab={consoleDefaultTab}
        buildings={buildings}
        units={units}
        transactions={transactions}
        tickets={tickets}
        onUpdateTicketStatus={handleUpdateTicketStatus}
        onAddTransaction={handleAddTransaction}
        onUpdateUnitStatus={handleUpdateUnitStatus}
      />
    </div>
  );
}

