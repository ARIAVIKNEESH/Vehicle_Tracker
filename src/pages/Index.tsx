import React, { useState, useCallback } from 'react';
import { Truck } from 'lucide-react';
import VehicleMap from '@/components/VehicleMap';
import ControlPanel from '@/components/ControlPanel';
import StatsDisplay from '@/components/StatsDisplay';
import LocationSelector from '@/components/LocationSelector';
import { useVehicleSimulation } from '@/hooks/use-vehicle-simulation';
import { RoutePoint } from '@/lib/vehicle-utils';
import { generateRouteBetweenPoints } from '@/lib/route-generator';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [routeData, setRouteData] = useState<RoutePoint[]>([]);
  const [startLocation, setStartLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [endLocation, setEndLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSelectingStart, setIsSelectingStart] = useState(false);
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);
  const [routeGenerated, setRouteGenerated] = useState(false);

  const {
    currentPosition,
    currentIndex,
    isPlaying,
    speed,
    elapsedTime,
    progress,
    traveledPath,
    play,
    pause,
    reset,
    setPlaybackSpeed,
    playbackSpeed,
  } = useVehicleSimulation({ routeData });

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (isSelectingStart) {
      setStartLocation({ lat, lng });
      setIsSelectingStart(false);
      toast({
        title: "Start location set",
        description: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
      });
    } else if (isSelectingEnd) {
      setEndLocation({ lat, lng });
      setIsSelectingEnd(false);
      toast({
        title: "End location set",
        description: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
      });
    }
  }, [isSelectingStart, isSelectingEnd]);

  const handleStartSelect = () => {
    setIsSelectingStart(true);
    setIsSelectingEnd(false);
  };

  const handleEndSelect = () => {
    setIsSelectingEnd(true);
    setIsSelectingStart(false);
  };

  const handleClearLocations = () => {
    setStartLocation(null);
    setEndLocation(null);
    setRouteData([]);
    setRouteGenerated(false);
    setIsSelectingStart(false);
    setIsSelectingEnd(false);
    reset();
  };

  const handleGenerateRoute = () => {
    if (startLocation && endLocation) {
      const route = generateRouteBetweenPoints(startLocation, endLocation, 30);
      setRouteData(route);
      setRouteGenerated(true);
      reset();
      toast({
        title: "Route generated!",
        description: "Click Play to start the simulation",
      });
    }
  };

  const isSelectingLocation = isSelectingStart || isSelectingEnd;
  const canGenerateRoute = startLocation !== null && endLocation !== null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0">
        <VehicleMap
          routeData={routeData}
          currentPosition={currentPosition}
          traveledPath={traveledPath}
          startLocation={startLocation}
          endLocation={endLocation}
          isSelectingLocation={isSelectingLocation}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-[1000] p-4">
        <div className="glass-panel rounded-xl px-4 py-3 inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Vehicle Tracker</h1>
            <p className="text-xs text-muted-foreground">Real-time simulation</p>
          </div>
        </div>
      </header>

      {/* Location Selector - Top Right */}
      <div className="absolute top-4 right-4 z-[1000] w-72">
        <LocationSelector
          startLocation={startLocation}
          endLocation={endLocation}
          isSelectingStart={isSelectingStart}
          isSelectingEnd={isSelectingEnd}
          onStartSelect={handleStartSelect}
          onEndSelect={handleEndSelect}
          onClearLocations={handleClearLocations}
          onGenerateRoute={handleGenerateRoute}
          canGenerateRoute={canGenerateRoute}
        />
      </div>

      {/* Controls Overlay - Only show when route is generated */}
      {routeGenerated && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ControlPanel
                isPlaying={isPlaying}
                progress={progress}
                playbackSpeed={playbackSpeed}
                onPlay={play}
                onPause={pause}
                onReset={reset}
                onSpeedChange={setPlaybackSpeed}
              />
              <StatsDisplay
                currentPosition={currentPosition}
                speed={speed}
                elapsedTime={elapsedTime}
                currentIndex={currentIndex}
                totalPoints={routeData.length}
              />
            </div>
          </div>
        </div>
      )}

      {/* Instructions when no route */}
      {!routeGenerated && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="glass-panel rounded-xl p-4 max-w-md mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              👆 Select start and end locations on the map, then click "Generate Route" to begin tracking
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
