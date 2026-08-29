import { useState } from 'react';
import { X, Link2, Copy, Check } from 'lucide-react';

const ShareModal = ({ item, onClose }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('viewer');
  const [shares, setShares] = useState([
    { email: 'john@example.com', permission: 'editor' }
  ]);
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleShare = (e) => {
    e.preventDefault();
    if (email) {
      setShares([...shares, { email, permission }]);
      setEmail('');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://clouddrive.app/s/${item.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex justify-between items-center">
          <h3 className="font-semibold text-zinc-900">Share "{item.name}"</h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <form onSubmit={handleShare} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="email"
                placeholder="Add people via email"
                className="w-full pl-3 pr-24 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <select 
                className="absolute right-1 top-1 bottom-1 bg-transparent text-sm text-zinc-500 border-none focus:ring-0 cursor-pointer pr-8"
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            <button 
              type="submit"
              disabled={!email}
              className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-zinc-800 transition-colors"
            >
              Invite
            </button>
          </form>

          <div>
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">People with access</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">U</div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">You</p>
                    <p className="text-xs text-zinc-500">owner@example.com</p>
                  </div>
                </div>
                <span className="text-sm text-zinc-500">Owner</span>
              </div>
              
              {shares.map((share, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-sm font-medium">
                      {share.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{share.email}</p>
                    </div>
                  </div>
                  <select 
                    className="text-sm text-zinc-500 bg-transparent border-none focus:ring-0 cursor-pointer"
                    defaultValue={share.permission}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="remove">Remove</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="text-sm font-medium text-zinc-900">Anyone with the link</p>
              <p className="text-xs text-zinc-500">Can view</p>
            </div>
          </div>
          <button 
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 text-sm font-medium rounded-md hover:bg-zinc-50 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
