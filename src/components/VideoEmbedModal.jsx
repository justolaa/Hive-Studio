import { useState } from 'react';
import { X, Youtube, Video, Check, Loader2 } from 'lucide-react';

export default function VideoEmbedModal({ isOpen, onClose, onInsert }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmbed = async () => {
    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    setLoading(true);
    let thumbnail = '';
    let videoUrl = cleanUrl;

    try {
      // --- 1. YOUTUBE LOGIC ---
      if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
        let videoId = '';
        if (cleanUrl.includes('/shorts/')) {
          videoId = cleanUrl.split('/shorts/')[1].split(/[?&]/)[0];
          videoUrl = `https://www.youtube.com/watch?v=${videoId}`; 
        } else if (cleanUrl.includes('youtu.be')) {
          videoId = cleanUrl.split('/').pop().split(/[?&]/)[0];
        } else {
          const urlObj = new URL(cleanUrl);
          videoId = urlObj.searchParams.get('v');
        }

        if (videoId) {
          thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      } 
      
      // --- 2. 3SPEAK LOGIC (VIA HIVE API) ---
      else if (cleanUrl.includes('3speak.tv')) {
        // Expected format: https://3speak.tv/watch?v=username/videoid
        const urlParts = cleanUrl.split('?v=');
        
        if (urlParts[1]) {
          const [author, permlink] = urlParts[1].split('/');
          
          if (author && permlink) {
            // Fetch post data from Hive Blockchain to get the thumbnail
            const response = await fetch('https://api.hive.blog', {
              method: 'POST',
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'condenser_api.get_content',
                params: [author, permlink],
                id: 1
              }),
              headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            // Extract image from JSON Metadata
            if (result.result && result.result.json_metadata) {
              try {
                const meta = JSON.parse(result.result.json_metadata);
                // Try 3speak specific image, or fallback to first image in post
                thumbnail = meta.image?.[0] || meta.thumbnail;
              } catch (e) {
                console.error("Failed to parse metadata", e);
              }
            }
            
            // Fallback: If Hive lookup failed (maybe video isn't published yet), try generic CDN
            if (!thumbnail) {
               thumbnail = `https://img.3speakcontent.online/${permlink}/poster.png`;
            }
          }
        }
      }

      // --- GENERATE MARKDOWN ---
      if (thumbnail && videoUrl) {
        // The "Image Link" format: [![Alt](Image)](Link)
        const markdown = `
<center>
<a href="${videoUrl}">
<img src="${thumbnail}" />
</a>
</center>`;
        
        onInsert(markdown);
        onClose();
        setUrl('');
      } else {
        alert("Could not find a thumbnail for this video. Please check the URL.");
      }

    } catch (e) {
      console.error(e);
      alert("Error processing URL: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
      <div className="bg-bg-panel rounded-xl shadow-2xl border border-ui-border max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Video className="text-brand-accent" /> Embed Video
          </h2>
          <button onClick={onClose}><X className="text-text-muted hover:text-white" size={20} /></button>
        </div>

        <p className="text-sm text-text-muted mb-4">Paste a YouTube or 3Speak link.</p>

        <div className="flex gap-2 mb-6">
          <input 
            className="flex-1 bg-bg-editor border border-ui-border rounded-lg p-3 text-text-primary text-sm focus:border-brand-accent focus:outline-none"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>

        <button 
          onClick={handleEmbed}
          disabled={loading}
          className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white py-2.5 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin"/> : <Check size={16} />} 
          {loading ? "Fetching Thumbnail..." : "Generate Link"}
        </button>

        <div className="flex justify-center gap-4 mt-6 text-text-muted opacity-50">
          <Youtube size={20} />
          <span className="font-bold text-xl">3Speak</span>
        </div>

      </div>
    </div>
  );
}