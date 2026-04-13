import { 
  Home, Calculator, Database, FolderKanban, 
  BookOpen, Settings, X, Clock 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';

const menuItems = [
  { icon: Home,        label: 'Dashboard',          path: '/' },
  { icon: Calculator,  label: 'Toolbox',             path: '/tools' },
  { icon: Database,    label: 'Database Komponen',   path: '/database' },
  { icon: FolderKanban,label: 'Portfolio Project',   path: '/projects' },
  { icon: Clock,       label: 'Riwayat Kalkulasi',   path: '/history' },
  { icon: BookOpen,    label: 'Quiz & Assessment',   path: '/quiz' },
  { icon: Settings,    label: 'Pengaturan',          path: '/settings' },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r
        transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <h2 className="font-bold">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-1 overflow-y-auto flex-grow">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Branding Footer */}
        <div className="p-6 border-t bg-gray-50/50">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <span className="text-xs font-black text-gray-800 tracking-tighter uppercase">WLDN-Soft</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">
              © 2026 Energy Intelligence Suite
            </p>
            <div className="mt-2 text-[9px] text-gray-400/80 bg-white px-2 py-1 rounded border border-gray-100 w-fit">
              v1.0.0 Stable Build
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
