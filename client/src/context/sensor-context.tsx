import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  SensorReading, 
  ThresholdSetting, 
  SensorType, 
  sensorTypes, 
  sensorUnits,
  defaultThresholds
} from '@shared/schema';
import { 
  subscribeSensorData, 
  subscribeThresholdSettings, 
  initializeDefaultThresholds,
  startMockDataGeneration
} from '../lib/firebase';

interface SensorContextValue {
  sensorData: Record<number, Record<SensorType, SensorReading>>;
  thresholdSettings: Record<number, Record<SensorType, ThresholdSetting>>;
  fanStatus: Record<number, 'Operational' | 'Warning' | 'Critical' | 'Offline'>;
  systemStatus: 'Online' | 'Warning' | 'Critical' | 'Offline';
  lastUpdated: Date | null;
  isLoading: boolean;
}

const SensorContext = createContext<SensorContextValue | undefined>(undefined);

export function SensorProvider({ children }: { children: ReactNode }) {
  const [sensorData, setSensorData] = useState<Record<number, Record<SensorType, SensorReading>>>({});
  const [thresholdSettings, setThresholdSettings] = useState<Record<number, Record<SensorType, ThresholdSetting>>>({});
  const [fanStatus, setFanStatus] = useState<Record<number, 'Operational' | 'Warning' | 'Critical' | 'Offline'>>({
    1: 'Offline',
    2: 'Offline'
  });
  const [systemStatus, setSystemStatus] = useState<'Online' | 'Warning' | 'Critical' | 'Offline'>('Offline');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Subscribe to sensor data from Firebase
  useEffect(() => {
    const unsubscribe = subscribeSensorData((data) => {
      setSensorData(data);
      setLastUpdated(new Date());
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Subscribe to threshold settings from Firebase
  useEffect(() => {
    const unsubscribe = subscribeThresholdSettings((data) => {
      setThresholdSettings(data);
    });
    
    // Initialize default thresholds if not present
    const initializeThresholds = async () => {
      // Create default thresholds object
      const defaultValues: Record<number, Record<SensorType, ThresholdSetting>> = {};
      
      for (const fanId of [1, 2]) {
        defaultValues[fanId] = {} as Record<SensorType, ThresholdSetting>;
        
        for (const sensorType of sensorTypes) {
          defaultValues[fanId][sensorType] = {
            fanId,
            sensorType,
            value: defaultThresholds[sensorType].value,
            unit: sensorUnits[sensorType]
          };
        }
      }
      
      await initializeDefaultThresholds(defaultValues);
    };
    
    initializeThresholds();
    
    return () => unsubscribe();
  }, []);
  
  // Start generating mock data for Firebase on provider initialization
  useEffect(() => {
    // Generate mock data every 10 seconds
    const interval = startMockDataGeneration(10000);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);
  
  // Calculate fan status based on sensor data and thresholds
  useEffect(() => {
    const newFanStatus: Record<number, 'Operational' | 'Warning' | 'Critical' | 'Offline'> = {
      1: 'Offline',
      2: 'Offline'
    };
    
    // Only calculate if we have both sensor data and threshold settings
    if (Object.keys(sensorData).length > 0 && Object.keys(thresholdSettings).length > 0) {
      // For each fan
      for (const fanId of [1, 2]) {
        if (!sensorData[fanId]) {
          newFanStatus[fanId] = 'Offline';
          continue;
        }
        
        // Initialize as operational
        newFanStatus[fanId] = 'Operational';
        
        // Check each sensor against its threshold
        for (const sensorType of sensorTypes) {
          const reading = sensorData[fanId][sensorType];
          const threshold = thresholdSettings[fanId]?.[sensorType];
          
          if (!reading || !threshold) continue;
          
          // If any sensor is above threshold
          if (reading.value >= threshold.value) {
            // Calculate how much it exceeds by
            const exceedsBy = reading.value / threshold.value;
            
            // Set to critical if it exceeds by more than 10%
            if (exceedsBy > 1.1) {
              newFanStatus[fanId] = 'Critical';
              break;
            } 
            // Set to warning if not already critical
            else {
              // When we get here, we know it's not critical (from above condition)
              // So it's safe to set to warning
              newFanStatus[fanId] = 'Warning';
            }
          }
        }
      }
    }
    
    setFanStatus(newFanStatus);
    
    // Calculate overall system status (worst of all fans)
    if (newFanStatus[1] === 'Critical' || newFanStatus[2] === 'Critical') {
      setSystemStatus('Critical');
    } else if (newFanStatus[1] === 'Warning' || newFanStatus[2] === 'Warning') {
      setSystemStatus('Warning');
    } else if (newFanStatus[1] === 'Operational' && newFanStatus[2] === 'Operational') {
      setSystemStatus('Online');
    } else {
      setSystemStatus('Offline');
    }
  }, [sensorData, thresholdSettings]);
  
  const value = {
    sensorData,
    thresholdSettings,
    fanStatus,
    systemStatus,
    lastUpdated,
    isLoading,
  };
  
  return <SensorContext.Provider value={value}>{children}</SensorContext.Provider>;
}

// Separate named export for the hook to ensure compatibility with Fast Refresh
export const useSensorContext = () => {
  const context = useContext(SensorContext);
  if (context === undefined) {
    throw new Error('useSensorContext must be used within a SensorProvider');
  }
  return context;
}
