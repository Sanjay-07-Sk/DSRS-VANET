import React, { createContext, useContext, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../store/useAppStore';
import { Vehicle, Hospital, Incident, Mission, AIDecisionLog } from '../types';

const AppContext = createContext<ReturnType<typeof useAppStore.getState> | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useAppStore();

  // Initialize theme DOM attribute
  useEffect(() => {
    store.setTheme(store.theme);
  }, []);

  // Socket.IO real-time event handling
  useEffect(() => {
    store.fetchInitialData();

    const socket: Socket = io();

    socket.on('vehicle:update', (updatedVehicles: Vehicle[]) => {
      store.setVehicles(updatedVehicles);
      store.setSystemStatus({ vehicleFeed: true });
    });

    socket.on('hospital:update', (updatedHospitals: Hospital[]) => {
      store.setHospitals(updatedHospitals);
      store.setSystemStatus({ hospitalFeed: true });
    });

    socket.on('incident:created', (newInc: Incident) => {
      useAppStore.setState((state) => ({
        incidents: [newInc, ...state.incidents],
        notifications: [`New incident reported: ${newInc.type} at ${newInc.location}`, ...state.notifications]
      }));
    });

    socket.on('mission:created', (newMission: Mission) => {
      useAppStore.setState((state) => ({
        missions: [newMission, ...state.missions.filter(m => m.id !== newMission.id)],
        notifications: [`Mission ${newMission.id} launched for ${newMission.emergencyType}`, ...state.notifications]
      }));
    });

    socket.on('mission:updated', (updatedMission: Mission) => {
      useAppStore.setState((state) => ({
        missions: [updatedMission, ...state.missions.filter(m => m.id !== updatedMission.id)]
      }));
    });

    socket.on('mission:event', (newLog: AIDecisionLog) => {
      useAppStore.setState((state) => ({
        decisionLogs: [newLog, ...state.decisionLogs]
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <AppContext.Provider value={store}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  return useAppStore();
};
