import { useState } from "react";
import { CalendarIcon, Sun, Cloud, CloudRain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProjectInfoProps {
  projectName: string;
  setProjectName: (name: string) => void;
  reportDate: Date | undefined;
  setReportDate: (date: Date | undefined) => void;
  weather: string;
  setWeather: (weather: string) => void;
  weatherPeriod: "AM" | "PM";
  setWeatherPeriod: (period: "AM" | "PM") => void;
  temperature: string;
  setTemperature: (temp: string) => void;
}

const WeatherOption = ({
  value,
  selected,
  onClick,
  icon: Icon,
}: {
  value: string;
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
      selected
        ? "bg-primary text-primary-foreground shadow-sm"
        : "bg-muted text-muted-foreground hover:bg-muted/80"
    )}
  >
    <Icon className="w-4 h-4" />
    {value}
  </button>
);

const ProjectInfo = ({
  projectName,
  setProjectName,
  reportDate,
  setReportDate,
  weather,
  setWeather,
  weatherPeriod,
  setWeatherPeriod,
  temperature,
  setTemperature,
}: ProjectInfoProps) => {
  const weatherOptions = [
    { value: "Sunny", icon: Sun },
    { value: "Cloudy", icon: Cloud },
    { value: "Rainy", icon: CloudRain },
  ];

  return (
    <div className="section-card p-6 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="projectName"
              className="text-sm font-medium text-foreground"
            >
              Project Name *
            </Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name..."
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground">
              Report Date *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1.5",
                    !reportDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {reportDate ? format(reportDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={reportDate}
                  onSelect={setReportDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-foreground">
              Weather
            </Label>
            <div className="flex flex-col gap-3 mt-1.5">
              {/* AM/PM Toggle */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setWeatherPeriod("AM")}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                    weatherPeriod === "AM"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setWeatherPeriod("PM")}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                    weatherPeriod === "PM"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  PM
                </button>
              </div>

              {/* Weather Options */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {weatherOptions.map((opt) => (
                    <WeatherOption
                      key={opt.value}
                      value={opt.value}
                      selected={weather === opt.value}
                      onClick={() => setWeather(opt.value)}
                      icon={opt.icon}
                    />
                  ))}
                </div>
                <Input
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="°C"
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;
