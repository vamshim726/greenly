import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface LogActionFormProps {
  onActionLogged?: () => void;
}

const CO2_FACTORS = {
  transport: {
    'car_avoided': 0.21, // kg CO2 per km avoided
    'bike_used': 0.0,
    'public_transport': 0.05, // kg CO2 per km (much lower than car)
    'walk': 0.0
  },
  energy: {
    'led_bulb': 0.5, // kg CO2 saved per bulb per day
    'unplugged_devices': 0.3, // kg CO2 saved per device per day
    'shorter_shower': 0.7, // kg CO2 saved per minute reduced
    'renewable_energy': 2.0 // kg CO2 saved per kWh
  },
  waste: {
    'recycled': 0.1, // kg CO2 saved per kg recycled
    'composted': 0.3, // kg CO2 saved per kg composted
    'reused_item': 1.0, // kg CO2 saved per item reused
    'avoided_plastic': 0.5 // kg CO2 saved per plastic item avoided
  }
};

const LogActionForm = ({ onActionLogged }: LogActionFormProps) => {
  const [actionType, setActionType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [actionDate, setActionDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const calculateCO2Saved = (type: string, desc: string, val: number): number => {
    // Simple estimation based on description keywords
    const lowerDesc = desc.toLowerCase();
    
    if (type === 'transport') {
      const transportFactors = CO2_FACTORS.transport;
      if (lowerDesc.includes('car') || lowerDesc.includes('drive')) {
        return val * transportFactors.car_avoided;
      } else if (lowerDesc.includes('bike') || lowerDesc.includes('cycle')) {
        return val * 0.21; // Assuming they avoided car
      } else if (lowerDesc.includes('public') || lowerDesc.includes('bus') || lowerDesc.includes('train')) {
        return val * (transportFactors.car_avoided - transportFactors.public_transport);
      } else if (lowerDesc.includes('walk')) {
        return val * transportFactors.car_avoided;
      }
    } else if (type === 'energy') {
      const energyFactors = CO2_FACTORS.energy;
      if (lowerDesc.includes('bulb') || lowerDesc.includes('led')) {
        return val * energyFactors.led_bulb;
      } else if (lowerDesc.includes('unplug') || lowerDesc.includes('device')) {
        return val * energyFactors.unplugged_devices;
      } else if (lowerDesc.includes('shower')) {
        return val * energyFactors.shorter_shower;
      } else if (lowerDesc.includes('renewable') || lowerDesc.includes('solar')) {
        return val * energyFactors.renewable_energy;
      }
    } else if (type === 'waste') {
      const wasteFactors = CO2_FACTORS.waste;
      if (lowerDesc.includes('recycle')) {
        return val * wasteFactors.recycled;
      } else if (lowerDesc.includes('compost')) {
        return val * wasteFactors.composted;
      } else if (lowerDesc.includes('reuse')) {
        return val * wasteFactors.reused_item;
      } else if (lowerDesc.includes('plastic') || lowerDesc.includes('avoid')) {
        return val * wasteFactors.avoided_plastic;
      }
    }

    // Default estimation
    return val * 0.5;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!actionType || !description || !value) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to log actions",
          variant: "destructive",
        });
        return;
      }

      const numValue = parseFloat(value);
      const co2Saved = calculateCO2Saved(actionType, description, numValue);

      const { error } = await supabase
        .from('eco_actions')
        .insert({
          user_id: user.id,
          action_type: actionType,
          description: description,
          value: numValue,
          co2_saved: co2Saved,
          action_date: format(actionDate, 'yyyy-MM-dd')
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: `Action logged! Estimated CO₂ saved: ${co2Saved.toFixed(2)} kg`,
      });

      // Reset form
      setActionType("");
      setDescription("");
      setValue("");
      setActionDate(new Date());
      
      // Notify parent component
      onActionLogged?.();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log action",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Eco Action</CardTitle>
        <CardDescription>
          Record your environmental actions and see their impact
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action-type">Action Type</Label>
            <Select value={actionType} onValueChange={setActionType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select action type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="energy">Energy</SelectItem>
                <SelectItem value="waste">Waste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="e.g., Biked 5km instead of driving, Used LED bulbs, Recycled plastic bottles"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              placeholder="e.g., 5 (km), 3 (hours), 2 (items)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !actionDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {actionDate ? format(actionDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={actionDate}
                  onSelect={(date) => date && setActionDate(date)}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging Action...
              </>
            ) : (
              "Log Action"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LogActionForm;