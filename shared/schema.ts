import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original users schema (keeping for reference)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Fan sensor data schema
export const sensorTypes = ["temperature", "humidity", "vibration", "gas"] as const;
export type SensorType = typeof sensorTypes[number];

export const sensorData = pgTable("sensor_data", {
  id: serial("id").primaryKey(),
  fanId: integer("fan_id").notNull(),
  sensorType: text("sensor_type").notNull(),
  value: text("value").notNull(),
  unit: text("unit").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertSensorDataSchema = createInsertSchema(sensorData).omit({
  id: true,
});

export type InsertSensorData = z.infer<typeof insertSensorDataSchema>;
export type SensorData = typeof sensorData.$inferSelect;

// Threshold settings schema
export const thresholdSettings = pgTable("threshold_settings", {
  id: serial("id").primaryKey(),
  fanId: integer("fan_id").notNull(),
  sensorType: text("sensor_type").notNull(),
  value: text("value").notNull(),
  unit: text("unit").notNull(),
});

export const insertThresholdSettingsSchema = createInsertSchema(thresholdSettings).omit({
  id: true,
});

export type InsertThresholdSettings = z.infer<typeof insertThresholdSettingsSchema>;
export type ThresholdSettings = typeof thresholdSettings.$inferSelect;

// Alert log schema
export const alertLog = pgTable("alert_log", {
  id: serial("id").primaryKey(),
  fanId: integer("fan_id").notNull(),
  fanName: text("fan_name").notNull(),
  sensorType: text("sensor_type").notNull(),
  value: text("value").notNull(),
  threshold: text("threshold").notNull(),
  unit: text("unit").notNull(),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertAlertLogSchema = createInsertSchema(alertLog).omit({
  id: true,
});

export type InsertAlertLog = z.infer<typeof insertAlertLogSchema>;
export type AlertLog = typeof alertLog.$inferSelect;

// Define additional type definitions for client use
export interface SensorReading {
  fanId: number;
  sensorType: SensorType;
  value: number;
  unit: string;
  timestamp: Date;
}

export interface ThresholdSetting {
  fanId: number;
  sensorType: SensorType;
  value: number;
  unit: string;
}

export interface AlertLogEntry {
  id: number;
  fanId: number;
  fanName: string;
  sensorType: SensorType;
  value: string;
  threshold: string;
  unit: string;
  status: "Warning" | "Critical";
  timestamp: Date;
}

export const sensorUnits: Record<SensorType, string> = {
  temperature: "°C",
  humidity: "%",
  vibration: "g",
  gas: "ppm"
};

export const sensorIcons: Record<SensorType, string> = {
  temperature: "device_thermostat",
  humidity: "water_drop",
  vibration: "vibration",
  gas: "air"
};

export const sensorNames: Record<SensorType, string> = {
  temperature: "Temperature",
  humidity: "Humidity",
  vibration: "Vibration",
  gas: "Gas Level"
};

export const sensorModels: Record<SensorType, string> = {
  temperature: "DHT22 Sensor",
  humidity: "DHT22 Sensor",
  vibration: "SW240 Sensor",
  gas: "MQ135 Sensor"
};

export const defaultThresholds: Record<SensorType, { value: number; min: number; max: number; step: number }> = {
  temperature: { value: 35, min: 20, max: 50, step: 0.5 },
  humidity: { value: 70, min: 30, max: 90, step: 1 },
  vibration: { value: 4.0, min: 0.5, max: 10, step: 0.1 },
  gas: { value: 150, min: 50, max: 300, step: 5 }
};
