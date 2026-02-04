import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Upload, Image as ImageIcon, Trash2, Loader2, Check } from 'lucide-react';

export default function ImageManager({ isOpen, onClose, onInsert, username }) {
  const [activeTab, setActiveTab] = useState('upload'); 
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'gallery' && username) {
      fetchGallery();
    }
  }, [isOpen, activeTab, username]);

  const fetchGallery = async () => {
    setLoadingImages(true);
    const { data, error } = await supabase.storage
      .from('user-uploads')
      .list(username, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

    if (!error) {
      setImages(data || []);
    }
    setLoadingImages(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return alert("File is too big! Max limit is 10MB.");
    }

     const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return alert("Security Error: Only JPG, PNG, GIF, and WEBP images are allowed.");
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

      onInsert(`<center><img src="${publicUrl}" /></center>`);
      onClose();
      
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const selectImage = (fileName) => {
    const { data: { publicUrl } } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(`${username}/${fileName}`);
      
    onInsert(`<center><img src="${publicUrl}" /></center>`);
    onClose();
  };

  const deleteImage = async (fileName) => {
    if(!confirm("Delete this image? It will break any posts using it!")) return;
    const { error } = await supabase.storage.from('user-uploads').remove([`${username}/${fileName}`]);
    if (!error) fetchGallery(); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
      <div className="bg-bg-panel rounded-xl shadow-2xl border border-ui-border max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header - No Z-Index issues now because input is trapped below */}
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

        {/* Content */}
        <div className="p-6 bg-bg-app flex-1 overflow-y-auto">
          
          {/* TAB: UPLOAD */}
          {activeTab === 'upload' && (
            // FIX: Added 'relative' class here. Now the absolute input stays inside this div.
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
              <p className="text-text-muted text-xs mb-6">Max size 10MB (JPG, PNG, GIF)</p>
              
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}

          {/* TAB: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="grid grid-cols-3 gap-4">
              {loadingImages ? (
                <div className="col-span-3 text-center py-10"><Loader2 className="animate-spin mx-auto text-brand-primary"/></div>
              ) : images.length === 0 ? (
                <div className="col-span-3 text-center text-text-muted py-10">No images found in your gallery.</div>
              ) : (
                images.map((img) => {
                   const { data } = supabase.storage.from('user-uploads').getPublicUrl(`${username}/${img.name}`);
                   return (
                     <div key={img.id} className="group relative aspect-square bg-bg-editor rounded-lg overflow-hidden border border-ui-border hover:border-brand-primary transition">
                       <img src={data.publicUrl} className="w-full h-full object-cover" />
                       
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                         <button 
                           onClick={() => selectImage(img.name)}
                           className="bg-brand-primary text-white px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 hover:scale-105 transition"
                         >
                           <Check size={12}/> Insert
                         </button>
                        {/* <button 
                           onClick={() => deleteImage(img.name)}
                           className="text-red-400 hover:text-red-500 bg-white/10 p-1.5 rounded-full"
                         >
                           <Trash2 size={14}/>
                         </button> */}

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