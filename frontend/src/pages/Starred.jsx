import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { Star } from 'lucide-react';

const Starred = () => {
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

            <div className="text-center py-20">
              <Star className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
              <h3 className="text-lg font-medium text-zinc-900">Empty</h3>
              <p className="text-zinc-500 mt-1">No starred files to show.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Starred;
