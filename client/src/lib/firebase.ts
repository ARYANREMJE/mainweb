import { initializeApp } from "firebase/app";
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  push, 
  remove, 
  DatabaseReference, 
  DataSnapshot 
} from "firebase/database";
import { 
  SensorReading, 
  ThresholdSetting, 
  AlertLogEntry, 
  sensorTypes, 
  SensorType,
  sensorUnits,
  defaultThresholds
} from "@shared/schema";
import { firebaseConfig } from "./firebase-config";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Database references
const sensorsRef = ref(database, 'sensors');
const thresholdsRef = ref(database, 'thresholds');
const alertsRef = ref(database, 'alerts');

// Subscribe to sensor data
export function subscribeSensorData(callback: (readings: Record<number, Record<SensorType, SensorReading>>) => void): () => void {
  const unsubscribe = onValue(sensorsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const formattedData: Record<number, Record<SensorType, SensorReading>> = {};
    
    // Format the data into the expected structure
    for (const fanId in data) {
      const fanData = data[fanId];
      formattedData[Number(fanId)] = {} as Record<SensorType, SensorReading>;
      
      for (const sensorType of sensorTypes) {
        if (fanData[sensorType]) {
          formattedData[Number(fanId)][sensorType] = {
            fanId: Number(fanId),
            sensorType: sensorType,
            value: Number(fanData[sensorType].value),
            unit: fanData[sensorType].unit,
            timestamp: new Date(fanData[sensorType].timestamp || Date.now()),
          };
        }
      }
    }
    
    callback(formattedData);
  });
  
  return unsubscribe;
}

// Subscribe to threshold settings
export function subscribeThresholdSettings(callback: (thresholds: Record<number, Record<SensorType, ThresholdSetting>>) => void): () => void {
  const unsubscribe = onValue(thresholdsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const formattedData: Record<number, Record<SensorType, ThresholdSetting>> = {};
    
    // Format the data into the expected structure
    for (const fanId in data) {
      const fanData = data[fanId];
      formattedData[Number(fanId)] = {} as Record<SensorType, ThresholdSetting>;
      
      for (const sensorType of sensorTypes) {
        if (fanData[sensorType]) {
          formattedData[Number(fanId)][sensorType] = {
            fanId: Number(fanId),
            sensorType: sensorType,
            value: Number(fanData[sensorType].value),
            unit: fanData[sensorType].unit,
          };
        }
      }
    }
    
    callback(formattedData);
  });
  
  return unsubscribe;
}

// Subscribe to alert log
export function subscribeAlertLog(callback: (alerts: AlertLogEntry[]) => void): () => void {
  const unsubscribe = onValue(alertsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const alertsList: AlertLogEntry[] = [];
    
    for (const key in data) {
      const alert = data[key];
      alertsList.push({
        id: parseInt(key),
        fanId: Number(alert.fanId),
        fanName: alert.fanName,
        sensorType: alert.sensorType as SensorType,
        value: alert.value,
        threshold: alert.threshold,
        unit: alert.unit,
        status: alert.status,
        timestamp: new Date(alert.timestamp),
      });
    }
    
    // Sort by timestamp (newest first)
    alertsList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    callback(alertsList);
  });
  
  return unsubscribe;
}

// Save threshold settings
export async function saveThresholdSettings(thresholds: Record<number, Record<SensorType, ThresholdSetting>>) {
  try {
    await set(thresholdsRef, thresholds);
    return true;
  } catch (error) {
    console.error("Error saving threshold settings:", error);
    return false;
  }
}

// Add alert to log
export async function addAlert(alert: Omit<AlertLogEntry, 'id' | 'timestamp'>) {
  try {
    const newAlert = {
      ...alert,
      timestamp: new Date().toISOString(),
    };
    
    // Use push to automatically generate a unique ID
    await push(alertsRef, newAlert);
    return true;
  } catch (error) {
    console.error("Error adding alert:", error);
    return false;
  }
}

// Clear all alerts
export async function clearAlertLog() {
  try {
    await set(alertsRef, null);
    return true;
  } catch (error) {
    console.error("Error clearing alerts:", error);
    return false;
  }
}

// Initialize default threshold settings if not present
export async function initializeDefaultThresholds(defaultValues: Record<number, Record<SensorType, ThresholdSetting>>) {
  try {
    const snapshot = await new Promise<DataSnapshot>((resolve) => {
      onValue(thresholdsRef, resolve, { onlyOnce: true });
    });
    
    if (!snapshot.exists()) {
      await set(thresholdsRef, defaultValues);
    }
    
    return true;
  } catch (error) {
    console.error("Error initializing default thresholds:", error);
    return false;
  }
}

// Generate mock sensor data for testing
export async function generateMockData() {
  try {
    // Mock data for 2 fans with 4 sensor types each
    const mockSensorData: Record<number, Record<string, any>> = {
      1: {},
      2: {}
    };
    
    // Temperature data (20-40°C)
    mockSensorData[1].temperature = {
      value: 28 + Math.random() * 4,
      unit: "°C",
      timestamp: new Date().toISOString()
    };
    mockSensorData[2].temperature = {
      value: 29 + Math.random() * 4,
      unit: "°C",
      timestamp: new Date().toISOString()
    };
    
    // Humidity data (30-70%)
    mockSensorData[1].humidity = {
      value: 45 + Math.random() * 15,
      unit: "%",
      timestamp: new Date().toISOString()
    };
    mockSensorData[2].humidity = {
      value: 50 + Math.random() * 15,
      unit: "%",
      timestamp: new Date().toISOString()
    };
    
    // Vibration data (0-5 g)
    mockSensorData[1].vibration = {
      value: 1 + Math.random() * 2,
      unit: "g",
      timestamp: new Date().toISOString()
    };
    mockSensorData[2].vibration = {
      value: 1.5 + Math.random() * 2,
      unit: "g",
      timestamp: new Date().toISOString()
    };
    
    // Gas concentration data (0-250 ppm)
    mockSensorData[1].gas = {
      value: 80 + Math.random() * 60,
      unit: "ppm",
      timestamp: new Date().toISOString()
    };
    mockSensorData[2].gas = {
      value: 100 + Math.random() * 70,
      unit: "ppm",
      timestamp: new Date().toISOString()
    };
    
    // Write to Firebase
    await set(sensorsRef, mockSensorData);
    return true;
  } catch (error) {
    console.error("Error generating mock data:", error);
    return false;
  }
}

// Start mock data generation
export function startMockDataGeneration(intervalMs = 10000) {
  // Generate initial data
  generateMockData();
  
  // Setup default thresholds
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
  
  initializeDefaultThresholds(defaultValues);
  
  // Then update every intervalMs milliseconds
  return setInterval(generateMockData, intervalMs);
}
