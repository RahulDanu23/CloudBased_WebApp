import { useState, useRef, useEffect } from 'react';
import { FileText, MoreVertical, Image as ImageIcon, Video, FileMusic, FileArchive, Download, Share2, Edit2, Trash } from 'lucide-react';

const getFileIcon = (type) => {
  if (type.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
  if (type.startsWith('video/')) return <Video className="h-8 w-8 text-red-500" />;
  if (type.startsWith('audio/')) return <FileMusic className="h-8 w-8 text-yellow-500" />;
  if (type.includes('zip') || type.includes('tar') || type.includes('rar')) 
    return <FileArchive className="h-8 w-8 text-orange-500" />;
  return <FileText className="h-8 w-8 text-zinc-400" />;
};

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const FileItem = ({ file }) => {
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
    <div className="group relative flex flex-col items-center p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex w-full justify-end opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
        <button 
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {isMenuOpen && (
        <div 
          ref={menuRef}
          className="absolute right-4 top-10 w-48 bg-white rounded-lg shadow-lg border border-zinc-100 py-1 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
            <Download className="h-4 w-4" />
            Download
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
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
      
      <div className="flex-1 flex items-center justify-center my-4">
        {getFileIcon(file.type)}
      </div>
      
      <div className="w-full mt-auto text-center sm:text-left">
        <h3 className="text-sm font-medium text-zinc-900 truncate" title={file.name}>
          {file.name}
        </h3>
        <p className="text-xs text-zinc-500 mt-1">
          {formatSize(file.size)}
        </p>
      </div>
    </div>
  );
};

export default FileItem;
