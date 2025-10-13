import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Coordinate } from '@shared/schema';

interface MapViewProps {
  userLocation: { latitude: number; longitude: number } | null;
  coordinates: Coordinate[];
  activeCoordinates: Coordinate[];
  radius: number;
  mode: 'admin' | 'user';
  onMapClick?: (lat: number, lng: number) => void;
  isAddingCoordinate?: boolean;
}

export function MapView({
  userLocation,
  coordinates,
  activeCoordinates,
  radius,
  mode,
  onMapClick,
  isAddingCoordinate = false,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const coordinateMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const activeCirclesRef = useRef<Map<string, L.Circle>>(new Map());
  const isAddingCoordinateRef = useRef(isAddingCoordinate);
  const onMapClickRef = useRef(onMapClick);

  useEffect(() => {
    isAddingCoordinateRef.current = isAddingCoordinate;
  }, [isAddingCoordinate]);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map', {
        zoomControl: true,
        attributionControl: true,
      }).setView([37.7749, -122.4194], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      mapRef.current = map;

      map.on('click', (e) => {
        if (isAddingCoordinateRef.current && onMapClickRef.current) {
          onMapClickRef.current(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (isAddingCoordinate) {
      mapRef.current.getContainer().style.cursor = 'crosshair';
    } else {
      mapRef.current.getContainer().style.cursor = '';
    }
  }, [isAddingCoordinate]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);
    } else {
      const icon = L.divIcon({
        className: 'user-location-marker',
        html: `<div class="w-4 h-4 bg-teal rounded-full border-2 border-white shadow-lg"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      userMarkerRef.current = L.circleMarker([userLocation.latitude, userLocation.longitude], {
        radius: 8,
        fillColor: '#14b8a6',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(mapRef.current);

      const accuracyCircle = L.circle([userLocation.latitude, userLocation.longitude], {
        radius: 50,
        fillColor: '#14b8a6',
        color: '#14b8a6',
        weight: 1,
        opacity: 0.3,
        fillOpacity: 0.1,
      }).addTo(mapRef.current);

      userMarkerRef.current.on('remove', () => {
        accuracyCircle.remove();
      });
    }

    mapRef.current.setView([userLocation.latitude, userLocation.longitude], mapRef.current.getZoom());
  }, [userLocation]);

  useEffect(() => {
    if (!mapRef.current) return;

    const currentMarkers = new Set(coordinateMarkersRef.current.keys());
    const newCoordinateIds = new Set(coordinates.map(c => c.id));

    currentMarkers.forEach(id => {
      if (!newCoordinateIds.has(id)) {
        const marker = coordinateMarkersRef.current.get(id);
        if (marker) {
          marker.remove();
          coordinateMarkersRef.current.delete(id);
        }
      }
    });

    coordinates.forEach(coord => {
      if (!coordinateMarkersRef.current.has(coord.id)) {
        const isActive = activeCoordinates.some(ac => ac.id === coord.id);
        const color = mode === 'admin' ? (isActive ? '#a855f7' : '#3b82f6') : '#3b82f6';

        const icon = L.divIcon({
          className: 'coordinate-marker',
          html: `<div class="relative">
            <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg" style="background-color: ${color}"></div>
            <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]" style="border-top-color: ${color}"></div>
          </div>`,
          iconSize: [24, 32],
          iconAnchor: [12, 32],
        });

        const marker = L.marker([coord.latitude, coord.longitude], { icon }).addTo(mapRef.current!);
        
        marker.bindPopup(`
          <div class="font-mono text-sm">
            <div class="font-semibold mb-1">${isActive ? 'Active' : 'Inactive'}</div>
            <div>Lat: ${coord.latitude.toFixed(6)}</div>
            <div>Lng: ${coord.longitude.toFixed(6)}</div>
          </div>
        `);

        coordinateMarkersRef.current.set(coord.id, marker);
      } else {
        const marker = coordinateMarkersRef.current.get(coord.id);
        const isActive = activeCoordinates.some(ac => ac.id === coord.id);
        const color = mode === 'admin' ? (isActive ? '#a855f7' : '#3b82f6') : '#3b82f6';

        if (marker) {
          const icon = L.divIcon({
            className: 'coordinate-marker',
            html: `<div class="relative">
              <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg" style="background-color: ${color}"></div>
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]" style="border-top-color: ${color}"></div>
            </div>`,
            iconSize: [24, 32],
            iconAnchor: [12, 32],
          });
          marker.setIcon(icon);
        }
      }
    });
  }, [coordinates, activeCoordinates, mode]);

  useEffect(() => {
    if (!mapRef.current) return;

    activeCirclesRef.current.forEach(circle => circle.remove());
    activeCirclesRef.current.clear();

    if (mode === 'admin') {
      activeCoordinates.forEach(coord => {
        const circle = L.circle([coord.latitude, coord.longitude], {
          radius: radius,
          fillColor: '#a855f7',
          color: '#a855f7',
          weight: 2,
          opacity: 0.6,
          fillOpacity: 0.2,
          dashArray: '5, 5',
        }).addTo(mapRef.current!);

        activeCirclesRef.current.set(coord.id, circle);
      });
    }
  }, [activeCoordinates, radius, mode]);

  return (
    <div id="map" className="w-full h-full" data-testid="map-container" />
  );
}
