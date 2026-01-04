import { useState, useEffect, useRef } from 'react';
import { parseToHiveHtml } from './lib/parser';
import { TEMPLATES } from './lib/templates';
import Preview from './components/Preview';
import DividerPicker from './components/DividerPicker';
import { Copy, Smartphone, Monitor, Trash2 } from 'lucide-react'; // Added icons

function App() {
  const textareaRef = useRef(null);

  // --- 1. NEW: Load saved text from LocalStorage (or use default) ---
  const [input, setInput] = useState(() => {
    const saved = localStorage.getItem('hive-studio-draft');
    return saved || `# My Hive Review

![Image](https://images.ecency.com/p/2dk2RRM2dZ8gKjXsrozapsD83FxL3Xbyyi5LFttAhrXxr16mCe4arfLHsBbWc33hHzCvh74ox4iNKgt3A6vFGuHkf9HLZf1F2of7TxAkFH4XmBA4EQvSC9nrHEZvhQmpYVtRKJtLFGebsRyseDESTQ8qDukLUcBxeuAYSKE5X3.png?format=match&mode=fit)

[dual]
**English side.**
I really liked the character development here.
---
**Spanish side.**
Realmente me gustó el desarrollo de personajes aquí.
[/dual]

Footer text.`;
  });

  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    return localStorage.getItem('hive-studio-template') || 'cinephile';
  });

  // --- 2. NEW: State for Mobile View Toggle ---
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [outputHtml, setOutputHtml] = useState('');

  // --- 3. NEW: Save to LocalStorage whenever you type ---
  useEffect(() => {
    localStorage.setItem('hive-studio-draft', input);
    localStorage.setItem('hive-studio-template', selectedTemplate);
  }, [input, selectedTemplate]);

  // Existing Parser Effect
  useEffect(() => {
    const process = async () => {
      const html = await parseToHiveHtml(input, selectedTemplate);
      setOutputHtml(html);
    };
    process();
  }, [input, selectedTemplate]);

  // Divider Insert (The Working HTML Version)
  const insertDivider = (url) => {
    const htmlCode = `\n<center><img src="${url}" /></center>\n`;
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const before = input.substring(0, start);
    const after = input.substring(end, input.length);
    
    setInput(before + htmlCode + after);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + htmlCode.length;
    }, 10);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputHtml);
    alert("HTML Copied! Ready to paste into Ecency/PeakD.");
  };

  // --- 4. NEW: Clear Draft Function ---
  const handleClear = () => {
    if (confirm("Are you sure? This will delete your current text.")) {
      setInput("");
      localStorage.removeItem('hive-studio-draft');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-hive">Hive Studio</h1>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Beta</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Clear Button */}
          <button 
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition mr-2"
          >
            <Trash2 size={14} /> Clear
          </button>

          <select 
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-hive"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            {TEMPLATES.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 bg-hive text-white px-4 py-2 rounded-lg hover:opacity-90 transition text-sm font-medium shadow-sm active:scale-95 cursor-pointer"
          >
            <Copy size={16} /> Copy Code
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Column (Editor) */}
        <div className="w-1/2 p-4 flex flex-col border-r border-gray-200 bg-white">
          <div className="flex justify-between items-end mb-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Markdown Input</label>
            <DividerPicker onSelect={insertDivider} />
          </div>
          
          <textarea
            ref={textareaRef}
            className="flex-1 w-full p-4 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive/20 resize-none font-mono text-sm leading-relaxed"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write your post here..."
            spellCheck="false"
          />
        </div>

        {/* Right Column (Preview) */}
        <div className="w-1/2 p-4 bg-gray-100/50 flex flex-col items-center">
          
          {/* Mobile Toggle Controls */}
          <div className="w-full flex justify-between items-center mb-2 px-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Real-time Preview</label>
            <div className="flex bg-gray-200 rounded p-1 gap-1">
              <button 
                onClick={() => setIsMobilePreview(false)}
                className={`p-1 rounded transition ${!isMobilePreview ? 'bg-white shadow text-hive' : 'text-gray-500'}`}
                title="Desktop View"
              >
                <Monitor size={14} />
              </button>
              <button 
                onClick={() => setIsMobilePreview(true)}
                className={`p-1 rounded transition ${isMobilePreview ? 'bg-white shadow text-hive' : 'text-gray-500'}`}
                title="Mobile View"
              >
                <Smartphone size={14} />
              </button>
            </div>
          </div>
          
          {/* Preview Container with Dynamic Width */}
          <div className={`transition-all duration-300 h-full ${isMobilePreview ? 'w-93.75' : 'w-full'}`}>
             <Preview htmlContent={outputHtml} />
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default App;