import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAlertContext } from "../context/alert-context";
import { useSensorContext } from "../context/sensor-context";

interface HeaderProps {
  currentPath: string;
}

export default function Header({ currentPath }: HeaderProps) {
  const { alertLog, setShowAlertModal } = useAlertContext();
  const { systemStatus } = useSensorContext();
  const [alertCount, setAlertCount] = useState(0);

  // Update alert count when alert log changes
  useEffect(() => {
    // Only count alerts from the past 24 hours
    const recentAlerts = alertLog.filter(
      alert => alert.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000
    );
    setAlertCount(recentAlerts.length);
  }, [alertLog]);

  const handleAlertClick = () => {
    if (alertCount > 0) {
      setShowAlertModal(true);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <span className="material-icons text-primary mr-2">sensors</span>
          <h1 className="text-xl font-semibold">Tunnel Fan Monitoring System</h1>
        </div>
        <div className="flex items-center space-x-3 mt-2 md:mt-0">
          <div className="flex items-center">
            <span 
              className={`inline-block w-3 h-3 rounded-full mr-2 ${
                systemStatus === 'Online' ? 'bg-green-500' : 
                systemStatus === 'Warning' ? 'bg-yellow-500' : 
                systemStatus === 'Offline' ? 'bg-red-500' : 'bg-gray-500'
              }`}
            />
            <span className="text-sm font-medium">System {systemStatus}</span>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full relative"
            onClick={handleAlertClick}
          >
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {alertCount > 99 ? '99+' : alertCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <nav className="bg-slate-50 px-4">
        <div className="container mx-auto flex overflow-x-auto">
          <Link href="/">
            <div className={`py-3 px-4 border-b-2 font-medium cursor-pointer ${
              currentPath === '/' ? 'border-primary text-primary' : 'border-transparent hover:text-primary'
            }`}>
              Dashboard
            </div>
          </Link>
          <Link href="/thresholds">
            <div className={`py-3 px-4 border-b-2 font-medium cursor-pointer ${
              currentPath === '/thresholds' ? 'border-primary text-primary' : 'border-transparent hover:text-primary'
            }`}>
              Threshold Settings
            </div>
          </Link>
          <Link href="/alerts">
            <div className={`py-3 px-4 border-b-2 font-medium cursor-pointer ${
              currentPath === '/alerts' ? 'border-primary text-primary' : 'border-transparent hover:text-primary'
            }`}>
              Alert Log
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
}
