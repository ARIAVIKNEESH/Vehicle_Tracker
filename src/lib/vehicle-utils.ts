export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface VehicleState {
  currentIndex: number;
  isPlaying: boolean;
  speed: number;
  elapsedTime: number;
  currentPosition: RoutePoint | null;
}

export const calculateSpeed = (
  point1: RoutePoint,
  point2: RoutePoint
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.latitude)) *
      Math.cos(toRad(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 1000; // Distance in meters

  const time1 = new Date(point1.timestamp).getTime();
  const time2 = new Date(point2.timestamp).getTime();
  const timeDiff = (time2 - time1) / 1000; // Time in seconds

  if (timeDiff === 0) return 0;
  
  const speedMps = distance / timeDiff;
  const speedKmh = speedMps * 3.6;
  
  return Math.round(speedKmh * 10) / 10;
};

const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const formatCoordinate = (value: number, type: 'lat' | 'lng'): string => {
  const direction = type === 'lat' 
    ? (value >= 0 ? 'N' : 'S')
    : (value >= 0 ? 'E' : 'W');
  return `${Math.abs(value).toFixed(6)}° ${direction}`;
};

export const formatElapsedTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const interpolatePosition = (
  point1: RoutePoint,
  point2: RoutePoint,
  progress: number
): { latitude: number; longitude: number } => {
  return {
    latitude: point1.latitude + (point2.latitude - point1.latitude) * progress,
    longitude: point1.longitude + (point2.longitude - point1.longitude) * progress,
  };
};
