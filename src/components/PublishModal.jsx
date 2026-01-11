import { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';

export default function PublishModal({ isOpen, onClose, onPublish, isPublishing }) {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState(''); // Space separated
  
  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) return alert("Title is required");
    if (!tags.trim()) return alert("Add at least one tag (e.g. hive)");
    
    // Convert string "hive crypto" -> array ['hive', 'crypto']
    const tagList = tags.split(' ').map(t => t.trim()).filter(t => t);
    
    onPublish(title, tagList);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800">Publish to Hive</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded focus:border-hive focus:outline-none"
              placeholder="My Awesome Post"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tags (Space separated)</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded focus:border-hive focus:outline-none"
              placeholder="hive photography travel"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>
          
       
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
          <button 
            onClick={handleSubmit}
            disabled={isPublishing}
            className="flex items-center gap-2 px-6 py-2 bg-hive text-white rounded-lg hover:opacity-90 transition text-sm font-bold disabled:opacity-50"
          >
            {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isPublishing ? 'Broadcasting...' : 'Publish Now'}
          </button>
        </div>

      </div>
    </div>
  );
}