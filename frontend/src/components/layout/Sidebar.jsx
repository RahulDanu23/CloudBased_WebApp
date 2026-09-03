import { 
  Cloud, 
  Home, 
  Clock, 
  Star, 
  Trash2, 
  HardDrive,
  Users
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useStorage } from '../../context/StorageContext';

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 GB';
  const k = 1024;
  const gb = bytes / (k * k * k);
  return `${gb.toFixed(1)} GB`;
};

const Sidebar = ({ onNewClick, isShared = false }) => {
  const { usedStorage, TOTAL_STORAGE } = useStorage();

  const navItems = [
    { icon: Home, label: 'My Drive', path: '/' },
    { icon: Users, label: 'Shared with me', path: '/shared' },
    { icon: Clock, label: 'Recent', path: '/recent' },
    { icon: Star, label: 'Starred', path: '/starred' },
    { icon: Trash2, label: 'Trash', path: '/trash' },
  ];

  return (
    <aside className="w-64 bg-[#fbfbfb] border-r border-zinc-200 flex-shrink-0 hidden md:flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 mb-4">
        <div className="flex items-center gap-2 text-zinc-900">
          <Cloud className="h-6 w-6 text-zinc-900 fill-zinc-900" />
          <span className="font-semibold text-lg tracking-tight">CloudDrive</span>
        </div>
      </div>

      <div className="px-3 mb-6">
        <button 
          onClick={onNewClick}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          + New
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-zinc-200/50 text-zinc-900 font-medium'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-200">
        <div className="flex items-center gap-2 text-zinc-600 text-sm mb-2">
          <HardDrive className="h-4 w-4" />
          {isShared ? (
            <span>Storage is shared with you</span>
          ) : (
            <span>{formatBytes(TOTAL_STORAGE - usedStorage)} left of {formatBytes(TOTAL_STORAGE)}</span>
          )}
        </div>
        {!isShared && (
          <div className="w-full bg-zinc-200 rounded-full h-1.5 mt-2">
            <div 
              className="bg-blue-500 h-1.5 rounded-full" 
              style={{ width: `${Math.min(100, (usedStorage / TOTAL_STORAGE) * 100)}%` }}
            ></div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
