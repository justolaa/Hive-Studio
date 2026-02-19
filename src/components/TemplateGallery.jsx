import { X, Check, LayoutTemplate, Sparkles } from 'lucide-react';

export default function TemplateGallery({ isOpen, onClose, templates, selectedId, onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
      <div className="bg-bg-panel rounded-xl shadow-2xl border border-ui-border max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-ui-border flex justify-between items-center bg-bg-panel-soft shrink-0">
          <div>
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 tracking-tight">
              <LayoutTemplate className="text-brand-primary" /> Template Gallery
            </h2>
            <p className="text-sm text-text-muted mt-1">Choose a visual blueprint for your next masterpiece.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-ui-hover rounded-full transition text-text-muted hover:text-brand-primary">
            <X size={20} />
          </button>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-bg-app/50 custom-scrollbar">
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
                  className={`group relative flex flex-col text-left rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                    isActive 
                      ? 'bg-bg-panel-soft border-brand-primary shadow-[0_0_20px_rgba(227,19,55,0.2)] scale-[1.02]' 
                      : 'bg-bg-panel border-ui-border hover:border-brand-accent/50 hover:shadow-lg hover:-translate-y-1'
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="h-44 w-full relative overflow-hidden bg-bg-editor border-b border-ui-border">
                    {t.thumbnail_url ? (
                      <img 
                        src={t.thumbnail_url} 
                        alt={t.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-ui-divider group-hover:text-brand-accent transition-colors">
                        <LayoutTemplate size={48} strokeWidth={1.5} />
                        <span className="text-xs font-mono mt-2 opacity-50">NO PREVIEW</span>
                      </div>
                    )}
                    
                    {/* Active Badge */}
                    {isActive && (
                      <div className="absolute top-2 right-2 bg-brand-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-in fade-in slide-in-from-top-2">
                        <Check size={10} strokeWidth={3} /> ACTIVE
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-bg-panel to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300 ${isActive ? 'hidden' : ''}`}></div>
                  </div>

                  {/* Info Section */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-bold text-base ${isActive ? 'text-brand-primary' : 'text-text-primary group-hover:text-brand-accent transition-colors'}`}>
                        {t.name}
                      </h3>
                      {t.category && (
                        <span className="text-[10px] uppercase tracking-wider bg-bg-editor text-text-secondary px-2 py-1 rounded border border-ui-border">
                          {t.category}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                      {t.description || "A clean, professional layout for your Hive posts."}
                    </p>

                    {/* "Use This" Label on Hover */}
                    <div className="mt-4 pt-3 border-t border-ui-border flex items-center text-xs font-bold text-brand-accent opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <Sparkles size={12} className="mr-1" /> Use this template
                    </div>
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