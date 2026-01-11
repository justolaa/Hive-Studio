import { X, Check, LayoutTemplate } from 'lucide-react';

export default function TemplateGallery({ isOpen, onClose, templates, selectedId, onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <LayoutTemplate className="text-hive" /> Theme Gallery
            </h2>
            <p className="text-sm text-gray-500 mt-1">Choose a visual style for your post.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t) => {
              const isActive = t.id === selectedId;
              
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelect(t.id);
                    onClose();
                  }}
                  className={`group relative flex flex-col text-left bg-white rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                    isActive 
                      ? 'border-hive shadow-lg ring-4 ring-hive/10 scale-[1.02]' 
                      : 'border-transparent hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="h-40 bg-gray-200 w-full relative overflow-hidden">
                    {t.thumbnail_url ? (
                      <img 
                        src={t.thumbnail_url} 
                        alt={t.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <LayoutTemplate size={40} />
                      </div>
                    )}
                    
                    {/* Active Badge */}
                    {isActive && (
                      <div className="absolute top-2 right-2 bg-hive text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Check size={12} /> Active
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-bold ${isActive ? 'text-hive' : 'text-gray-800'}`}>
                        {t.name}
                      </h3>
                      {t.category && (
                        <span className="text-[10px] uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-1 rounded">
                          {t.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {t.description || "No description available."}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}