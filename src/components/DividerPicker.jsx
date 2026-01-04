import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

export default function DividerPicker({ onSelect }) {
  const [dividers, setDividers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // 1. Fetch images from Supabase when component loads
  useEffect(() => {
    async function fetchDividers() {
      // List all files in the 'dividers' folder of 'hive-assets' bucket
      const { data, error } = await supabase
        .storage
        .from('hive-assets')
        .list('dividers', {
          limit: 20,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        console.error('Error fetching dividers:', error);
      } else {
        // Construct the full public URL for each image
        const images = data.map(file => {
          const { data: { publicUrl } } = supabase
            .storage
            .from('hive-assets')
            .getPublicUrl(`dividers/${file.name}`);
            
          return { name: file.name, url: publicUrl };
        });
        setDividers(images);
      }
      setLoading(false);
    }

    fetchDividers();
  }, []);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs flex items-center gap-1 text-gray-500 hover:text-hive transition"
      >
        <ImageIcon size={14} /> Insert Divider
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-gray-500">SELECT A DIVIDER</span>
        <button onClick={() => setIsOpen(false)} className="text-xs text-red-500 hover:underline">Close</button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-4 text-hive"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
          {dividers.length === 0 && <p className="text-xs text-center text-gray-400">No dividers found in Supabase.</p>}
          
          {dividers.map((div) => (
            <button
              key={div.name}
              onClick={() => {
                onSelect(div.url);
                setIsOpen(false);
              }}
              className="hover:bg-gray-50 p-1 rounded border border-transparent hover:border-gray-200 transition group"
            >
              {/* We use a standard img tag to preview */}
              <img src={div.url} alt={div.name} className="w-full h-auto max-h-8 object-contain opacity-70 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}