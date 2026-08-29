import { Search, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center w-full max-w-2xl">
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg text-sm bg-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-colors"
            placeholder="Search files, folders..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        <button className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors" title="Help">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors" title="Settings">
          <Settings className="h-5 w-5" />
        </button>
        <button 
          onClick={handleLogout}
          className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" 
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
        <div className="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-medium text-sm ml-2 cursor-pointer">
          U
        </div>
      </div>
    </header>
  );
};

export default Navbar;
