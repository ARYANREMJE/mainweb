import { useEffect } from "react";
import SystemSummary from "../components/system-summary";
import FanMonitoring from "../components/fan-monitoring";
import AlertModal from "../components/alert-modal";
import { useSensorContext } from "../context/sensor-context";
import { useAlertContext } from "../context/alert-context";
import { SensorType, sensorTypes } from "@shared/schema";

export default function Dashboard() {
  const { sensorData, isLoading } = useSensorContext();
  const { latestAlert, showAlertModal, setShowAlertModal } = useAlertContext();
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4 animate-pulse h-16"></div>
        
        {/* Fan 1 skeleton */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-slate-200 animate-pulse h-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-4 h-60 animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {/* Fan 2 skeleton */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-slate-200 animate-pulse h-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-4 h-60 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SystemSummary />
      
      {/* Fan 1 Monitoring */}
      <FanMonitoring fanId={1} fanName="Fan 1" />
      
      {/* Fan 2 Monitoring */}
      <FanMonitoring fanId={2} fanName="Fan 2" />
      
      {/* Alert Modal */}
      {showAlertModal && latestAlert && (
        <AlertModal 
          alert={latestAlert}
          onClose={() => setShowAlertModal(false)}
        />
      )}
    </div>
  );
}
