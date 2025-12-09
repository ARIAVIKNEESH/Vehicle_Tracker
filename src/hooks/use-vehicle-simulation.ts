import { useState, useEffect, useCallback, useRef } from 'react';
import { RoutePoint, calculateSpeed, interpolatePosition } from '@/lib/vehicle-utils';

interface UseVehicleSimulationProps {
  routeData: RoutePoint[];
  updateInterval?: number;
  animationSteps?: number;
}

interface UseVehicleSimulationReturn {
  currentPosition: { latitude: number; longitude: number } | null;
  currentIndex: number;
  isPlaying: boolean;
  speed: number;
  elapsedTime: number;
  progress: number;
  traveledPath: [number, number][];
  play: () => void;
  pause: () => void;
  reset: () => void;
  setPlaybackSpeed: (speed: number) => void;
  playbackSpeed: number;
}

export const useVehicleSimulation = ({
  routeData,
  updateInterval = 50,
  animationSteps = 20,
}: UseVehicleSimulationProps): UseVehicleSimulationReturn => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [traveledPath, setTraveledPath] = useState<[number, number][]>([]);
  
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const currentPosition = routeData.length > 0 && currentIndex < routeData.length - 1
    ? interpolatePosition(
        routeData[currentIndex],
        routeData[currentIndex + 1],
        animationProgress
      )
    : routeData[currentIndex] || null;

  const updateTraveledPath = useCallback(() => {
    if (routeData.length === 0) return;
    
    const path: [number, number][] = routeData
      .slice(0, currentIndex + 1)
      .map(point => [point.longitude, point.latitude]);
    
    if (currentPosition && currentIndex < routeData.length - 1) {
      path.push([currentPosition.longitude, currentPosition.latitude]);
    }
    
    setTraveledPath(path);
  }, [routeData, currentIndex, currentPosition]);

  useEffect(() => {
    updateTraveledPath();
  }, [currentIndex, animationProgress, updateTraveledPath]);

  const animate = useCallback((timestamp: number) => {
    if (!lastUpdateRef.current) {
      lastUpdateRef.current = timestamp;
    }

    const delta = timestamp - lastUpdateRef.current;
    
    if (delta >= updateInterval / playbackSpeed) {
      lastUpdateRef.current = timestamp;
      
      setAnimationProgress(prev => {
        const newProgress = prev + (1 / animationSteps);
        
        if (newProgress >= 1) {
          setCurrentIndex(prevIndex => {
            const nextIndex = prevIndex + 1;
            if (nextIndex >= routeData.length - 1) {
              setIsPlaying(false);
              return prevIndex;
            }
            
            if (routeData[prevIndex] && routeData[nextIndex]) {
              setSpeed(calculateSpeed(routeData[prevIndex], routeData[nextIndex]));
            }
            
            return nextIndex;
          });
          
          setElapsedTime(prev => prev + 1);
          return 0;
        }
        
        return newProgress;
      });
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying, routeData, updateInterval, animationSteps, playbackSpeed]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate]);

  const play = useCallback(() => {
    if (currentIndex >= routeData.length - 1) {
      setCurrentIndex(0);
      setAnimationProgress(0);
      setElapsedTime(0);
    }
    lastUpdateRef.current = 0;
    setIsPlaying(true);
  }, [currentIndex, routeData.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setAnimationProgress(0);
    setElapsedTime(0);
    setSpeed(0);
    setTraveledPath([]);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const progress = routeData.length > 0 
    ? ((currentIndex + animationProgress) / (routeData.length - 1)) * 100
    : 0;

  return {
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
  };
};
