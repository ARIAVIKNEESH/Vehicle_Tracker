import React from 'react';
import { MapPin, Navigation, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationSelectorProps {
  startLocation: { lat: number; lng: number } | null;
  endLocation: { lat: number; lng: number } | null;
  isSelectingStart: boolean;
  isSelectingEnd: boolean;
  onStartSelect: () => void;
  onEndSelect: () => void;
  onClearLocations: () => void;
  onGenerateRoute: () => void;
  canGenerateRoute: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  startLocation,
  endLocation,
  isSelectingStart,
  isSelectingEnd,
  onStartSelect,
  onEndSelect,
  onClearLocations,
  onGenerateRoute,
  canGenerateRoute,
}) => {
  return (
    <div className="glass-panel rounded-xl p-4 space-y-4 animate-fade-in-up">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        Select Route
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button
            variant={isSelectingStart ? "default" : "outline"}
            size="sm"
            onClick={onStartSelect}
            className={`flex-1 ${isSelectingStart ? 'bg-green-500 hover:bg-green-600' : ''}`}
          >
            <div className="w-3 h-3 rounded-full bg-green-400 mr-2" />
            {startLocation ? 'Start Set' : 'Set Start'}
          </Button>
          {startLocation && (
            <span className="text-xs text-muted-foreground font-mono">
              {startLocation.lat.toFixed(4)}, {startLocation.lng.toFixed(4)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isSelectingEnd ? "default" : "outline"}
            size="sm"
            onClick={onEndSelect}
            className={`flex-1 ${isSelectingEnd ? 'bg-red-500 hover:bg-red-600' : ''}`}
          >
            <div className="w-3 h-3 rounded-full bg-red-400 mr-2" />
            {endLocation ? 'End Set' : 'Set End'}
          </Button>
          {endLocation && (
            <span className="text-xs text-muted-foreground font-mono">
              {endLocation.lat.toFixed(4)}, {endLocation.lng.toFixed(4)}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onClearLocations}
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear
        </Button>
        <Button
          size="sm"
          onClick={onGenerateRoute}
          disabled={!canGenerateRoute}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          <Navigation className="w-4 h-4 mr-2" />
          Generate Route
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Click on the map to set locations
      </p>
    </div>
  );
};

export default LocationSelector;
