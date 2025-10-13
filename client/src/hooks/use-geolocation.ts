import { useState, useEffect } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const requestPermission = () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser');
      setHasPermission(false);
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setHasPermission(true);
        setError(null);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError(error.message);
        setHasPermission(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    );

    setWatchId(id);
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    hasPermission,
    error,
    requestPermission,
  };
}
