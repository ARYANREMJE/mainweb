import { useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { AlertLogEntry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, List } from "lucide-react";

interface AlertModalProps {
  alert: AlertLogEntry;
  onClose: () => void;
}

export default function AlertModal({ alert, onClose }: AlertModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [_, setLocation] = useLocation();
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };
  
  const handleViewAlertLog = () => {
    onClose();
    setLocation("/alerts");
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-red-500 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Sensor Alert
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4">
          <p className="mb-2">Threshold violation detected:</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p>
              <strong>{alert.fanName} {alert.sensorType}:</strong> {alert.value} exceeds threshold of {alert.threshold}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Detected at {formatTime(alert.timestamp)}
            </p>
          </div>
          <p className="text-sm text-slate-600">Please check the fan system for potential issues.</p>
        </div>
        <div className="p-4 border-t border-slate-200 flex justify-end">
          <Button variant="outline" className="mr-2" onClick={onClose}>
            Dismiss
          </Button>
          <Button onClick={handleViewAlertLog}>
            <List className="mr-2 h-4 w-4" />
            View Alert Log
          </Button>
        </div>
      </div>
    </div>
  );
}
