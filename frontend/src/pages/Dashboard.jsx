import { useState, useCallback, useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import FolderItem from '../components/files/FolderItem';
import FileItem from '../components/files/FileItem';
import UploadProgress from '../components/files/UploadProgress';
import FilePreviewModal from '../components/files/FilePreviewModal';
import ShareModal from '../components/modals/ShareModal';
import VersionHistoryModal from '../components/modals/VersionHistoryModal';
import SortDropdown from '../components/ui/SortDropdown';
import { UploadCloud } from 'lucide-react';

// Mock Data
const MOCK_FOLDERS = [
  { id: '1', name: 'Documents' },
  { id: '2', name: 'Images' },
  { id: '3', name: 'Work Projects' },
  { id: '4', name: 'Personal' }
];

const MOCK_FILES = [
  { id: '1', name: 'Q3_Report.pdf', size: 1024 * 1024 * 2.5, type: 'application/pdf' },
  { id: '2', name: 'presentation_v2.pptx', size: 1024 * 1024 * 15, type: 'application/vnd.ms-powerpoint' },
  { id: '3', name: 'vacation_photo.jpg', size: 1024 * 1024 * 4.2, type: 'image/jpeg' },
  { id: '4', name: 'meeting_recording.mp4', size: 1024 * 1024 * 150, type: 'video/mp4' },
  { id: '5', name: 'design_assets.zip', size: 1024 * 1024 * 45, type: 'application/zip' }
];

const Dashboard = () => {
  const [currentPath, setCurrentPath] = useState([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  
  // New State for Day 10
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [shareItem, setShareItem] = useState(null);
  const [versionItem, setVersionItem] = useState(null);
  
  // Search and Sort (Day 12)
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  // We'll move MOCK_FILES into state so we can add uploads
  const [files, setFiles] = useState(MOCK_FILES);

  // Derived state for filtered and sorted files
  const filteredAndSortedFiles = useMemo(() => {
    let result = files;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(file => file.name.toLowerCase().includes(lowerQuery));
    }

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'size') {
        return b.size - a.size; // Largest first
      } else if (sortBy === 'date') {
        // Mock data doesn't have dates, so fallback to id comparison for demo
        return b.id.localeCompare(a.id);
      }
      return 0;
    });

    return result;
  }, [files, searchQuery, sortBy]);

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return MOCK_FOLDERS;
    const lowerQuery = searchQuery.toLowerCase();
    return MOCK_FOLDERS.filter(folder => folder.name.toLowerCase().includes(lowerQuery));
  }, [searchQuery]);
  
  const handleFolderClick = (folder) => {
    setCurrentPath([...currentPath, folder]);
  };

  const handleBreadcrumbNavigate = (index) => {
    if (index === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, index + 1));
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newUploads = Array.from(e.dataTransfer.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        progress: 0
      }));
      
      setUploads(prev => [...prev, ...newUploads]);
      
      // Simulate upload progress
      newUploads.forEach(upload => {
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += Math.random() * 20;
          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(interval);
            
            // Add to files list when complete
            setFiles(prev => [...prev, { ...upload, id: Math.random().toString(36).substr(2, 9) }]);
          }
          
          setUploads(prev => prev.map(u => 
            u.id === upload.id ? { ...u, progress: currentProgress } : u
          ));
        }, 300);
      });
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa]">
      <Sidebar onNewClick={() => setIsNewModalOpen(true)} />
      
      <div 
        className="flex-1 flex flex-col min-w-0 overflow-hidden relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Navbar searchQuery={searchQuery} onSearch={setSearchQuery} />
        
        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-40 bg-zinc-900/10 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-zinc-900 m-4 rounded-3xl transition-all">
            <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center pointer-events-none">
              <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="h-8 w-8 text-zinc-900" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-900">Drop files to upload</h2>
              <p className="text-zinc-500 mt-2">Instantly add them to {currentPath.length > 0 ? currentPath[currentPath.length - 1].name : 'My Drive'}</p>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
                {currentPath.length > 0 ? currentPath[currentPath.length - 1].name : 'My Drive'}
              </h1>
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
            
            <Breadcrumbs path={currentPath} onNavigate={handleBreadcrumbNavigate} />
            
            {/* Folders Section */}
            {filteredFolders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-medium text-zinc-500 mb-3">Folders</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFolders.map((folder) => (
                    <FolderItem 
                      key={folder.id} 
                      folder={folder} 
                      onClick={() => handleFolderClick(folder)} 
                      onShare={(folder) => setShareItem(folder)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Files Section */}
            {filteredAndSortedFiles.length > 0 ? (
              <div>
                <h2 className="text-sm font-medium text-zinc-500 mb-3">Files</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredAndSortedFiles.map((file) => (
                    <FileItem 
                      key={file.id} 
                      file={file} 
                      onClick={() => setPreviewFile(file)}
                      onShare={(file) => setShareItem(file)}
                      onVersionHistory={(file) => setVersionItem(file)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-zinc-500">No matching files or folders found.</p>
              </div>
            )}
            
          </div>
        </main>

        <UploadProgress uploads={uploads.filter(u => u.progress < 100 || u.progress === 100)} onClose={() => setUploads([])} />
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
        <ShareModal item={shareItem} onClose={() => setShareItem(null)} />
        <VersionHistoryModal item={versionItem} onClose={() => setVersionItem(null)} />

        {/* Simple Modal overlay for "+ New" */}
        {isNewModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white rounded-xl shadow-lg border border-zinc-200 w-full max-w-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="font-medium text-zinc-900">Create New</h3>
                <button 
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              </div>
              <div className="p-2">
                <button 
                  onClick={() => setIsNewModalOpen(false)}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors"
                >
                  New Folder
                </button>
                <button 
                  onClick={() => setIsNewModalOpen(false)}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors"
                >
                  File Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
