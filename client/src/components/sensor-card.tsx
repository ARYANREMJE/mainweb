import { useMemo } from "react";
import { SensorType, SensorReading, ThresholdSetting, sensorNames, sensorModels, sensorIcons, sensorUnits } from "@shared/schema";
import GaugeChart from "./gauge-chart";

interface SensorCardProps {
  fanId: number;
  sensorType: SensorType;
  reading?: SensorReading;
  threshold?: ThresholdSetting;
}

export default function SensorCard({ fanId, sensorType, reading, threshold }: SensorCardProps) {
  // Default values for when data is not available
  const defaultUnit = sensorUnits[sensorType];
  const defaultThresholdValue = {
    temperature: 35,
    humidity: 70,
    vibration: 4.0,
    gas: 150
  }[sensorType];
  
  // Calculate display values
  const value = reading?.value ?? 0;
  const thresholdValue = threshold?.value ?? defaultThresholdValue;
  const isExceedingThreshold = value >= thresholdValue;
  
  // Calculate gauge properties
  const gaugeMax = useMemo(() => {
    // Set gauge max to 1.5x threshold value, but at least 2x current value
    return Math.max(thresholdValue * 1.5, value * 2);
  }, [thresholdValue, value]);
  
  // Determine text color based on threshold
  const valueTextColor = isExceedingThreshold 
    ? (value > thresholdValue * 1.1 ? 'text-red-500' : 'text-yellow-500') 
    : 'text-slate-700';

  return (
    <div className="bg-slate-50 rounded-lg p-4 sensor-card" data-sensor-type={sensorType}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium">{sensorNames[sensorType]}</h4>
          <p className="text-sm text-slate-500">{sensorModels[sensorType]}</p>
        </div>
        <span className="material-icons text-primary">{sensorIcons[sensorType]}</span>
      </div>
      <div className="text-center my-4">
        <div className="inline-block">
          <GaugeChart 
            value={value} 
            max={gaugeMax} 
            threshold={thresholdValue} 
            isExceedingThreshold={isExceedingThreshold}
          />
        </div>
      </div>
      <div className="flex justify-between items-baseline">
        <div className={`text-2xl font-bold ${valueTextColor}`}>
          {value}{defaultUnit}
        </div>
        <div className="text-sm">
          <span className="font-medium">Threshold: </span>
          <span>{thresholdValue}{defaultUnit}</span>
        </div>
      </div>
    </div>
  );
}
