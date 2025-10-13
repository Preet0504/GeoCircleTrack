import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useWebSocket } from '@/hooks/use-websocket';
import { MapView } from '@/components/map-view';
import { AdminControls } from '@/components/admin-controls';
import { UserPanel } from '@/components/user-panel';
import { ModeSelector } from '@/components/mode-selector';
import { LocationStatus } from '@/components/location-status';
import { LocationPermissionModal } from '@/components/location-permission-modal';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { calculateDistance, isWithinRadius } from '@/lib/distance';
import type { Coordinate, ActiveConfig } from '@shared/schema';

export default function Home() {
  const [mode, setMode] = useState<'admin' | 'user'>('admin');
  const [isAddingCoordinate, setIsAddingCoordinate] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [autoRotationInterval, setAutoRotationInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { location, hasPermission, requestPermission } = useGeolocation();
  const { subscribe, send } = useWebSocket();

  const { data: coordinates = [] } = useQuery<Coordinate[]>({
    queryKey: ['/api/coordinates'],
  });

  const { data: activeConfig } = useQuery<ActiveConfig>({
    queryKey: ['/api/config'],
  });

  const addCoordinateMutation = useMutation({
    mutationFn: async (data: { latitude: number; longitude: number }) => {
      return apiRequest('POST', '/api/coordinates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coordinates'] });
      toast({
        title: 'Coordinate added',
        description: 'New coordinate has been added successfully.',
      });
      setIsAddingCoordinate(false);
    },
  });

  const removeCoordinateMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/coordinates/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coordinates'] });
      toast({
        title: 'Coordinate removed',
        description: 'Coordinate has been removed successfully.',
      });
    },
  });

  const generateRandomMutation = useMutation({
    mutationFn: async (k: number) => {
      return apiRequest('POST', '/api/config/generate', { k });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
      toast({
        title: 'Random coordinates generated',
        description: 'New set of random coordinates has been selected.',
      });
    },
  });

  const updateRadiusMutation = useMutation({
    mutationFn: async (radius: number) => {
      return apiRequest('PATCH', '/api/config', { radius });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
    },
  });

  const updateIntervalMutation = useMutation({
    mutationFn: async (timeInterval: number) => {
      return apiRequest('PATCH', '/api/config', { timeInterval });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
    },
  });

  useEffect(() => {
    const unsubscribeConfig = subscribe('config_update', (data: ActiveConfig) => {
      queryClient.setQueryData(['/api/config'], data);
    });

    const unsubscribeCoords = subscribe('coordinates_update', (data: Coordinate[]) => {
      queryClient.setQueryData(['/api/coordinates'], data);
    });

    const unsubscribeActive = subscribe('active_coordinates_update', () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
    });

    return () => {
      unsubscribeConfig();
      unsubscribeCoords();
      unsubscribeActive();
    };
  }, [subscribe]);

  useEffect(() => {
    if (location) {
      send({
        type: 'location_update',
        data: {
          latitude: location.latitude,
          longitude: location.longitude,
          mode,
        },
      });
    }
  }, [location, mode, send]);

  useEffect(() => {
    if (autoRotationInterval) {
      clearInterval(autoRotationInterval);
    }

    if (isAutoRotating && activeConfig && coordinates.length > 0) {
      const interval = setInterval(() => {
        const k = activeConfig.activeCoordinateIds.length || 3;
        generateRandomMutation.mutate(k);
      }, activeConfig.timeInterval * 1000);

      setAutoRotationInterval(interval);
    }

    return () => {
      if (autoRotationInterval) {
        clearInterval(autoRotationInterval);
      }
    };
  }, [isAutoRotating, activeConfig?.timeInterval]);

  const handleMapClick = (lat: number, lng: number) => {
    if (isAddingCoordinate) {
      addCoordinateMutation.mutate({ latitude: lat, longitude: lng });
    }
  };

  const activeCoordinates = coordinates.filter(coord =>
    activeConfig?.activeCoordinateIds.includes(coord.id)
  );

  const visibleCoordinates =
    mode === 'user' && location && activeConfig
      ? (() => {
          // Find all coordinates within radius
          const coordinatesWithinRadius = activeCoordinates.filter(coord =>
            isWithinRadius(
              location.latitude,
              location.longitude,
              coord.latitude,
              coord.longitude,
              activeConfig.radius
            )
          );
          
          // If user is inside any radius, show only the nearest one
          if (coordinatesWithinRadius.length > 0) {
            const nearest = coordinatesWithinRadius.reduce((prev, curr) => {
              const prevDist = calculateDistance(
                location.latitude,
                location.longitude,
                prev.latitude,
                prev.longitude
              );
              const currDist = calculateDistance(
                location.latitude,
                location.longitude,
                curr.latitude,
                curr.longitude
              );
              return currDist < prevDist ? curr : prev;
            });
            return [nearest]; // Return only the nearest coordinate
          }
          
          return []; // Return empty if not inside any radius
        })()
      : [];

  const isInsideRadius = visibleCoordinates.length > 0;

  const nearestDistance =
    location && activeCoordinates.length > 0
      ? Math.min(
          ...activeCoordinates.map(coord =>
            calculateDistance(
              location.latitude,
              location.longitude,
              coord.latitude,
              coord.longitude
            )
          )
        )
      : null;

  return (
    <div className="h-screen flex flex-col">
      <header className="h-14 md:h-16 border-b border-border bg-card flex items-center justify-between px-3 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <h1 className="text-lg md:text-xl font-semibold">GeoTracker</h1>
          <ModeSelector mode={mode} onModeChange={setMode} />
        </div>
        <LocationStatus hasPermission={hasPermission === true} isTracking={location !== null} />
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Desktop: Left Admin panel, Mobile: Hidden */}
        {mode === 'admin' && (
          <div className="hidden md:block">
            <AdminControls
              coordinates={coordinates}
              activeConfig={activeConfig || null}
              isAddingCoordinate={isAddingCoordinate}
              onAddCoordinateToggle={() => setIsAddingCoordinate(!isAddingCoordinate)}
              onRemoveCoordinate={(id) => removeCoordinateMutation.mutate(id)}
              onGenerateRandom={(k) => generateRandomMutation.mutate(k)}
              onUpdateRadius={(radius) => updateRadiusMutation.mutate(radius)}
              onUpdateInterval={(interval) => updateIntervalMutation.mutate(interval)}
              onToggleAutoRotation={setIsAutoRotating}
              isAutoRotating={isAutoRotating}
            />
          </div>
        )}

        {/* Map - Full width on mobile */}
        <div className="flex-1 relative">
          <MapView
            userLocation={location}
            coordinates={mode === 'admin' ? coordinates : visibleCoordinates}
            activeCoordinates={activeCoordinates}
            radius={activeConfig?.radius || 500}
            mode={mode}
            onMapClick={handleMapClick}
            isAddingCoordinate={isAddingCoordinate}
          />

          {/* Mobile: Floating panel at bottom */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 bg-card border-t border-card-border max-h-[40vh] overflow-y-auto">
            {mode === 'admin' && (
              <AdminControls
                coordinates={coordinates}
                activeConfig={activeConfig || null}
                isAddingCoordinate={isAddingCoordinate}
                onAddCoordinateToggle={() => setIsAddingCoordinate(!isAddingCoordinate)}
                onRemoveCoordinate={(id) => removeCoordinateMutation.mutate(id)}
                onGenerateRandom={(k) => generateRandomMutation.mutate(k)}
                onUpdateRadius={(radius) => updateRadiusMutation.mutate(radius)}
                onUpdateInterval={(interval) => updateIntervalMutation.mutate(interval)}
                onToggleAutoRotation={setIsAutoRotating}
                isAutoRotating={isAutoRotating}
                isMobile={true}
              />
            )}
            {mode === 'user' && (
              <UserPanel
                visibleCoordinates={visibleCoordinates}
                isInsideRadius={isInsideRadius}
                nearestDistance={nearestDistance}
                isMobile={true}
              />
            )}
          </div>
        </div>

        {/* Desktop: Right User panel, Mobile: Hidden */}
        {mode === 'user' && (
          <div className="hidden md:block">
            <UserPanel
              visibleCoordinates={visibleCoordinates}
              isInsideRadius={isInsideRadius}
              nearestDistance={nearestDistance}
            />
          </div>
        )}
      </div>

      <LocationPermissionModal
        isOpen={hasPermission === null || hasPermission === false}
        onRequestPermission={requestPermission}
        permissionDenied={hasPermission === false}
      />
    </div>
  );
}
