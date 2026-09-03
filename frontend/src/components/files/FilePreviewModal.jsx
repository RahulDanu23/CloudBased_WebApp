import { useState, useEffect } from 'react';
import { X, Download, Share2, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const FilePreviewModal = ({ file, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!file) return;
    if (file.url) {
      setPreviewUrl(file.url);
      return;
    }
    
    const fetchSignedUrl = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/files/${file.id}`);
        setPreviewUrl(res.data.signedUrl);
      } catch (error) {
        console.error("Failed to load preview:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSignedUrl();
  }, [file]);

  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  const isPDF = file.type === 'application/pdf';

  const handleDownload = (e) => {
    e.stopPropagation();
    if (previewUrl) {
      const a = document.createElement('a');
      a.href = previewUrl;
      a.download = file.name || 'download';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("No download URL available yet");
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
            disabled={!previewUrl}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading preview...</p>
          </div>
        ) : isImage ? (
          <img 
            src={previewUrl || "https://images.unsplash.com/photo-1506744626753-eda818c6cce5?w=1200"} 
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
          />
        ) : isVideo ? (
          <video 
            src={previewUrl} 
            controls 
            className="max-w-full max-h-full rounded-md shadow-2xl outline-none"
          />
        ) : isAudio ? (
          <audio 
            src={previewUrl} 
            controls 
            className="w-full max-w-md shadow-2xl outline-none"
          />
        ) : isPDF ? (
          <div className="w-full max-w-5xl h-full bg-white rounded-lg flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <object data={previewUrl} type="application/pdf" className="w-full h-full">
                <iframe src={previewUrl} className="w-full h-full border-none">
                  <p>This browser does not support PDFs. Please download the PDF to view it.</p>
                </iframe>
              </object>
            ) : (
              <p className="text-zinc-500">Failed to load PDF preview.</p>
            )}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg max-w-2xl w-full text-center space-y-4 shadow-2xl">
            <p className="text-zinc-900 font-medium">No preview available</p>
            <p className="text-sm text-zinc-500">This file type cannot be previewed in the browser.</p>
            <button 
              onClick={handleDownload}
              disabled={!previewUrl}
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
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
