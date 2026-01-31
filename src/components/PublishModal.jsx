import { useState, useEffect } from 'react';
import { X, Send, Loader2, ChevronDown, ChevronUp, Plus, Users } from 'lucide-react';
import { fetchUserCommunities } from '../lib/hive'; // Import fetcher

export default function PublishModal({ isOpen, onClose, onPublish, isPublishing, username }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Community State
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(''); // Empty string = My Blog
  const [loadingCommunities, setLoadingCommunities] = useState(false);

  // Tag Logic
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [payout, setPayout] = useState('50%');

  // FETCH COMMUNITIES ON OPEN
  useEffect(() => {
    if (isOpen && username) {
      setLoadingCommunities(true);
      fetchUserCommunities(username).then(data => {
        setCommunities(data);
        setLoadingCommunities(false);
      });
    }
  }, [isOpen, username]);

  if (!isOpen) return null;

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const cleanTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (cleanTag && !tags.includes(cleanTag) && tags.length < 10) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim()) return alert("Title is required");
    if (tags.length === 0) return alert("Add at least one tag (e.g. hive)");
    
    onPublish({
      title,
      description,
      tags,
      payout,
      community: selectedCommunity // Pass the selected ID (e.g., hive-123456)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
      <div className="bg-bg-panel rounded-xl shadow-2xl border border-ui-border max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        <div className="p-4 border-b border-ui-border flex justify-between items-center bg-bg-panel-soft">
          <h2 className="font-bold text-text-primary flex items-center gap-2">
            <Send size={16} className="text-brand-primary" /> Publish to Hive
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-brand-primary transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* COMMUNITY SELECTOR (NEW) */}
          <div className="bg-bg-editor p-3 rounded-lg border border-ui-border flex flex-col gap-2">
            <label className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
              <Users size={12} /> Post Destination
            </label>
            <select 
              className="w-full bg-transparent text-text-primary text-sm font-bold focus:outline-none cursor-pointer"
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              disabled={loadingCommunities}
            >
              <option value="" className="bg-bg-panel text-text-muted">My Blog (No Community)</option>
              {loadingCommunities ? (
                <option disabled>Loading your communities...</option>
              ) : (
                communities.map(comm => (
                  <option key={comm.name} value={comm.name} className="bg-bg-panel">
                    {comm.title} ({comm.name})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* TITLE */}
          <div>
            <label className="block text-[10px] font-bold text-brand-accent uppercase mb-1.5">Title</label>
            <input 
              type="text" 
              className="w-full p-3 bg-bg-editor border border-ui-border rounded-lg text-text-primary focus:border-brand-primary focus:outline-none transition font-bold"
              placeholder="My Awesome Post"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Short Description</label>
            <textarea 
              rows="2"
              className="w-full p-3 bg-bg-editor border border-ui-border rounded-lg text-text-primary text-sm focus:border-brand-primary focus:outline-none transition resize-none"
              placeholder="Snippet for previews..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* TAGS */}
          <div>
            <label className="flex justify-between text-[10px] font-bold text-text-muted uppercase mb-1.5">
              <span>Tags</span>
              <span className={tags.length >= 10 ? "text-brand-primary" : ""}>{tags.length}/10</span>
            </label>
            
            <div className="w-full p-2 bg-bg-editor border border-ui-border rounded-lg flex flex-wrap gap-2 min-h-[50px] focus-within:border-brand-primary transition">
              {tags.map((tag, idx) => (
                <span key={idx} className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  #{tag}
                  <button onClick={() => removeTag(idx)} className="hover:text-white"><X size={12}/></button>
                </span>
              ))}
              
              {tags.length < 10 && (
                <input 
                  type="text" 
                  className="flex-1 bg-transparent text-text-primary text-sm focus:outline-none min-w-[80px]"
                  placeholder={tags.length === 0 ? "Type tag & hit Enter..." : "Add another..."}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={addTag} 
                />
              )}
            </div>
          </div>

          {/* ADVANCED */}
          <div className="border-t border-ui-border pt-2">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-brand-accent transition w-full py-2"
            >
              {showAdvanced ? <ChevronUp size={14}/> : <ChevronDown size={14}/>} 
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 bg-bg-app rounded-lg border border-ui-border space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Rewards</label>
                  <select 
                    className="w-full p-2 bg-bg-editor border border-ui-border rounded text-sm text-text-primary focus:outline-none"
                    value={payout}
                    onChange={(e) => setPayout(e.target.value)}
                  >
                    <option value="50%">50% HBD / 50% HP</option>
                    <option value="100%">100% Hive Power</option>
                    <option value="0%">Decline Payout</option>
                  </select>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-bg-panel-soft border-t border-ui-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary font-medium">Cancel</button>
          <button 
            onClick={handleSubmit}
            disabled={isPublishing}
            className="flex items-center gap-2 px-6 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-lg transition text-sm font-bold shadow-lg shadow-brand-accent/20 disabled:opacity-50"
          >
            {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isPublishing ? 'Broadcasting...' : 'Publish'}
          </button>
        </div>

      </div>
    </div>
  );
}