import { MapPin, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onRequestPermission: () => void;
  permissionDenied: boolean;
}

export function LocationPermissionModal({
  isOpen,
  onRequestPermission,
  permissionDenied,
}: LocationPermissionModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md z-[9999]" data-testid="modal-location-permission">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {permissionDenied ? (
              <AlertCircle className="h-8 w-8 text-destructive" />
            ) : (
              <MapPin className="h-8 w-8 text-primary" />
            )}
          </div>
          <DialogTitle className="text-center">
            {permissionDenied ? 'Location Access Denied' : 'Enable Location Access'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {permissionDenied ? (
              <>
                Location permission was denied. Please enable location access in your browser settings to use this application.
              </>
            ) : (
              <>
                This application requires access to your location to track your position in real-time and show relevant coordinates.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {!permissionDenied && (
          <Button onClick={onRequestPermission} className="w-full" data-testid="button-enable-location">
            <MapPin className="mr-2 h-4 w-4" />
            Enable Location
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
