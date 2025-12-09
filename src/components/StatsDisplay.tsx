import React from 'react';
import { MapPin, Clock, Gauge, Navigation } from 'lucide-react';
import { formatCoordinate, formatElapsedTime } from '@/lib/vehicle-utils';

interface StatsDisplayProps {
  currentPosition: { latitude: number; longitude: number } | null;
  speed: number;
  elapsedTime: number;
  currentIndex: number;
  totalPoints: number;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  currentPosition,
  speed,
  elapsedTime,
  currentIndex,
  totalPoints,
}) => {
  const stats = [
    {
      icon: MapPin,
      label: 'Latitude',
      value: currentPosition ? formatCoordinate(currentPosition.latitude, 'lat') : '--',
    },
    {
      icon: Navigation,
      label: 'Longitude',
      value: currentPosition ? formatCoordinate(currentPosition.longitude, 'lng') : '--',
    },
    {
      icon: Gauge,
      label: 'Speed',
      value: `${speed} km/h`,
    },
    {
      icon: Clock,
      label: 'Elapsed',
      value: formatElapsedTime(elapsedTime),
    },
  ];

  return (
    <div className="glass-panel rounded-xl p-4 space-y-4 animate-slide-in-right">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Vehicle Stats</h3>
        <span className="text-xs text-muted-foreground font-mono">
          Point {currentIndex + 1}/{totalPoints}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="bg-secondary/50 rounded-lg p-3 space-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-2">
              <stat.icon className="h-3.5 w-3.5 text-primary" />
              <span className="stat-label">{stat.label}</span>
            </div>
            <p className="stat-value text-sm">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsDisplay;
