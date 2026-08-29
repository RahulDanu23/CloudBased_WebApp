import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ path = [], onNavigate }) => {
  return (
    <nav className="flex items-center text-sm text-zinc-500 mb-6">
      <button 
        onClick={() => onNavigate(-1)}
        className="hover:text-zinc-900 transition-colors flex items-center"
      >
        <Home className="h-4 w-4" />
      </button>
      
      {path.map((folder, index) => (
        <div key={folder.id} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
          <button 
            onClick={() => onNavigate(index)}
            className={`hover:text-zinc-900 transition-colors truncate max-w-[150px] ${
              index === path.length - 1 ? 'text-zinc-900 font-medium' : ''
            }`}
          >
            {folder.name}
          </button>
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
