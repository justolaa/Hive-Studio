import { X, PlayCircle } from 'lucide-react';

export default function DemoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 md:p-8 backdrop-blur-sm font-sans animate-in fade-in duration-200">
      <div className="bg-bg-panel rounded-2xl shadow-2xl border border-ui-border max-w-6xl w-full h-[85vh] flex flex-col overflow-hidden zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-ui-border flex justify-between items-center bg-bg-panel-soft shrink-0">
          <h2 className="font-bold text-text-primary flex items-center gap-2 text-lg">
            <PlayCircle className="text-brand-accent" size={20} /> 
            Interactive Walkthrough
          </h2>
          <button 
            onClick={onClose} 
            className="text-text-muted hover:text-brand-primary bg-bg-editor p-1.5 rounded-lg transition"
            title="Close Demo"
          >
            <X size={20} />
          </button>
        </div>

        {/* Arcade Embed - Fills the remaining space */}
        <div className="flex-1 bg-bg-app relative w-full h-full">
          <iframe
            src="https://demo.arcade.software/t9j8roh8VrCSNxyHwUcP?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true"
            title="Format and Preview a Bilingual Blog Post in Hive Studio"
            frameBorder="0"
            loading="lazy"
            allowFullScreen
            allow="clipboard-write"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', colorScheme: 'dark' }}
          />
        </div>

      </div>
    </div>
  );
}