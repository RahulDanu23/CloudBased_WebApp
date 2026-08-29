import { CheckCircle2, File, X } from 'lucide-react';

const UploadProgress = ({ uploads, onClose }) => {
  if (!uploads || uploads.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-50">
      <div className="bg-zinc-900 px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">
          Uploading {uploads.length} {uploads.length === 1 ? 'item' : 'items'}
        </h3>
        <button 
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="max-h-60 overflow-y-auto p-2">
        {uploads.map((upload) => (
          <div key={upload.id} className="flex items-center gap-3 p-2">
            <div className="text-zinc-400 flex-shrink-0">
              {upload.progress === 100 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <File className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-900 truncate">{upload.name}</p>
              {upload.progress < 100 ? (
                <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="bg-zinc-900 h-full transition-all duration-300"
                    style={{ width: `${upload.progress}%` }}
                  ></div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 mt-0.5">Complete</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadProgress;
