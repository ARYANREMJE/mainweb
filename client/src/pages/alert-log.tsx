import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useAlertContext } from "../context/alert-context";
import { clearAlertLog } from "../lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AlertLog() {
  const { alertLog, isLoading } = useAlertContext();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAlerts = async () => {
    setIsClearing(true);
    try {
      const success = await clearAlertLog();
      if (success) {
        toast({
          title: "Success",
          description: "Alert log cleared successfully",
          variant: "default",
        });
      } else {
        throw new Error("Failed to clear alert log");
      }
    } catch (error) {
      console.error("Error clearing alerts:", error);
      toast({
        title: "Error",
        description: "Failed to clear alert log",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const formatDate = (date: Date) => {
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

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="h-6 bg-slate-200 rounded"></CardTitle>
          <CardDescription className="h-4 bg-slate-100 rounded mt-2"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-slate-100 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Alert Log</CardTitle>
          <CardDescription>History of threshold violations</CardDescription>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={alertLog.length === 0 || isClearing}
            >
              Clear All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all alert history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAlerts}>
                {isClearing ? "Clearing..." : "Clear All"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent>
        {alertLog.length === 0 ? (
          <div className="py-10 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-slate-400 mb-2" />
            <p className="text-slate-500">No alerts recorded</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Fan</TableHead>
                  <TableHead>Sensor</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertLog.map((alert, index) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {formatDate(alert.timestamp)}
                    </TableCell>
                    <TableCell>{alert.fanName}</TableCell>
                    <TableCell>{alert.sensorType}</TableCell>
                    <TableCell>{alert.value}</TableCell>
                    <TableCell>{alert.threshold}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={alert.status === "Critical" ? "destructive" : "warning"}
                      >
                        {alert.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
