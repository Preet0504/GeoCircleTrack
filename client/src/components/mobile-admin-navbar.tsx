import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Plus, Shuffle, Trash2, Play, Pause, Settings, Map } from 'lucide-react';
import type { Coordinate, ActiveConfig } from '@shared/schema';

interface MobileAdminNavbarProps {
  coordinates: Coordinate[];
  activeConfig: ActiveConfig | null;
  isAddingCoordinate: boolean;
  onAddCoordinateToggle: () => void;
  onRemoveCoordinate: (id: string) => void;
  onGenerateRandom: (k: number) => void;
  onUpdateRadius: (radius: number) => void;
  onUpdateInterval: (interval: number) => void;
  onToggleAutoRotation: (enabled: boolean) => void;
  isAutoRotating: boolean;
}

export function MobileAdminNavbar({
  coordinates,
  activeConfig,
  isAddingCoordinate,
  onAddCoordinateToggle,
  onRemoveCoordinate,
  onGenerateRandom,
  onUpdateRadius,
  onUpdateInterval,
  onToggleAutoRotation,
  isAutoRotating,
}: MobileAdminNavbarProps) {
  const [k, setK] = useState(3);
  const [radius, setRadius] = useState(activeConfig?.radius || 500);
  const [interval, setInterval] = useState(activeConfig?.timeInterval || 30);

  useEffect(() => {
    if (activeConfig?.radius !== undefined) {
      setRadius(activeConfig.radius);
    }
  }, [activeConfig?.radius]);

  useEffect(() => {
    if (activeConfig?.timeInterval !== undefined) {
      setInterval(activeConfig.timeInterval);
    }
  }, [activeConfig?.timeInterval]);

  const handleRadiusChange = (value: number[]) => {
    setRadius(value[0]);
  };

  const handleRadiusCommit = () => {
    onUpdateRadius(radius);
  };

  const handleGenerateRandom = () => {
    if (k > coordinates.length) {
      alert(`Cannot generate ${k} coordinates. Only ${coordinates.length} available.`);
      return;
    }
    onGenerateRandom(k);
  };

  return (
    <div className="w-full bg-card border-t-2 border-card-border shadow-2xl" data-testid="mobile-admin-navbar">
      <Tabs defaultValue="coords" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-12 rounded-none border-b" data-testid="admin-tabs">
          <TabsTrigger value="coords" className="gap-2" data-testid="tab-coords">
            <Map className="h-4 w-4" />
            Coordinates
          </TabsTrigger>
          <TabsTrigger value="random" className="gap-2" data-testid="tab-random">
            <Shuffle className="h-4 w-4" />
            Random
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coords" className="p-4 space-y-3 max-h-[50vh] overflow-y-auto" data-testid="tab-content-coords">
          <Card className="shadow-sm">
            <CardHeader className="space-y-0 pb-2 p-3">
              <CardTitle className="text-base">Add Coordinates</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <Button 
                onClick={onAddCoordinateToggle}
                variant={isAddingCoordinate ? "default" : "outline"}
                className="w-full"
                data-testid="button-add-coordinate"
              >
                <Plus className="mr-2 h-4 w-4" />
                {isAddingCoordinate ? 'Click Map to Add' : 'Add Coordinate'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                {isAddingCoordinate ? 'Click anywhere on the map to place a coordinate' : 'Enable to add new coordinates'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="space-y-0 pb-2 p-3">
              <CardTitle className="text-base">All Coordinates ({coordinates.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ScrollArea className="h-48">
                {coordinates.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    No coordinates added yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {coordinates.map((coord) => (
                      <div
                        key={coord.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover-elevate"
                        data-testid={`coordinate-item-${coord.id}`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="font-mono text-xs truncate">
                            {coord.latitude.toFixed(4)}, {coord.longitude.toFixed(4)}
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onRemoveCoordinate(coord.id)}
                          data-testid={`button-remove-${coord.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="random" className="p-4 space-y-3" data-testid="tab-content-random">
          <Card className="shadow-sm">
            <CardHeader className="space-y-0 pb-2 p-3">
              <CardTitle className="text-base">Generate Random K</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div>
                <Label htmlFor="k-value" className="text-sm">Number of coordinates (k)</Label>
                <Input
                  id="k-value"
                  type="number"
                  min="1"
                  max={coordinates.length || 1}
                  value={k}
                  onChange={(e) => setK(Number(e.target.value))}
                  className="mt-1"
                  data-testid="input-k-value"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Max: {coordinates.length} available
                </p>
              </div>
              <Button 
                onClick={handleGenerateRandom}
                disabled={coordinates.length === 0}
                className="w-full"
                data-testid="button-generate-random"
              >
                <Shuffle className="mr-2 h-4 w-4" />
                Generate Random {k}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="p-4 space-y-3" data-testid="tab-content-settings">
          <Card className="shadow-sm">
            <CardHeader className="space-y-0 pb-2 p-3">
              <CardTitle className="text-base">Radius Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm">Radius (meters)</Label>
                  <span className="text-sm font-mono font-semibold">{radius}m</span>
                </div>
                <Slider
                  value={[radius]}
                  min={50}
                  max={5000}
                  step={50}
                  onValueChange={handleRadiusChange}
                  onValueCommit={handleRadiusCommit}
                  className="w-full"
                  data-testid="slider-radius"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Circle radius around each active coordinate
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="space-y-0 pb-2 p-3">
              <CardTitle className="text-base">Auto Rotation</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div>
                <Label htmlFor="interval" className="text-sm">Interval (seconds)</Label>
                <Input
                  id="interval"
                  type="number"
                  min="5"
                  max="300"
                  value={interval}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setInterval(val);
                    onUpdateInterval(val);
                  }}
                  className="mt-1"
                  data-testid="input-interval"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Time between coordinate rotations
                </p>
              </div>
              <Button
                onClick={() => onToggleAutoRotation(!isAutoRotating)}
                variant={isAutoRotating ? "default" : "outline"}
                className="w-full"
                data-testid="button-toggle-rotation"
              >
                {isAutoRotating ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Stop Rotation
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Rotation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
