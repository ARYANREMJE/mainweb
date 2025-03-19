import { useSensorContext } from "../context/sensor-context";

export default function SystemSummary() {
  const { fanStatus, lastUpdated } = useSensorContext();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-500';
      case 'Warning':
        return 'bg-yellow-500';
      case 'Critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    
    // Less than 1 minute ago
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than 1 hour ago
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    
    // Format as full date
    return lastUpdated.toLocaleString();
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-medium mb-2 md:mb-0">System Overview</h2>
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusColor(fanStatus[1])}`} />
            <span className="text-sm font-medium">Fan 1: {fanStatus[1]}</span>
          </div>
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusColor(fanStatus[2])}`} />
            <span className="text-sm font-medium">Fan 2: {fanStatus[2]}</span>
          </div>
          <div className="flex items-center text-sm text-slate-500">
            <span className="material-icons text-sm mr-1">update</span>
            <span>Last updated: {formatLastUpdated()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
