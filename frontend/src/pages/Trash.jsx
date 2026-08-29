import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { RefreshCcw, Trash2, FileText, Image as ImageIcon, Video, FileMusic, FileArchive } from 'lucide-react';

const getFileIcon = (type) => {
  if (type.startsWith('image/')) return <ImageIcon className="h-6 w-6 text-blue-500" />;
  if (type.startsWith('video/')) return <Video className="h-6 w-6 text-red-500" />;
  if (type.startsWith('audio/')) return <FileMusic className="h-6 w-6 text-yellow-500" />;
  if (type.includes('zip') || type.includes('tar') || type.includes('rar')) 
    return <FileArchive className="h-6 w-6 text-orange-500" />;
  return <FileText className="h-6 w-6 text-zinc-400" />;
};

const Trash = () => {
  const [trashedItems, setTrashedItems] = useState([
    { id: 't1', name: 'Old_Budget_2024.xlsx', type: 'application/vnd.ms-excel', deletedAt: '2024-10-20' },
    { id: 't2', name: 'draft_logo.png', type: 'image/png', deletedAt: '2024-10-21' },
    { id: 't3', name: 'Archived_Project', type: 'folder', deletedAt: '2024-10-25' }
  ]);

  const handleRestore = (id) => {
    setTrashedItems(trashedItems.filter(item => item.id !== id));
    // In a real app, this would also add it back to the Dashboard state/DB
  };

  const handlePermanentDelete = (id) => {
    setTrashedItems(trashedItems.filter(item => item.id !== id));
  };

  const handleEmptyTrash = () => {
    setTrashedItems([]);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Trash</h1>
                <p className="text-sm text-zinc-500 mt-1">Items in trash are deleted forever after 30 days</p>
              </div>
              <button 
                onClick={handleEmptyTrash}
                disabled={trashedItems.length === 0}
                className="px-4 py-2 bg-white border border-zinc-200 text-sm font-medium text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                Empty Trash
              </button>
            </div>

            {trashedItems.length > 0 ? (
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                    <tr>
                      <th className="px-6 py-3 font-medium">Name</th>
                      <th className="px-6 py-3 font-medium hidden sm:table-cell">Date Deleted</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {trashedItems.map(item => (
                      <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {item.type === 'folder' ? (
                              <svg className="w-6 h-6 text-zinc-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>
                            ) : getFileIcon(item.type)}
                            <span className="font-medium text-zinc-900">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 hidden sm:table-cell">
                          {item.deletedAt}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleRestore(item.id)}
                              className="p-1.5 text-zinc-400 hover:text-green-600 rounded hover:bg-green-50 transition-colors" title="Restore"
                            >
                              <RefreshCcw className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handlePermanentDelete(item.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors" title="Delete permanently"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20">
                <Trash2 className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                <h3 className="text-lg font-medium text-zinc-900">Trash is empty</h3>
                <p className="text-zinc-500 mt-1">Nothing to see here right now.</p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default Trash;
