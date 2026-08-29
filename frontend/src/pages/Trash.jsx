import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { RefreshCcw, Trash2, FileText, Image as ImageIcon, Video, FileMusic, FileArchive, Loader2 } from 'lucide-react';
import api from '../api/axios';

const getFileIcon = (type = '') => {
  if (type.startsWith('image/')) return <ImageIcon className="h-6 w-6 text-blue-500" />;
  if (type.startsWith('video/')) return <Video className="h-6 w-6 text-red-500" />;
  if (type.startsWith('audio/')) return <FileMusic className="h-6 w-6 text-yellow-500" />;
  if (type.includes('zip') || type.includes('tar') || type.includes('rar')) 
    return <FileArchive className="h-6 w-6 text-orange-500" />;
  return <FileText className="h-6 w-6 text-zinc-400" />;
};

const Trash = () => {
  const [trashedItems, setTrashedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrash = async () => {
      try {
        const res = await api.get('/trash');
        const folders = res.data.trash.folders.map(f => ({ ...f, isFolder: true, type: 'folder' }));
        const files = res.data.trash.files;
        setTrashedItems([...folders, ...files]);
      } catch (err) {
        console.error("Error fetching trash:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrash();
  }, []);

  const handleRestore = async (item) => {
    try {
      const type = item.isFolder ? 'folder' : 'file';
      await api.post(`/trash/restore/${type}/${item.id}`);
      setTrashedItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      console.error("Restore error:", err);
      alert("Failed to restore item");
    }
  };

  const handlePermanentDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete ALL items?")) return;
    try {
      await api.delete('/trash/empty');
      setTrashedItems([]);
    } catch (err) {
      console.error("Empty trash error:", err);
      alert("Failed to empty trash");
    }
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
                onClick={handlePermanentDelete}
                disabled={trashedItems.length === 0}
                className="px-4 py-2 bg-white border border-zinc-200 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Empty Trash
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Loading trash...</p>
              </div>
            ) : trashedItems.length > 0 ? (
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
                          {new Date(item.updated_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleRestore(item)}
                              className="p-1.5 text-zinc-400 hover:text-green-600 rounded hover:bg-green-50 transition-colors" title="Restore"
                            >
                              <RefreshCcw className="h-4 w-4" />
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
