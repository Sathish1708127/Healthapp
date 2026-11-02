import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import GlobalChatbot from './components/GlobalChatbot';
import BiotechBackground from './components/BiotechBackground';
import RewardsModal from './components/RewardsModal';
import { NotificationProvider } from './components/NotificationContext';
import { GamificationProvider, useGamification } from './context/GamificationContext';

import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker';
import HealthVault from './pages/HealthVault';
import HealthPassport from './pages/HealthPassport';
import LabAnalyzer from './pages/LabAnalyzer';
import EnvironmentalHealth from './pages/EnvironmentalHealth';
import Gamification from './pages/Gamification';
import RuralMode from './pages/RuralMode';
import {
  SkinAnalyser,
  OutbreakAlerts,
  VitalsMonitor,
  SymptomJournal,
  TreatmentGuide,
  NutritionPlan,
  HealthReport,
  FamilyProfiles,
  Settings,
} from './pages/Pages';

function AppContent() {
  const [page, setPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { rewardsModalOpen, setRewardsModalOpen } = useGamification();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const pages = {
    dashboard: <Dashboard onNavigate={setPage} />,
    checker: <SymptomChecker onNavigate={setPage} />,
    journal: <SymptomJournal />,
    skin: <SkinAnalyser />,
    outbreak: <OutbreakAlerts />,
    vitals: <VitalsMonitor />,
    treatment: <TreatmentGuide onNavigate={setPage} />,
    nutrition: <NutritionPlan />,
    report: <HealthReport />,
    family: <FamilyProfiles />,
    settings: <Settings />,
    vault: <HealthVault />,
    passport: <HealthPassport />,
    lab: <LabAnalyzer />,
    environment: <EnvironmentalHealth />,
    gamification: <Gamification />,
    rural: <RuralMode />,
  };

  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 72 : 250);

  return (
    <div className="app-container" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Interactive Biotech Canvas Particle & Scroll Background */}
      <BiotechBackground />

      {/* Navigation Sidebar */}
      <Sidebar
        activePage={page}
        onNavigate={(p) => {
          setPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Dynamic Responsive Main Content Shell */}
      <div
        className="main-content"
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Top Interactive Navbar */}
        <Header
          activePage={page}
          onNavigate={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Active Page View Container with smooth entrance */}
        <main className="page-body fade-in" key={page}>
          {pages[page] || pages.dashboard}
        </main>
      </div>

      {/* Global Floating AI Health Copilot */}
      <GlobalChatbot
        activePage={page}
        onNavigate={(p) => {
          setPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        userVitals={{ hr: 72, temp: 98.4, spo2: 98, bp: '118/76' }}
      />

      {/* Level Rewards, Quests & Prize Locker Modal */}
      {rewardsModalOpen && (
        <RewardsModal
          onClose={() => setRewardsModalOpen(false)}
          onNavigate={(p) => {
            setPage(p);
            setRewardsModalOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <GamificationProvider>
        <AppContent />
      </GamificationProvider>
    </NotificationProvider>
  );
}
