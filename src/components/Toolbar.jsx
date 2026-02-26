import { useState } from 'react';
import { 
  Bold, Italic, Heading, Link, Quote, AlignLeft, AlignRight, AlignCenter, 
  Columns, ChevronDown, Minus, Sparkles, Loader2, Image as ImageIcon, Video,Table
} from 'lucide-react';

export default function Toolbar({ onInsert, activeTemplate, onMagic, isMagicLoading, onImage, onVideo, onTable }) {
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);

  // --- THE FIX ---
  // We check if the class OR the name contains 'cinephile'. 
  // This ensures the button appears even if you renamed the class slightly in the Admin panel.
  const isCinephile = 
    activeTemplate?.container_class?.toLowerCase().includes('cinephile') || 
    activeTemplate?.name?.toLowerCase().includes('cinephile');

  const insertHeading = (tag) => {
    // Smart Heading: Center it if we are in Cinephile mode
    const code = isCinephile ? `<center><${tag}>` : `<${tag}>`;
    const endCode = isCinephile ? `</${tag}></center>` : `</${tag}>`;
    
    onInsert(code, endCode);
    setShowHeadingMenu(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-y-2 p-2 bg-bg-panel border-b border-ui-border select-none">
      
      {/* LEFT: Formatting Tools */}
      <div className="flex items-center gap-1">
        
        {/* Typography */}
        <div className="flex gap-0.5">
          <button onClick={() => onInsert('<strong>', '</strong>')} className="btn-tool" title="Bold"><Bold size={15} /></button>
          <button onClick={() => onInsert('<em>', '</em>')} className="btn-tool" title="Italic"><Italic size={15} /></button>
          
          <div className="relative">
            <button onClick={() => setShowHeadingMenu(!showHeadingMenu)} className="btn-tool flex items-center gap-0.5" title="Headings">
              <Heading size={15} /> <ChevronDown size={10} />
            </button>
            {showHeadingMenu && (
              <div className="absolute top-full left-0 mt-2 bg-bg-panel-soft border border-ui-border shadow-xl rounded-lg z-50 min-w-[140px] overflow-hidden">
                <button onClick={() => insertHeading('h1')} className="block w-full text-left px-4 py-2 text-xs hover:bg-ui-hover text-text-primary font-bold">Heading 1</button>
                <button onClick={() => insertHeading('h2')} className="block w-full text-left px-4 py-2 text-xs hover:bg-ui-hover text-text-primary font-semibold">Heading 2</button>
                <button onClick={() => insertHeading('h3')} className="block w-full text-left px-4 py-2 text-xs hover:bg-ui-hover text-text-primary">Heading 3</button>
              </div>
            )}
          </div>
        </div>

        <div className="w-px h-4 bg-ui-divider mx-2"></div>

        {/* Structure */}
        <div className="flex gap-0.5">
          <button onClick={() => onInsert('<a href="">', '</a>')} className="btn-tool" title="Link"><Link size={15} /></button>
          <button onClick={onImage} className="btn-tool" title="Upload/Gallery"><ImageIcon size={15} /></button>
          <button onClick={onVideo} className="btn-tool" title="Embed Video (YT/3Speak)"><Video size={15} /></button>
          <button onClick={() => onInsert('<blockquote>', '</blockquote>')} className="btn-tool" title="Quote"><Quote size={15} /></button>
          <button onClick={onTable} className="btn-tool" title="Insert Table"><Table size={15} /></button>
          <button onClick={() => onInsert('<hr />\n', '')} className="btn-tool" title="Divider"><Minus size={15} /></button>
        </div>

        <div className="w-px h-4 bg-ui-divider mx-2"></div>

        {/* Layout Group */}
        <div className="flex gap-0.5">
          {/* Hide Left/Right if Cinephile (Strict Mode) */}
          {!isCinephile && <button onClick={() => onInsert('<div class="pull-left">', '</div>')} className="btn-tool"><AlignLeft size={15} /></button>}
          
          <button onClick={() => onInsert('<center>', '</center>')} className="btn-tool"><AlignCenter size={15} /></button>
          
          {!isCinephile && <button onClick={() => onInsert('<div class="pull-right">', '</div>')} className="btn-tool"><AlignRight size={15} /></button>}
          
          {/* Show Dual if Cinephile */}
          {isCinephile && (
            <button 
              onClick={() => onInsert('[dual]\n<strong>English</strong> <br/>\nText...\n---\n<strong>Español</strong> <br/>\nTexto...\n[/dual]', '')} 
              className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-text-primary bg-bg-panel-soft hover:bg-ui-hover rounded border border-ui-border transition ml-1"
              title="Insert Dual Columns"
            >
              <Columns size={14} className="text-brand-primary" /> Dual
            </button>
          )}
        </div>
      </div>

      {/* RIGHT: Magic Brush */}
      <div>
        <button 
          onClick={onMagic}
          disabled={isMagicLoading}
          className="group relative flex items-center gap-2 px-3 py-1.5 rounded-md text-white text-xs font-bold transition-all duration-300
            bg-gradient-to-r from-brand-primary via-purple-600 to-brand-accent
            hover:shadow-[0_0_15px_rgba(227,19,55,0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          {isMagicLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="group-hover:animate-pulse" />}
          <span>Magic Brush</span>
        </button>
      </div>
      
      <style>{`
        .btn-tool { 
          padding: 6px; 
          color: var(--color-text-secondary); 
          border-radius: 4px; 
          transition: all 0.2s; 
        }
        .btn-tool:hover { 
          color: var(--color-text-primary); 
          background-color: var(--color-ui-hover); 
        }
      `}</style>
    </div>
  );
}