/**
 * components/dashboard/WeatherWidget.tsx
 * Compact weather summary card for the Dashboard.
 * Uses Lucide icons exclusively — NO emojis.
 */

import {
  Cloud,
  Sun,
  CloudRain,
  CloudDrizzle,
  Eye,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeatherData } from "@/types";

// ─── Condition Icon Mapping ───────────────────────────────────────────────────

function WeatherIcon({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const iconProps = { className: cn("w-5 h-5", className), strokeWidth: 2 };
  switch (code) {
    case "sunny":
      return <Sun {...iconProps} />;
    case "rain":
    case "heavy-rain":
      return <CloudRain {...iconProps} />;
    case "drizzle":
      return <CloudDrizzle {...iconProps} />;
    case "partly-cloudy":
    case "overcast":
    default:
      return <Cloud {...iconProps} />;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface WeatherWidgetProps {
  weather: WeatherData;
  compact?: boolean; // If true, render a smaller inline version
}

export default function WeatherWidget({
  weather,
  compact = false,
}: WeatherWidgetProps) {
  const formattedTime = new Date(weather.updatedAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#111d16] border border-[#2a3d2c]">
        <WeatherIcon code={weather.conditionCode} className="text-[#4dc24d]" />
        <div>
          <p className="text-sm font-semibold text-[#e8f5e9]">
            {weather.temperature}°C
          </p>
          <p className="text-xs text-[#5a7460]">{weather.condition}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#2a3d2c] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-[#5a7460] flex-shrink-0" />
          <span className="text-sm font-medium text-[#94a896] truncate">
            {weather.location}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#5a7460]">
          <RefreshCw className="w-3 h-3" />
          <span>Updated {formattedTime}</span>
        </div>
      </div>

      {/* Main reading */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-end gap-1">
            <span className="text-5xl font-bold text-[#e8f5e9] leading-none">
              {weather.temperature}
            </span>
            <span className="text-xl text-[#94a896] mb-1">°C</span>
          </div>
          <p className="text-sm text-[#94a896] mt-1">{weather.condition}</p>
          <p className="text-xs text-[#5a7460] mt-0.5">
            Feels like {weather.feelsLike}°C
          </p>
        </div>
        <WeatherIcon
          code={weather.conditionCode}
          className="!w-16 !h-16 text-[#4dc24d] opacity-80"
        />
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-4 divide-x divide-[#2a3d2c] border-t border-[#2a3d2c]">
        {[
          { icon: Droplets,    label: "Humidity",  value: `${weather.humidity}%`     },
          { icon: Wind,        label: "Wind",      value: `${weather.windSpeed} km/h` },
          { icon: Eye,         label: "Visibility",value: `${weather.visibility} km`  },
          { icon: Thermometer, label: "UV Index",  value: String(weather.uvIndex)     },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1 py-3">
            <Icon className="w-3.5 h-3.5 text-[#5a7460]" strokeWidth={2} />
            <span className="text-xs font-semibold text-[#e8f5e9]">{value}</span>
            <span className="text-[10px] text-[#5a7460]">{label}</span>
          </div>
        ))}
      </div>

      {/* 5-day forecast */}
      <div className="px-3 pb-3 pt-1">
        <div className="flex gap-1">
          {weather.forecast.map((day) => (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1 px-1 py-2 rounded-lg hover:bg-[#1f2f21] transition-colors"
            >
              <span className="text-[10px] font-medium text-[#5a7460]">
                {day.dayName}
              </span>
              <WeatherIcon
                code={day.conditionCode}
                className="!w-4 !h-4 text-[#94a896]"
              />
              <span className="text-xs font-semibold text-[#e8f5e9]">
                {day.high}°
              </span>
              <span className="text-[10px] text-[#5a7460]">{day.low}°</span>
              {/* Rain chance bar */}
              <div className="w-full h-0.5 rounded-full bg-[#2a3d2c] overflow-hidden mt-0.5">
                <div
                  className="h-full rounded-full bg-blue-400"
                  style={{ width: `${day.precipitationChance}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}