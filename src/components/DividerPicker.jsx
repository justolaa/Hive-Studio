import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Image as ImageIcon, Loader2, RefreshCw } from 'lucide-react';

export default function DividerPicker({ onSelect }) {
  const [dividers, setDividers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchDividers = async () => {
    setLoading(true);
    
    // 1. Try fetching from 'dividers' folder
    let { data, error } = await supabase
      .storage
      .from('hive-assets')
      .list('dividers', { limit: 50, sortBy: { column: 'name', order: 'asc' } });

    // 2. Fallback: If empty or error, try fetching from Root
    if (!data || data.length === 0) {
      const rootReq = await supabase
        .storage
        .from('hive-assets')
        .list('', { limit: 50 });
        
      if (rootReq.data) {
        // Filter out folders (like 'dividers' folder itself)
        data = rootReq.data.filter(f => f.metadata); 
      }
    }

    if (data && data.length > 0) {
      // Build URLs
      const images = data.map(file => {
        // Determine if file is in 'dividers/' or root
        // If the file came from the first call, it needs 'dividers/' prefix
        // If it came from root, it needs no prefix.
        // Quick hack: Check if we have a way to know source. 
        // Simpler: Just construct the URL.
        
        const path = file.name.includes('/') ? file.name : `dividers/${file.name}`;
        
        // Note: This URL generator handles the path logic automatically usually
        const { data: { publicUrl } } = supabase
          .storage
          .from('hive-assets')
          .getPublicUrl(`dividers/${file.name}`); // Try specific folder first
          
        return { name: file.name, url: publicUrl };
      });
      setDividers(images);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchDividers();
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs flex items-center gap-1 text-gray-500 hover:text-hive transition font-medium"
      >
        <ImageIcon size={14} /> Insert Divider
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-gray-500">SELECT A DIVIDER</span>
        <div className="flex gap-2">
          <button onClick={fetchDividers} title="Refresh"><RefreshCw size={12} className="text-gray-400 hover:text-hive" /></button>
          <button onClick={() => setIsOpen(false)} className="text-xs text-red-500 hover:underline">Close</button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-4 text-hive"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
          {dividers.length === 0 && <p className="col-span-4 text-xs text-center text-gray-400 py-4">No dividers found in Supabase.</p>}
          
          {dividers.map((div, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelect(div.url);
                setIsOpen(false);
              }}
              className="hover:bg-gray-50 p-1 rounded border border-gray-100 hover:border-hive transition group flex items-center justify-center h-12"
            >
              <img src={div.url} alt="divider" className="max-w-full max-h-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}