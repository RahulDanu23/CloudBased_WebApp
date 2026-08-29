import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import FolderItem from '../components/files/FolderItem';
import FileItem from '../components/files/FileItem';

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

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa]">
      <Sidebar onNewClick={() => setIsNewModalOpen(true)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-semibold text-zinc-900 mb-6 tracking-tight">
              {currentPath.length > 0 ? currentPath[currentPath.length - 1].name : 'My Drive'}
            </h1>
            
            <Breadcrumbs path={currentPath} onNavigate={handleBreadcrumbNavigate} />
            
            {/* Folders Section */}
            <div className="mb-8">
              <h2 className="text-sm font-medium text-zinc-500 mb-3">Folders</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {MOCK_FOLDERS.map((folder) => (
                  <FolderItem 
                    key={folder.id} 
                    folder={folder} 
                    onClick={handleFolderClick}
                  />
                ))}
              </div>
            </div>
            
            {/* Files Section */}
            <div>
              <h2 className="text-sm font-medium text-zinc-500 mb-3">Files</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {MOCK_FILES.map((file) => (
                  <FileItem key={file.id} file={file} />
                ))}
              </div>
            </div>
            
          </div>
        </main>

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
