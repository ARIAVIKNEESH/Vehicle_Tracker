import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RoutePoint } from '@/lib/vehicle-utils';

interface VehicleMapProps {
  routeData: RoutePoint[];
  currentPosition: { latitude: number; longitude: number } | null;
  traveledPath: [number, number][];
  startLocation: { lat: number; lng: number } | null;
  endLocation: { lat: number; lng: number } | null;
  isSelectingLocation: boolean;
  onMapClick: (lat: number, lng: number) => void;
}

const VehicleMap: React.FC<VehicleMapProps> = ({
  routeData,
  currentPosition,
  traveledPath,
  startLocation,
  endLocation,
  isSelectingLocation,
  onMapClick,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const vehicleMarker = useRef<L.Marker | null>(null);
  const startMarker = useRef<L.Marker | null>(null);
  const endMarker = useRef<L.Marker | null>(null);
  const fullRoutePolyline = useRef<L.Polyline | null>(null);
  const traveledPolyline = useRef<L.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const center: [number, number] = [17.408, 78.498];

    map.current = L.map(mapContainer.current, {
      center,
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map.current);

    L.control.zoom({ position: 'topright' }).addTo(map.current);

    // Handle map clicks
    map.current.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    // Add CSS animation
    const style = document.createElement('style');
    style.id = 'leaflet-custom-styles';
    style.textContent = `
      @keyframes leaflet-pulse {
        0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.3); }
      }
      .vehicle-icon, .location-icon {
        background: transparent !important;
        border: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      map.current?.remove();
      map.current = null;
      document.getElementById('leaflet-custom-styles')?.remove();
    };
  }, []);

  // Update click handler
  useEffect(() => {
    if (!map.current) return;
    
    map.current.off('click');
    map.current.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });
  }, [onMapClick]);

  // Update cursor based on selection mode
  useEffect(() => {
    if (!mapContainer.current) return;
    mapContainer.current.style.cursor = isSelectingLocation ? 'crosshair' : 'grab';
  }, [isSelectingLocation]);

  // Update start marker
  useEffect(() => {
    if (!map.current) return;

    if (startMarker.current) {
      startMarker.current.remove();
      startMarker.current = null;
    }

    if (startLocation) {
      const icon = L.divIcon({
        className: 'location-icon',
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: #22c55e;
            border-radius: 50%;
            border: 3px solid #0f172a;
            box-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="color: #0f172a; font-weight: bold; font-size: 12px;">S</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      startMarker.current = L.marker([startLocation.lat, startLocation.lng], { icon }).addTo(map.current);
    }
  }, [startLocation]);

  // Update end marker
  useEffect(() => {
    if (!map.current) return;

    if (endMarker.current) {
      endMarker.current.remove();
      endMarker.current = null;
    }

    if (endLocation) {
      const icon = L.divIcon({
        className: 'location-icon',
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: #ef4444;
            border-radius: 50%;
            border: 3px solid #0f172a;
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="color: #fff; font-weight: bold; font-size: 12px;">E</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      endMarker.current = L.marker([endLocation.lat, endLocation.lng], { icon }).addTo(map.current);
    }
  }, [endLocation]);

  // Update route polylines
  useEffect(() => {
    if (!map.current) return;

    // Clear existing polylines
    if (fullRoutePolyline.current) {
      fullRoutePolyline.current.remove();
      fullRoutePolyline.current = null;
    }

    if (routeData.length > 0) {
      const fullRouteCoords = routeData.map(point => [point.latitude, point.longitude] as [number, number]);
      fullRoutePolyline.current = L.polyline(fullRouteCoords, {
        color: '#334155',
        weight: 5,
        opacity: 0.6,
      }).addTo(map.current);

      // Fit bounds to show full route
      map.current.fitBounds(fullRoutePolyline.current.getBounds(), { padding: [50, 50] });
    }
  }, [routeData]);

  // Initialize traveled polyline
  useEffect(() => {
    if (!map.current || traveledPolyline.current) return;

    traveledPolyline.current = L.polyline([], {
      color: '#2dd4bf',
      weight: 5,
      opacity: 1,
    }).addTo(map.current);

    return () => {
      traveledPolyline.current?.remove();
      traveledPolyline.current = null;
    };
  }, []);

  // Update vehicle marker
  useEffect(() => {
    if (!map.current) return;

    if (!currentPosition) {
      if (vehicleMarker.current) {
        vehicleMarker.current.remove();
        vehicleMarker.current = null;
      }
      return;
    }

    if (!vehicleMarker.current) {
      const vehicleIcon = L.divIcon({
        className: 'vehicle-icon',
        html: `
          <div style="position: relative; width: 40px; height: 40px;">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 24px;
              height: 24px;
              background: linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%);
              border-radius: 50%;
              border: 3px solid #0f172a;
              box-shadow: 0 0 20px rgba(45, 212, 191, 0.6), 0 0 40px rgba(45, 212, 191, 0.3);
              z-index: 2;
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 8px;
                height: 8px;
                background: #0f172a;
                border-radius: 50%;
              "></div>
            </div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 36px;
              height: 36px;
              border: 2px solid rgba(45, 212, 191, 0.5);
              border-radius: 50%;
              animation: leaflet-pulse 2s ease-in-out infinite;
            "></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      vehicleMarker.current = L.marker([currentPosition.latitude, currentPosition.longitude], { icon: vehicleIcon }).addTo(map.current);
    } else {
      vehicleMarker.current.setLatLng([currentPosition.latitude, currentPosition.longitude]);
    }

    map.current.panTo([currentPosition.latitude, currentPosition.longitude], { animate: true, duration: 0.1 });
  }, [currentPosition]);

  // Update traveled path
  useEffect(() => {
    if (!traveledPolyline.current) return;
    const latLngs = traveledPath.map(([lng, lat]) => L.latLng(lat, lng));
    traveledPolyline.current.setLatLngs(latLngs);
  }, [traveledPath]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 via-transparent to-transparent" />
    </div>
  );
};

export default VehicleMap;
