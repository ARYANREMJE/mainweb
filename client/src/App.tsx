import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { SensorProvider } from "./context/sensor-context";
import { AlertProvider } from "./context/alert-context";
import Dashboard from "./pages/dashboard";
import ThresholdSettings from "./pages/threshold-settings";
import AlertLog from "./pages/alert-log";
import Header from "./components/header";
import Footer from "./components/footer";

// Initialize the app component
function App() {
  const [location] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <SensorProvider>
        <AlertProvider>
          <div className="flex flex-col min-h-screen bg-slate-100 text-slate-800">
            <Header currentPath={location} />
            
            <main className="container mx-auto px-4 py-6 flex-grow">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/thresholds" component={ThresholdSettings} />
                <Route path="/alerts" component={AlertLog} />
                <Route component={NotFound} />
              </Switch>
            </main>
            
            <Footer />
          </div>
          <Toaster />
        </AlertProvider>
      </SensorProvider>
    </QueryClientProvider>
  );
}

export default App;
