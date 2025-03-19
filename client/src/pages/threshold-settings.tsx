import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { 
  SensorType, 
  sensorTypes, 
  ThresholdSetting, 
  sensorNames, 
  sensorUnits,
  defaultThresholds
} from "@shared/schema";
import { saveThresholdSettings } from "../lib/firebase";
import { useSensorContext } from "../context/sensor-context";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ThresholdFormValues {
  [key: string]: number;
}

export default function ThresholdSettings() {
  const { toast } = useToast();
  const { thresholdSettings, isLoading } = useSensorContext();
  const [isSaving, setIsSaving] = useState(false);

  // Create form
  const { control, handleSubmit, reset } = useForm<ThresholdFormValues>();

  // Reset form when threshold settings are loaded or changed
  useEffect(() => {
    if (!isLoading && thresholdSettings) {
      const defaultValues: ThresholdFormValues = {};
      
      // Generate form values from threshold settings
      for (const fanId of [1, 2]) {
        for (const sensorType of sensorTypes) {
          const key = `fan${fanId}_${sensorType}`;
          const thresholdValue = thresholdSettings[fanId]?.[sensorType]?.value ?? 
                                 defaultThresholds[sensorType].value;
          defaultValues[key] = thresholdValue;
        }
      }
      
      reset(defaultValues);
    }
  }, [thresholdSettings, isLoading, reset]);

  const onSubmit = async (data: ThresholdFormValues) => {
    setIsSaving(true);
    
    try {
      // Format the data for Firebase
      const formattedData: Record<number, Record<SensorType, ThresholdSetting>> = {
        1: {} as Record<SensorType, ThresholdSetting>,
        2: {} as Record<SensorType, ThresholdSetting>
      };
      
      // Populate the formatted data
      for (const fanId of [1, 2]) {
        for (const sensorType of sensorTypes) {
          const key = `fan${fanId}_${sensorType}`;
          formattedData[fanId][sensorType] = {
            fanId,
            sensorType,
            value: data[key],
            unit: sensorUnits[sensorType]
          };
        }
      }
      
      // Save to Firebase
      const success = await saveThresholdSettings(formattedData);
      
      if (success) {
        toast({
          title: "Success",
          description: "Threshold settings saved successfully",
          variant: "default",
        });
      } else {
        throw new Error("Failed to save threshold settings");
      }
    } catch (error) {
      console.error("Error saving thresholds:", error);
      toast({
        title: "Error",
        description: "Failed to save threshold settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
      <CardHeader>
        <CardTitle>Threshold Settings</CardTitle>
        <CardDescription>Configure alert thresholds for each sensor</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="fan1" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fan1">Fan 1 Thresholds</TabsTrigger>
              <TabsTrigger value="fan2">Fan 2 Thresholds</TabsTrigger>
            </TabsList>

            {/* Fan 1 Thresholds */}
            <TabsContent value="fan1" className="mt-4">
              <div className="space-y-6">
                {sensorTypes.map((sensorType) => (
                  <div key={`fan1_${sensorType}`} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor={`fan1_${sensorType}`} className="text-sm font-medium">
                        {sensorNames[sensorType]} Threshold ({sensorUnits[sensorType]})
                      </label>
                      <Controller
                        name={`fan1_${sensorType}`}
                        control={control}
                        render={({ field }) => (
                          <span className="text-sm font-medium">{field.value}</span>
                        )}
                      />
                    </div>
                    <Controller
                      name={`fan1_${sensorType}`}
                      control={control}
                      render={({ field }) => (
                        <Slider
                          id={`fan1_${sensorType}`}
                          min={defaultThresholds[sensorType].min}
                          max={defaultThresholds[sensorType].max}
                          step={defaultThresholds[sensorType].step}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      )}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{defaultThresholds[sensorType].min}{sensorUnits[sensorType]}</span>
                      <span>{defaultThresholds[sensorType].max}{sensorUnits[sensorType]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Fan 2 Thresholds */}
            <TabsContent value="fan2" className="mt-4">
              <div className="space-y-6">
                {sensorTypes.map((sensorType) => (
                  <div key={`fan2_${sensorType}`} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor={`fan2_${sensorType}`} className="text-sm font-medium">
                        {sensorNames[sensorType]} Threshold ({sensorUnits[sensorType]})
                      </label>
                      <Controller
                        name={`fan2_${sensorType}`}
                        control={control}
                        render={({ field }) => (
                          <span className="text-sm font-medium">{field.value}</span>
                        )}
                      />
                    </div>
                    <Controller
                      name={`fan2_${sensorType}`}
                      control={control}
                      render={({ field }) => (
                        <Slider
                          id={`fan2_${sensorType}`}
                          min={defaultThresholds[sensorType].min}
                          max={defaultThresholds[sensorType].max}
                          step={defaultThresholds[sensorType].step}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      )}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{defaultThresholds[sensorType].min}{sensorUnits[sensorType]}</span>
                      <span>{defaultThresholds[sensorType].max}{sensorUnits[sensorType]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Thresholds"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
