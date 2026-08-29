import { useState, useRef, useEffect } from 'react';
import { Folder, MoreVertical, Edit2, Trash, Share2 } from 'lucide-react';

const FolderItem = ({ folder, onClick, onShare }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className="group relative flex items-center p-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => onClick && onClick(folder)}
    >
      <div className="flex-shrink-0 mr-3">
        <Folder className="h-6 w-6 text-zinc-900 fill-zinc-100" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-zinc-900 truncate">
          {folder.name}
        </h3>
      </div>

      <button 
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all focus:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(!isMenuOpen);
        }}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isMenuOpen && (
        <div 
          ref={menuRef}
          className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-zinc-100 py-1 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(false);
              if (onShare) onShare(folder);
            }}
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
            <Edit2 className="h-4 w-4" />
            Rename
          </button>
          <div className="h-px bg-zinc-100 my-1"></div>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
            <Trash className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default FolderItem;
