import { X, History, Download, RotateCcw } from 'lucide-react';

const VersionHistoryModal = ({ item, onClose }) => {
  if (!item) return null;

  // Mock versions
  const versions = [
    { id: 'v3', name: 'Current Version', date: 'Today, 10:45 AM', size: '2.5 MB', current: true },
    { id: 'v2', name: 'Version 2', date: 'Yesterday, 3:20 PM', size: '2.4 MB', current: false },
    { id: 'v1', name: 'Version 1', date: 'Oct 24, 9:15 AM', size: '2.1 MB', current: false }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
          <div className="flex items-center gap-2 text-zinc-900">
            <History className="h-5 w-5" />
            <h3 className="font-semibold">Version History</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-5">
          <p className="text-sm font-medium text-zinc-900 mb-4 truncate">
            {item.name}
          </p>
          
          <div className="space-y-4">
            {versions.map((v) => (
              <div key={v.id} className="flex items-start justify-between p-3 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-900">{v.name}</p>
                    {v.current && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{v.date} • {v.size}</p>
                </div>
                
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors" title="Download this version">
                    <Download className="h-4 w-4" />
                  </button>
                  {!v.current && (
                    <button className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Restore this version">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryModal;
