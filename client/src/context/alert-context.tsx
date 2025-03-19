import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AlertLogEntry, SensorType, SensorReading, ThresholdSetting } from '@shared/schema';
import { subscribeAlertLog, addAlert } from '../lib/firebase';

interface AlertContextValue {
  alertLog: AlertLogEntry[];
  latestAlert: AlertLogEntry | null;
  showAlertModal: boolean;
  setShowAlertModal: (show: boolean) => void;
  isLoading: boolean;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertLog, setAlertLog] = useState<AlertLogEntry[]>([]);
  const [latestAlert, setLatestAlert] = useState<AlertLogEntry | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Subscribe to alert log from Firebase
  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = subscribeAlertLog((alerts) => {
      setAlertLog(alerts);
      setLatestAlert(alerts.length > 0 ? alerts[0] : null);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Only subscribe to alert log for now
  // We'll add threshold violation checks later after fixing the context structure
  
  const value = {
    alertLog,
    latestAlert,
    showAlertModal,
    setShowAlertModal,
    isLoading,
  };
  
  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

// Separate named export for the hook to ensure compatibility with Fast Refresh
export const useAlertContext = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }
  return context;
}
