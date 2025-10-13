import { Button } from '@/components/ui/button';
import { Shield, User } from 'lucide-react';

interface ModeSelectorProps {
  mode: 'admin' | 'user';
  onModeChange: (mode: 'admin' | 'user') => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 md:gap-2 bg-muted/50 p-1 rounded-lg">
      <Button
        variant={mode === 'admin' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('admin')}
        className="gap-1 md:gap-2 px-2 md:px-3"
        data-testid="button-mode-admin"
      >
        <Shield className="h-4 w-4" />
        <span className="hidden sm:inline">Admin</span>
      </Button>
      <Button
        variant={mode === 'user' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('user')}
        className="gap-1 md:gap-2 px-2 md:px-3"
        data-testid="button-mode-user"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">User</span>
      </Button>
    </div>
  );
}
