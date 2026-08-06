import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { MissionControlBanner } from './components/MissionControlBanner';
import { LiveMonitoringView } from './components/LiveMonitoringView';
import { FleetManagementView } from './components/FleetManagementView';
import { AIAnalyticsView } from './components/AIAnalyticsView';
import { HospitalStatusView } from './components/HospitalStatusView';
import { ReportsView } from './components/ReportsView';
import { CreateIncidentModal } from './components/CreateIncidentModal';
import { SettingsModal } from './components/SettingsModal';
import { AiEngineModal } from './components/AiEngineModal';
import { JudgeAuthModal } from './components/JudgeAuthModal';
import { DatasetViewerModal } from './components/DatasetViewerModal';
import { NotificationToastContainer } from './components/NotificationToastContainer';

const DashboardContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Top Fixed / Persistent Command Header */}
      <Header />

      {/* Real-Time Active Mission Step Tracker Banner */}
      <MissionControlBanner />

      {/* Main View Area rendering current Active Tab */}
      <main className="w-full">
        {activeTab === 'LIVE MONITORING' && <LiveMonitoringView />}
        {activeTab === 'FLEET MANAGEMENT' && <FleetManagementView />}
        {activeTab === 'AI ANALYTICS' && <AIAnalyticsView />}
        {activeTab === 'HOSPITAL STATUS' && <HospitalStatusView />}
        {activeTab === 'REPORTS' && <ReportsView />}
      </main>

      {/* Modal Dialogs */}
      <CreateIncidentModal />
      <SettingsModal />
      <AiEngineModal />
      <JudgeAuthModal />
      <DatasetViewerModal />
      <NotificationToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
