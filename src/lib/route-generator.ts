import { RoutePoint } from './vehicle-utils';

export const generateRouteBetweenPoints = (
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  numPoints: number = 30
): RoutePoint[] => {
  const route: RoutePoint[] = [];
  const startTime = new Date();

  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    
    // Add slight curve to make it more realistic
    const curveOffset = Math.sin(progress * Math.PI) * 0.002;
    
    const latitude = start.lat + (end.lat - start.lat) * progress + curveOffset;
    const longitude = start.lng + (end.lng - start.lng) * progress;
    
    const timestamp = new Date(startTime.getTime() + i * 5000).toISOString();
    
    route.push({ latitude, longitude, timestamp });
  }

  return route;
};

export const defaultLocations = {
  hyderabad: { lat: 17.385044, lng: 78.486671, name: 'Hyderabad' },
  bangalore: { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
  mumbai: { lat: 19.076, lng: 72.8777, name: 'Mumbai' },
  delhi: { lat: 28.6139, lng: 77.209, name: 'Delhi' },
  chennai: { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
};
