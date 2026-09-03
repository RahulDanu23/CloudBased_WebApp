import { X, Download, Share2 } from 'lucide-react';

const FilePreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  const isPDF = file.type === 'application/pdf';

  const handleDownload = (e) => {
    e.stopPropagation();
    if (file.url) {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name || 'download';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("No download URL available");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="absolute top-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent z-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-white font-medium truncate max-w-md">
          {file.name}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
          <button 
            onClick={handleDownload}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <Download className="h-5 w-5" />
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors ml-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <div 
        className="w-full h-full pt-16 pb-4 px-4 flex items-center justify-center relative"
        onClick={e => e.stopPropagation()}
      >
        {isImage ? (
          <img 
            src={file.url || "https://images.unsplash.com/photo-1506744626753-eda818c6cce5?w=1200"} 
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
          />
        ) : isVideo ? (
          <video 
            src={file.url} 
            controls 
            className="max-w-full max-h-full rounded-md shadow-2xl outline-none"
          />
        ) : isAudio ? (
          <audio 
            src={file.url} 
            controls 
            className="w-full max-w-md shadow-2xl outline-none"
          />
        ) : isPDF ? (
          <div className="w-full max-w-5xl h-full bg-white rounded-lg flex items-center justify-center overflow-hidden">
            {file.url ? (
              <object data={file.url} type="application/pdf" className="w-full h-full">
                <iframe src={file.url} className="w-full h-full border-none">
                  <p>This browser does not support PDFs. Please download the PDF to view it.</p>
                </iframe>
              </object>
            ) : (
              <p className="text-zinc-500">No URL available to preview PDF</p>
            )}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg max-w-2xl w-full text-center space-y-4 shadow-2xl">
            <p className="text-zinc-900 font-medium">No preview available</p>
            <p className="text-sm text-zinc-500">This file type cannot be previewed in the browser.</p>
            <button 
              onClick={handleDownload}
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Download File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreviewModal;
