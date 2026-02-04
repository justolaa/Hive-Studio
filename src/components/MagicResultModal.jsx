import { Sparkles, LayoutTemplate, X, ArrowRight, List } from 'lucide-react';

export default function MagicResultModal({ isOpen, onClose, aiData, onApplySuggestion, onOpenGallery, onKeepCurrent }) {
  if (!isOpen || !aiData) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
      <div className="bg-bg-panel rounded-xl shadow-2xl border border-ui-border max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-ui-border flex justify-between items-center bg-gradient-to-r from-bg-panel-soft to-brand-primary/10">
          <h2 className="font-bold text-text-primary flex items-center gap-2">
            <Sparkles size={16} className="text-brand-primary" /> Magic Analysis
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-brand-primary transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Topic Detected */}
          <div className="text-center">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Topic Detected</span>
            <div className="text-xl font-bold text-text-primary mt-1">{aiData.topic_detected}</div>
          </div>

          {/* The Suggestion Box */}
          <div className="bg-bg-editor border border-ui-border rounded-lg p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
            <p className="text-xs text-text-muted mb-2">Recommended Template</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-lg text-text-primary">
                <LayoutTemplate size={18} className="text-brand-accent"/> 
                {aiData.suggested_template_name}
              </div>
              {/* If suggestion is same as current, visual checkmark or similar could go here */}
            </div>
          </div>

          <p className="text-xs text-text-secondary text-center leading-relaxed">
            The AI has formatted your text. Do you want to apply the suggested template style, or pick your own?
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 bg-bg-panel-soft border-t border-ui-border flex flex-col gap-2">
          
          {/* Option 1: Accept AI */}
          <button 
            onClick={onApplySuggestion}
            className="w-full py-3 bg-brand-primary hover:bg-brand-soft text-white rounded-lg font-bold text-sm transition shadow-lg shadow-brand-primary/20 flex justify-center items-center gap-2"
          >
            Switch to {aiData.suggested_template_name} <ArrowRight size={16}/>
          </button>

          <div className="grid grid-cols-2 gap-2 mt-1">
            {/* Option 2: Manual Pick */}
            <button 
              onClick={onOpenGallery}
              className="py-2.5 bg-bg-panel border border-ui-border hover:border-brand-accent text-text-primary rounded-lg text-xs font-bold transition flex justify-center items-center gap-2"
            >
              <List size={14}/> Pick Manually...
            </button>

            {/* Option 3: Ignore Template, Keep Text */}
            <button 
              onClick={onKeepCurrent}
              className="py-2.5 bg-bg-panel border border-ui-border hover:bg-bg-editor text-text-muted hover:text-text-secondary rounded-lg text-xs font-bold transition"
            >
              Keep Current Template
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}