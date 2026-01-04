import { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Heading, 
  Link, 
  Quote, 
  AlignLeft, 
  AlignRight, 
  AlignCenter, 
  Columns,
  ChevronDown
} from 'lucide-react';

export default function Toolbar({ onInsert }) {
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);

  // Helper to close menu after picking a heading
  const insertHeading = (tag) => {
    onInsert(`<${tag}>`, `</${tag}>`);
    setShowHeadingMenu(false);
  };

  return (
    <div className="flex items-center gap-1 border-b border-gray-100 p-2 bg-gray-50/50 flex-wrap relative">
      
      {/* --- GROUP 1: Text Formatting --- */}
      <button onClick={() => onInsert('<strong>', '</strong>')} className="btn-tool" title="Bold">
        <Bold size={16} />
      </button>
      
      <button onClick={() => onInsert('<em>', '</em>')} className="btn-tool" title="Italic">
        <Italic size={16} />
      </button>
      
      <button onClick={() => onInsert('<a href="">', '</a>')} className="btn-tool" title="Link">
        <Link size={16} />
      </button>

      <button onClick={() => onInsert('<blockquote>', '</blockquote>')} className="btn-tool" title="Quote">
        <Quote size={16} />
      </button>

      <div className="w-px h-4 bg-gray-300 mx-1"></div>

      {/* --- GROUP 2: Headings (Dropdown) --- */}
      <div className="relative">
        <button 
          onClick={() => setShowHeadingMenu(!showHeadingMenu)} 
          className="btn-tool flex items-center gap-0.5" 
          title="Headings"
        >
          <Heading size={16} />
          <ChevronDown size={10} />
        </button>

        {/* The Dropdown Menu */}
        {showHeadingMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-md z-50 min-w-30 overflow-hidden">
            <button onClick={() => insertHeading('h1')} className="block w-full text-left px-3 py-2 text-xs hover:bg-red-50 hover:text-hive font-bold border-b border-gray-100">
              H1 - Title
            </button>
            <button onClick={() => insertHeading('h2')} className="block w-full text-left px-3 py-2 text-xs hover:bg-red-50 hover:text-hive font-semibold border-b border-gray-100">
              H2 - Section
            </button>
            <button onClick={() => insertHeading('h3')} className="block w-full text-left px-3 py-2 text-xs hover:bg-red-50 hover:text-hive">
              H3 - Subsection
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-gray-300 mx-1"></div>

      {/* --- GROUP 3: Layout & Alignment --- */}
      <button onClick={() => onInsert('<div class="pull-left">', '</div>')} className="btn-tool" title="Float Left">
        <AlignLeft size={16} />
      </button>

      <button onClick={() => onInsert('<center>', '</center>')} className="btn-tool" title="Center">
        <AlignCenter size={16} />
      </button>

      <button onClick={() => onInsert('<div class="pull-right">', '</div>')} className="btn-tool" title="Float Right">
        <AlignRight size={16} />
      </button>

      <div className="w-px h-4 bg-gray-300 mx-1"></div>

      {/* --- GROUP 4: Specials --- */}
      <button
        onClick={() => onInsert(
          '[dual]\n<strong>English</strong>\nText here...\n---\n<strong>Español</strong>\nTexto aquí...\n[/dual]', 
          ''
        )}
        className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-hive bg-red-50 hover:bg-red-100 rounded border border-red-100 transition"
      >
        <Columns size={14} /> Dual
      </button>
      
      {/* CSS Helper for the buttons to keep code clean */}
      <style>{`
        .btn-tool {
          padding: 6px;
          color: #6b7280;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .btn-tool:hover {
          color: #E31337;
          background-color: white;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
}