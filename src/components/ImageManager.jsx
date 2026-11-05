import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Upload, Image as ImageIcon, Trash2, Loader2, Check } from 'lucide-react';

export default function ImageManager({ isOpen, onClose, onInsert, username }) {
  const [activeTab, setActiveTab] = useState('upload'); 
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'gallery' && username) {
      fetchGallery();
    }
  }, [isOpen, activeTab, username]);

  const fetchGallery = async () => {
    setLoadingMedia(true);
    const { data, error } = await supabase.storage
      .from('user-uploads')
      .list(username, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

    if (!error) {
      setMediaFiles(data || []);
    }
    setLoadingMedia(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. STRICT LIMIT CHECK (Reduced from 15MB to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return alert("File is too big! Max limit is 2MB to save server bandwidth.");
    }

    // 2. STRICT TYPE CHECK (Removed Video Support)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return alert("Only JPG, PNG, GIF, and WEBP images are allowed. No videos.");
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${username}/${fileName}`;

      const { error } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      // INSERT LOGIC (Images only)
      onInsert(`<center><img src="${publicUrl}" /></center>`);
      onClose();
      
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const selectMedia = (fileName) => {
    const { data: { publicUrl } } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(`${username}/${fileName}`);
      
    onInsert(`<center><img src="${publicUrl}" /></center>`);
    onClose();
  };

  const deleteMedia = async (fileName) => {
    if(!confirm("Delete this file? It will break any posts using it!")) return;
    const { error } = await supabase.storage.from('user-uploads').remove([`${username}/${fileName}`]);
    if (!error) fetchGallery(); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
      <div className="bg-bg-panel rounded-xl shadow-2xl border border-ui-border max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
        
        <div className="p-4 border-b border-ui-border flex justify-between items-center bg-bg-panel-soft shrink-0">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('upload')}
              className={`text-sm font-bold pb-1 border-b-2 transition ${activeTab === 'upload' ? 'text-brand-primary border-brand-primary' : 'text-text-muted border-transparent hover:text-text-primary'}`}
            >
              Upload New
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={`text-sm font-bold pb-1 border-b-2 transition ${activeTab === 'gallery' ? 'text-brand-primary border-brand-primary' : 'text-text-muted border-transparent hover:text-text-primary'}`}
            >
              My Gallery
            </button>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-brand-primary"><X size={20} /></button>
        </div>

        <div className="p-6 bg-bg-app flex-1 overflow-y-auto">
          
          {/* UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className="relative h-full flex flex-col items-center justify-center border-2 border-dashed border-ui-border rounded-xl p-10 hover:border-brand-primary/50 transition bg-bg-editor">
              {uploading ? (
                <Loader2 size={40} className="animate-spin text-brand-primary mb-4" />
              ) : (
                <div className="bg-bg-panel p-4 rounded-full mb-4">
                  <Upload size={32} className="text-text-muted" />
                </div>
              )}
              
              <p className="text-text-primary font-bold mb-2">
                {uploading ? "Uploading..." : "Click to Upload Image"}
              </p>
              <p className="text-text-muted text-xs mb-6 text-center">
                Images ONLY (JPG, PNG, GIF)<br/>Max 2MB per file
              </p>
              
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/gif, image/webp"
                onChange={handleFileChange}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <div className="grid grid-cols-3 gap-4">
              {loadingMedia ? (
                <div className="col-span-3 text-center py-10"><Loader2 className="animate-spin mx-auto text-brand-primary"/></div>
              ) : mediaFiles.length === 0 ? (
                <div className="col-span-3 text-center text-text-muted py-10">No files found.</div>
              ) : (
                mediaFiles.map((file) => {
                   const { data } = supabase.storage.from('user-uploads').getPublicUrl(`${username}/${file.name}`);

                   return (
                     <div key={file.id} className="group relative aspect-square bg-bg-editor rounded-lg overflow-hidden border border-ui-border hover:border-brand-primary transition">
                       <img src={data.publicUrl} className="w-full h-full object-cover" />
                       
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                         <button 
                           onClick={() => selectMedia(file.name)}
                           className="bg-brand-primary text-white px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 hover:scale-105 transition"
                         >
                           <Check size={12}/> Insert
                         </button>
                         <button 
                           onClick={() => deleteMedia(file.name)}
                           className="text-red-400 hover:text-red-500 bg-white/10 p-1.5 rounded-full"
                         >
                           <Trash2 size={14}/>
                         </button>
                       </div>
                     </div>
                   );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}