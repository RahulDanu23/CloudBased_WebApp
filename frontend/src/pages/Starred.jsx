import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { Star, Loader2 } from 'lucide-react';
import api from '../api/axios';
import FileItem from '../components/files/FileItem';
import FolderItem from '../components/files/FolderItem';
import FilePreviewModal from '../components/files/FilePreviewModal';

const Starred = () => {
  const [stars, setStars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);

  const fetchStars = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/stars');
      setStars(res.data.stars || []);
    } catch (err) {
      console.error("Fetch stars error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStars();
  }, []);

  const handleToggleStar = async (item, type) => {
    try {
      await api.post(`/stars/${type}/${item.id}`);
      // Remove from list since this is the starred view
      setStars(prev => prev.filter(s => s.resource_id !== item.id));
    } catch (err) {
      console.error("Toggle star error:", err);
    }
  };

  const handleDownload = async (file) => {
    try {
      const res = await api.get(`/files/${file.id}`);
      if (res.data.signedUrl) {
        const a = document.createElement('a');
        a.href = res.data.signedUrl;
        a.download = file.name || 'download';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file.");
    }
  };

  const starredFolders = stars.filter(s => s.resource_type === 'folder').map(s => s.resource);
  const starredFiles = stars.filter(s => s.resource_type === 'file').map(s => s.resource);

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Starred</h1>
                <p className="text-sm text-zinc-500 mt-1">Your starred files and folders</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Loading starred items...</p>
              </div>
            ) : stars.length > 0 ? (
              <>
                {starredFolders.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-sm font-medium text-zinc-500 mb-3">Folders</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {starredFolders.map(folder => (
                        <FolderItem 
                          key={folder.id} 
                          folder={folder} 
                          isStarred={true}
                          onToggleStar={handleToggleStar}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {starredFiles.length > 0 && (
                  <div>
                    <h2 className="text-sm font-medium text-zinc-500 mb-3">Files</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {starredFiles.map(file => (
                        <FileItem 
                          key={file.id} 
                          file={file} 
                          onClick={() => setPreviewFile(file)}
                          isStarred={true}
                          onToggleStar={handleToggleStar}
                          onDownload={handleDownload}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <Star className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                <h3 className="text-lg font-medium text-zinc-900">Empty</h3>
                <p className="text-zinc-500 mt-1">No starred files to show.</p>
              </div>
            )}
          </div>
        </main>
        
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      </div>
    </div>
  );
};

export default Starred;
