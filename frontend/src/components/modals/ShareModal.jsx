import { useState } from 'react';
import { X, Copy, Link as LinkIcon, Check, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const ShareModal = ({ item, onClose }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('viewer');
  const [shares] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [shareSuccess, setShareSuccess] = useState('');
  const [shareError, setShareError] = useState('');

  if (!item) return null;

  const handleShare = async () => {
    if (!email) return;
    setIsSharing(true);
    setShareSuccess('');
    setShareError('');
    
    try {
      const payload = {
        shared_with_email: email,
        permission_level: permission
      };
      
      if (item.type === 'folder' || item.name.indexOf('.') === -1) {
        payload.folder_id = item.id;
      } else {
        payload.file_id = item.id;
      }
      
      await api.post('/shares', payload);
      setShareSuccess(`Shared successfully with ${email}`);
      setEmail('');
      
      setTimeout(() => setShareSuccess(''), 3000);
    } catch (err) {
      console.error("Share error:", err);
      setShareError(err.response?.data?.message || 'Failed to share');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    setIsCreatingLink(true);
    setShareSuccess('');
    setShareError('');
    
    try {
      const payload = {};
      if (item.type === 'folder' || item.name.indexOf('.') === -1) {
        payload.folder_id = item.id;
      } else {
        payload.file_id = item.id;
      }
      
      const res = await api.post('/shares/link', payload);
      const linkToken = res.data.link.token;
      
      const publicUrl = `${window.location.origin}/share/${linkToken}`;
      
      await navigator.clipboard.writeText(publicUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Copy link error:", err);
      setShareError('Failed to create public link');
    } finally {
      setIsCreatingLink(false);
    }
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
          <div className="flex gap-2">
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
              onClick={handleShare}
              disabled={!email || isSharing}
              className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Invite'}
            </button>
          </div>

          {shareSuccess && <div className="p-2 text-sm text-green-700 bg-green-50 rounded-lg">{shareSuccess}</div>}
          {shareError && <div className="p-2 text-sm text-red-700 bg-red-50 rounded-lg">{shareError}</div>}

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
            <LinkIcon className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="text-sm font-medium text-zinc-900">Anyone with the link</p>
              <p className="text-xs text-zinc-500">Can view</p>
            </div>
          </div>
          <button 
            onClick={handleCopyLink}
            disabled={isCreatingLink}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 text-sm font-medium rounded-md hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            {isCreatingLink ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isCopied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {isCopied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
