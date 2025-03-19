import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { SensorReading, ThresholdSetting, AlertLogEntry, sensorTypes, SensorType } from '@shared/schema';
import path from 'path';
import fs from 'fs';

let database;

// Initialize Firebase Admin SDK with service account
try {
  const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  const app = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://main-connection-320c1-default-rtdb.firebaseio.com"
  });
  
  database = getDatabase(app);
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
}

export async function generateMockData() {
  // Only run if database is initialized properly
  if (!database) return;

  const sensorsRef = database.ref('sensors');
  const thresholdsRef = database.ref('thresholds');
  
  // Mock data for 2 fans with 4 sensor types each
  const mockSensorData: Record<number, Record<string, any>> = {
    1: {},
    2: {}
  };
  
  const mockThresholdData: Record<number, Record<string, any>> = {
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
  
  // Vibration data (0-5 mm/s)
  mockSensorData[1].vibration = {
    value: 1 + Math.random() * 2,
    unit: "mm/s",
    timestamp: new Date().toISOString()
  };
  mockSensorData[2].vibration = {
    value: 1.5 + Math.random() * 2,
    unit: "mm/s",
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
  
  // Default thresholds
  mockThresholdData[1].temperature = { value: 35, unit: "°C" };
  mockThresholdData[2].temperature = { value: 35, unit: "°C" };
  
  mockThresholdData[1].humidity = { value: 70, unit: "%" };
  mockThresholdData[2].humidity = { value: 70, unit: "%" };
  
  mockThresholdData[1].vibration = { value: 4.0, unit: "mm/s" };
  mockThresholdData[2].vibration = { value: 4.0, unit: "mm/s" };
  
  mockThresholdData[1].gas = { value: 150, unit: "ppm" };
  mockThresholdData[2].gas = { value: 150, unit: "ppm" };
  
  // Write data to Firebase
  try {
    await sensorsRef.set(mockSensorData);
    
    // Only set thresholds if they don't exist
    const thresholdsSnapshot = await thresholdsRef.once('value');
    if (!thresholdsSnapshot.exists()) {
      await thresholdsRef.set(mockThresholdData);
    }
    
    console.log("Mock data generated successfully");
  } catch (error) {
    console.error("Error generating mock data:", error);
  }
}

// Generate new sensor data periodically
export function startMockDataGeneration() {
  // Generate initial data
  generateMockData();
  
  // Then update every 10 seconds
  return setInterval(generateMockData, 10000);
}