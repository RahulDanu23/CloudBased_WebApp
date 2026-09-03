import { useState, useEffect } from 'react';
import { Loader2, Edit3, X } from 'lucide-react';

const RenameModal = ({ item, onClose, onRename }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || name === item.name) return;
    
    setIsSubmitting(true);
    await onRename(item, name.trim());
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div className="flex items-center gap-2 text-zinc-900 font-medium">
            <Edit3 className="w-5 h-5 text-zinc-500" />
            Rename {item.type ? 'File' : 'Folder'}
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <input 
            type="text" 
            autoFocus
            className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-900 mb-6"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose} 
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!name.trim() || name === item.name || isSubmitting}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameModal;
