import { useState } from 'react';
import { X, Youtube, Video, Check } from 'lucide-react';

export default function VideoEmbedModal({ isOpen, onClose, onInsert }) {
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  const handleEmbed = () => {
    let embedCode = '';
    const cleanUrl = url.trim();

    try {
      // 1. YouTube Logic
      if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
        let videoId = '';

        if (cleanUrl.includes('/shorts/')) {
          videoId = cleanUrl.split('/shorts/')[1].split(/[?&]/)[0];
        } else if (cleanUrl.includes('youtu.be')) {
          videoId = cleanUrl.split('/').pop().split(/[?&]/)[0];
        } else {
          const urlObj = new URL(cleanUrl);
          videoId = urlObj.searchParams.get('v');
        }
        
        if (videoId) {
          // FIX: Changed width to 100% and height to 400 for better aspect ratio
          embedCode = `<center><iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></center>`;
        }
      } 
      // 2. 3Speak Logic
      else if (cleanUrl.includes('3speak.tv')) {
        const urlObj = new URL(cleanUrl);
        const vParam = urlObj.searchParams.get('v'); // "username/videoid"
        
        if (vParam) {
          // FIX: Changed width to 100% and height to 400
          embedCode = `<center><iframe src="https://3speak.tv/embed?v=${vParam}" width="100%" height="400" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></center>`;
        }
      }

      if (embedCode) {
        onInsert(embedCode);
        onClose();
        setUrl('');
      } else {
        alert("Invalid Video URL. Please check the link.");
      }
    } catch (e) {
      console.error(e);
      alert("Error parsing URL. Please ensure it includes http/https.");
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
          />
        </div>

        <button 
          onClick={handleEmbed}
          className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white py-2.5 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2"
        >
          <Check size={16} /> Insert Video
        </button>

        <div className="flex justify-center gap-4 mt-6 text-text-muted opacity-50">
          <Youtube size={20} />
          <span className="font-bold text-xl">3Speak</span>
        </div>

      </div>
    </div>
  );
}