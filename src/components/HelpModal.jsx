import { useState } from 'react';
import { X, Columns, Image, Sparkles, PlayCircle, BookOpen } from 'lucide-react';
import { PopupModal } from "react-calendly";

export default function HelpModal({ isOpen, onClose }) {
  const[isCalendlyOpen, setIsCalendlyOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
      <div className="bg-bg-panel rounded-xl shadow-2xl border border-ui-border max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-ui-border flex justify-between items-center bg-bg-panel-soft shrink-0">
          <h2 className="font-bold text-text-primary flex items-center gap-2 text-lg tracking-tight">
            <BookOpen size={18} className="text-brand-primary" /> 
            How to use Hive Studio
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-bg-editor rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-bg-app/50">
          
          {/* ARCADE DEMO EMBED */}
          <div className="mb-8 bg-bg-editor rounded-xl border border-ui-border p-3 shadow-inner">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
              <PlayCircle size={14} className="text-brand-accent"/> Interactive Walkthrough
            </h3>
            <div style={{ position: 'relative', paddingBottom: 'calc(46.925329428989755% + 41px)', height: '0', width: '100%' }}>
              <iframe
                // 👇 FIX: Changed embed_mobile=tab to embed_mobile=inline
                src="https://demo.arcade.software/t9j8roh8VrCSNxyHwUcP?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
                title="Format and Preview a Bilingual Blog Post in Hive Studio"
                frameBorder="0"
                loading="lazy"
                allowFullScreen
                allow="clipboard-write"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', colorScheme: 'dark', borderRadius: '8px' }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Section 1 */}
            <div className="flex gap-4 p-4 bg-bg-panel rounded-xl border border-ui-border hover:border-brand-primary/30 transition">
              <div className="bg-brand-primary/10 p-2.5 rounded-lg h-fit text-brand-primary border border-brand-primary/20">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">1. The Magic Brush</h3>
                <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                  Type your text normally. Don't worry about formatting. Click the Magic Brush and our AI will automatically add headers, dividers, and structure based on your selected template without rewriting your words.
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="flex gap-4 p-4 bg-bg-panel rounded-xl border border-ui-border hover:border-brand-accent/30 transition">
              <div className="bg-brand-accent/10 p-2.5 rounded-lg h-fit text-brand-accent border border-brand-accent/20">
                <Columns size={20} />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">2. Dual Language Posts</h3>
                <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                  Use the <b>Dual</b> button in the toolbar. Put your English text first, a <code className="bg-bg-editor px-1.5 py-0.5 rounded text-brand-accent border border-ui-border">---</code> separator on a new line, and your translation below it. The app handles the side-by-side columns instantly.
                </p>
              </div>
            </div>

            {/* Section 3 */}
            <div className="flex gap-4 p-4 bg-bg-panel rounded-xl border border-ui-border hover:border-blue-500/30 transition">
              <div className="bg-blue-500/10 p-2.5 rounded-lg h-fit text-blue-400 border border-blue-500/20">
                <Image size={20} />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">3. Media & Embeds</h3>
                <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                  Click the Image icon to upload directly to your personal gallery (up to 15MB). Click the Video icon to instantly embed responsive YouTube or 3Speak players.
                </p>
              </div>
            </div>
          </div>

          {/* Hire Me CTA - In App Calendly */}
          <div className="mt-8 p-5 bg-gradient-to-r from-bg-panel to-bg-panel-soft border border-ui-border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div>
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                Built by an AI & Web3 Developer
              </h4>
              <p className="text-xs text-text-muted mt-1">Need a custom app, automation, or frontend architecture?</p>
            </div>
            
            <button 
              onClick={() => setIsCalendlyOpen(true)}
              className="px-5 py-2.5 bg-brand-primary hover:bg-brand-soft text-white text-xs font-bold rounded-lg transition shadow-[0_0_15px_rgba(227,19,55,0.3)] hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              Book a Discovery Call
            </button>
          </div>

        </div>
      </div>

      {/* Calendly Popup Modal */}
      <PopupModal
        url="https://calendly.com/idowuolamide81" // <--- PASTE YOUR CALENDLY LINK HERE
        pageSettings={{
          backgroundColor: '0F1117',
          hideEventTypeDetails: false,
          hideLandingPageDetails: false,
          primaryColor: 'E31337',
          textColor: 'E6EAF2'
        }}
        onModalClose={() => setIsCalendlyOpen(false)}
        open={isCalendlyOpen}
        rootElement={document.getElementById("root")}
      />
    </div>
  );
}