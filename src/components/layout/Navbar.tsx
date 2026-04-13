import { Menu, Sun } from 'lucide-react';
import { Button } from '../ui/button';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-16 items-center px-4 gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Sun className="h-6 w-6 text-amber-500" />
          <h1 className="text-xl font-bold text-blue-600">PLTS Training Tools</h1>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-600">v1.0.0 Offline</span>
        </div>
      </div>
    </header>
  );
}
