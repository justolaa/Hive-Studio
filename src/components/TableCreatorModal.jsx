import { useState } from 'react';
import { X, Table, Grid3X3, Check } from 'lucide-react';

export default function TableCreatorModal({ isOpen, onClose, onInsert }) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hoverRows, setHoverRows] = useState(0);
  const [hoverCols, setHoverCols] = useState(0);

  if (!isOpen) return null;

  const handleInsert = () => {
    // Generate Markdown Table
    let markdown = '\n';
    
    // Header Row
    markdown += '|';
    for (let c = 0; c < cols; c++) {
      markdown += ` Header ${c + 1} |`;
    }
    markdown += '\n';

    // Separator Row
    markdown += '|';
    for (let c = 0; c < cols; c++) {
      markdown += ' --- |';
    }
    markdown += '\n';

    // Body Rows
    for (let r = 0; r < rows; r++) {
      markdown += '|';
      for (let c = 0; c < cols; c++) {
        markdown += ` Cell ${r + 1}-${c + 1} |`;
      }
      markdown += '\n';
    }
    
    markdown += '\n';
    onInsert(markdown);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
      <div className="bg-bg-panel rounded-xl shadow-2xl border border-ui-border max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Table className="text-brand-accent" /> Insert Table
          </h2>
          <button onClick={onClose}><X className="text-text-muted hover:text-white" size={20} /></button>
        </div>

        {/* Visual Grid Selector */}
        <div className="mb-6 flex flex-col items-center">
          <div 
            className="grid gap-1 p-2 bg-bg-editor border border-ui-border rounded-lg"
            style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}
            onMouseLeave={() => { setHoverRows(0); setHoverCols(0); }}
          >
            {Array.from({ length: 64 }).map((_, i) => {
              const r = Math.floor(i / 8) + 1;
              const c = (i % 8) + 1;
              const isActive = r <= (hoverRows || rows) && c <= (hoverCols || cols);
              
              return (
                <div 
                  key={i}
                  onMouseEnter={() => { setHoverRows(r); setHoverCols(c); }}
                  onClick={() => { setRows(r); setCols(c); }}
                  className={`w-6 h-6 rounded-sm border transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-brand-primary/20 border-brand-primary' 
                      : 'bg-bg-panel border-ui-border hover:border-text-muted'
                  }`}
                />
              );
            })}
          </div>
          <div className="text-xs text-text-muted mt-2 font-mono">
            {(hoverRows || rows)} Rows x {(hoverCols || cols)} Cols
          </div>
        </div>

        {/* Manual Input Fallback */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Rows</label>
            <input 
              type="number" min="1" max="20"
              className="w-full p-2 bg-bg-editor border border-ui-border rounded-lg text-text-primary text-sm focus:border-brand-accent focus:outline-none text-center"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Columns</label>
            <input 
              type="number" min="1" max="10"
              className="w-full p-2 bg-bg-editor border border-ui-border rounded-lg text-text-primary text-sm focus:border-brand-accent focus:outline-none text-center"
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <button 
          onClick={handleInsert}
          className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white py-2.5 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2"
        >
          <Check size={16} /> Insert Table
        </button>

      </div>
    </div>
  );
}