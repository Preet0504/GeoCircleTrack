import { MapPin, MapPinOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LocationStatusProps {
  hasPermission: boolean;
  isTracking: boolean;
}

export function LocationStatus({ hasPermission, isTracking }: LocationStatusProps) {
  if (!hasPermission) {
    return (
      <Badge variant="destructive" className="gap-2" data-testid="status-location-disabled">
        <MapPinOff className="h-3 w-3" />
        Location Disabled
      </Badge>
    );
  }

  if (!isTracking) {
    return (
      <Badge variant="secondary" className="gap-2" data-testid="status-acquiring">
        <MapPin className="h-3 w-3" />
        Acquiring...
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="gap-2 bg-success" data-testid="status-active">
      <div className="relative">
        <MapPin className="h-3 w-3" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
      </div>
      Active
    </Badge>
  );
}
