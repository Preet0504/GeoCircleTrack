import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, CheckCircle2, XCircle } from 'lucide-react';
import type { Coordinate } from '@shared/schema';

interface UserPanelProps {
  visibleCoordinates: Coordinate[];
  isInsideRadius: boolean;
  nearestDistance: number | null;
}

export function UserPanel({ visibleCoordinates, isInsideRadius, nearestDistance }: UserPanelProps) {
  return (
    <div className="w-72 bg-card border-l border-card-border h-full overflow-y-auto" data-testid="user-panel">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">User View</h2>
          <p className="text-sm text-muted-foreground">Your proximity status</p>
        </div>

        <Card>
          <CardHeader className="space-y-0 pb-4">
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {isInsideRadius ? (
                <>
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-success">Inside Radius</p>
                    <p className="text-sm text-muted-foreground">Coordinates are visible</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-shrink-0">
                    <XCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">Outside Radius</p>
                    <p className="text-sm text-muted-foreground">No coordinates visible</p>
                  </div>
                </>
              )}
            </div>
            
            {nearestDistance !== null && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Nearest Coordinate</p>
                <p className="text-3xl font-semibold tabular-nums">{Math.round(nearestDistance)}<span className="text-base text-muted-foreground ml-1">m</span></p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-4">
            <CardTitle className="text-lg">
              Visible Coordinates
              <Badge variant="secondary" className="ml-2">{visibleCoordinates.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {visibleCoordinates.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-12">
                  Move closer to see coordinates
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleCoordinates.map((coord, idx) => (
                    <div
                      key={coord.id}
                      className="flex items-start gap-2 p-3 rounded-md bg-primary/10 border border-primary/20"
                      data-testid={`visible-coordinate-${coord.id}`}
                    >
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Coordinate #{idx + 1}</p>
                        <p className="font-mono text-sm">
                          {coord.latitude.toFixed(6)}
                        </p>
                        <p className="font-mono text-sm">
                          {coord.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
