import { useState } from 'react';
import { 
  Bold, Italic, Heading, Link, Quote, AlignLeft, AlignRight, AlignCenter, 
  Columns, ChevronDown, Minus, Sparkles, Loader2 // NEW ICONS
} from 'lucide-react';

export default function Toolbar({ onInsert, activeTemplate, onMagic, isMagicLoading }) {
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);

  const isCinephile = activeTemplate?.container_class === 'cinephile-mode';

  const insertHeading = (tag) => {
    if (isCinephile) {
      onInsert(`<center><${tag}>`, `</${tag}></center>`);
    } else {
      onInsert(`<${tag}>`, `</${tag}>`);
    }
    setShowHeadingMenu(false);
  };

  return (
    <div className="flex items-center gap-1 border-b border-gray-100 p-2 bg-gray-50/50 flex-wrap relative">
      
      {/* Existing Buttons... */}
      <button onClick={() => onInsert('<strong>', '</strong>')} className="btn-tool" title="Bold"><Bold size={16} /></button>
      <button onClick={() => onInsert('<em>', '</em>')} className="btn-tool" title="Italic"><Italic size={16} /></button>
      <button onClick={() => onInsert('<a href="">', '</a>')} className="btn-tool" title="Link"><Link size={16} /></button>
      <button onClick={() => onInsert('<blockquote>', '</blockquote>')} className="btn-tool" title="Quote"><Quote size={16} /></button>

      <div className="w-px h-4 bg-gray-300 mx-1"></div>

      <div className="relative">
        <button onClick={() => setShowHeadingMenu(!showHeadingMenu)} className="btn-tool flex items-center gap-0.5" title="Headings">
          <Heading size={16} /> <ChevronDown size={10} />
        </button>
        {showHeadingMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-md z-50 min-w-[120px]">
            <button onClick={() => insertHeading('h1')} className="block w-full text-left px-3 py-2 text-xs hover:bg-red-50 font-bold border-b">H1</button>
            <button onClick={() => insertHeading('h2')} className="block w-full text-left px-3 py-2 text-xs hover:bg-red-50 font-semibold border-b">H2</button>
            <button onClick={() => insertHeading('h3')} className="block w-full text-left px-3 py-2 text-xs hover:bg-red-50">H3</button>
          </div>
        )}
      </div>

      <button onClick={() => onInsert('<hr />\n', '')} className="btn-tool" title="Horizontal Line"><Minus size={16} /></button>

      <div className="w-px h-4 bg-gray-300 mx-1"></div>

      {!isCinephile && <button onClick={() => onInsert('<div class="pull-left">', '</div>')} className="btn-tool"><AlignLeft size={16} /></button>}
      <button onClick={() => onInsert('<center>', '</center>')} className="btn-tool"><AlignCenter size={16} /></button>
      {!isCinephile && <button onClick={() => onInsert('<div class="pull-right">', '</div>')} className="btn-tool"><AlignRight size={16} /></button>}

      {isCinephile && (
        <>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <button onClick={() => onInsert('[dual]\n<strong>English</strong> <br/>\nText...\n---\n<strong>Español</strong> <br/>\nTexto...\n[/dual]', '')} className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-hive bg-red-50 hover:bg-red-100 rounded border border-red-100 transition">
            <Columns size={14} /> Dual
          </button>
        </>
      )}

      {/* --- NEW: THE MAGIC BRUSH --- */}
      <div className="ml-auto pl-2 border-l border-gray-200">
        <button 
          onClick={onMagic}
          disabled={isMagicLoading}
          className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded shadow-sm hover:shadow-md hover:opacity-90 transition text-xs font-bold disabled:opacity-50 disabled:cursor-wait"
        >
          {isMagicLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Magic Brush
        </button>
      </div>
      
      <style>{`
        .btn-tool { padding: 6px; color: #6b7280; border-radius: 4px; transition: all 0.2s; }
        .btn-tool:hover { color: #E31337; background-color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
}