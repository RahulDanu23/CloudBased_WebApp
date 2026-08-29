import { useState, useCallback, useMemo, useEffect } from 'react';
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
import { UploadCloud, Loader2 } from 'lucide-react';
import api from '../api/axios';

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
  
  // Real data state
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Fetch data when path changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const folderId = currentPath.length === 0 ? 'root' : currentPath[currentPath.length - 1].id;
        const res = await api.get(`/folders/${folderId}`);
        setFolders(res.data.children.folders || []);
        setFiles(res.data.children.files || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [currentPath]);

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
    if (!searchQuery) return folders;
    const lowerQuery = searchQuery.toLowerCase();
    return folders.filter(folder => folder.name.toLowerCase().includes(lowerQuery));
  }, [searchQuery, folders]);
  
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

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const folderId = currentPath.length === 0 ? null : currentPath[currentPath.length - 1].id;
      
      const newUploads = droppedFiles.map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        name: f.name,
        progress: 0,
        file: f
      }));
      
      setUploads(prev => [...prev, ...newUploads]);

      // Upload each file
      for (const uploadItem of newUploads) {
        const formData = new FormData();
        formData.append('file', uploadItem.file);
        if (folderId) formData.append('folderId', folderId);

        try {
          const res = await api.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploads(current => current.map(u => 
                u.id === uploadItem.id ? { ...u, progress: percentCompleted } : u
              ));
            }
          });

          // File uploaded successfully, add to UI
          setFiles(prev => [res.data.file, ...prev]);
        } catch (err) {
          console.error("Upload failed for", uploadItem.name, err);
          // Just mark as failed in UI or remove it (keeping simple here)
          setUploads(current => current.filter(u => u.id !== uploadItem.id));
        }
      }
    }
  };

  const handleDeleteItem = async (item, type) => {
    try {
      const endpoint = type === 'folder' ? `/folders/${item.id}` : `/files/${item.id}`;
      await api.delete(endpoint);
      
      if (type === 'folder') {
        setFolders(prev => prev.filter(f => f.id !== item.id));
      } else {
        setFiles(prev => prev.filter(f => f.id !== item.id));
      }
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      alert(`Failed to delete ${type}.`);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    setIsCreatingFolder(true);
    try {
      const parentId = currentPath.length === 0 ? null : currentPath[currentPath.length - 1].id;
      const res = await api.post('/folders', { name: newFolderName.trim(), parentId });
      setFolders(prev => [...prev, res.data.folder].sort((a, b) => a.name.localeCompare(b.name)));
      setNewFolderName('');
      setIsNewModalOpen(false);
    } catch (err) {
      console.error("Error creating folder:", err);
      alert("Failed to create folder.");
    } finally {
      setIsCreatingFolder(false);
    }
  };

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
            
            {isLoadingData ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Loading files...</p>
              </div>
            ) : (
              <>
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
                          onDelete={(folder) => handleDeleteItem(folder, 'folder')}
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
                          onDelete={(file) => handleDeleteItem(file, 'file')}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-zinc-500">No matching files or folders found.</p>
                  </div>
                )}
              </>
            )}
            
          </div>
        </main>

        <UploadProgress uploads={uploads.filter(u => u.progress < 100 || u.progress === 100)} onClose={() => setUploads([])} />
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
        <ShareModal item={shareItem} onClose={() => setShareItem(null)} />
        <VersionHistoryModal item={versionItem} onClose={() => setVersionItem(null)} />

        {/* Simple Modal overlay for "+ New" */}
        {isNewModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <h3 className="font-medium text-zinc-900">Create new folder</h3>
                <button onClick={() => setIsNewModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <form onSubmit={handleCreateFolder} className="p-6">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Untitled folder" 
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-900 mb-6"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsNewModalOpen(false)} 
                    className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                    disabled={isCreatingFolder}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!newFolderName.trim() || isCreatingFolder}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCreatingFolder && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
