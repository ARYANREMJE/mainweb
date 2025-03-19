import { useMemo } from "react";
import { SensorType, sensorTypes } from "@shared/schema";
import SensorCard from "./sensor-card";
import { useSensorContext } from "../context/sensor-context";

interface FanMonitoringProps {
  fanId: number;
  fanName: string;
}

export default function FanMonitoring({ fanId, fanName }: FanMonitoringProps) {
  const { sensorData, thresholdSettings } = useSensorContext();
  
  // Get fan sensor data and thresholds
  const fanSensorData = sensorData[fanId] || {};
  const fanThresholds = thresholdSettings[fanId] || {};
  
  return (
    <section className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-medium">{fanName} Monitoring</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {sensorTypes.map((sensorType) => (
          <SensorCard
            key={`${fanId}_${sensorType}`}
            fanId={fanId}
            sensorType={sensorType}
            reading={fanSensorData[sensorType]}
            threshold={fanThresholds[sensorType]}
          />
        ))}
      </div>
    </section>
  );
}
