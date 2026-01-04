import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase'; // Import DB connection
import { parseToHiveHtml } from './lib/parser';
import Preview from './components/Preview';
import DividerPicker from './components/DividerPicker';
import Toolbar from './components/Toolbar';
import HelpModal from './components/HelpModal';
import { Copy, Smartphone, Monitor, Trash2, FileText, HelpCircle, Loader2 } from 'lucide-react'; 

function App() {
  const textareaRef = useRef(null);
  
  // --- 1. NEW: Template State ---
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  
  // --- 2. Load Templates from Supabase ---
  useEffect(() => {
    async function loadTemplates() {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('name');
        
      if (error) {
        console.error("Error loading templates:", error);
      } else {
        setTemplates(data);
        // If we don't have a selected template yet, pick the first one
        if (data.length > 0 && !localStorage.getItem('hive-studio-template')) {
          setSelectedTemplate(data[0].id);
        }
      }
      setLoadingTemplates(false);
    }
    loadTemplates();
  }, []);

  // --- Standard State ---
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    return localStorage.getItem('hive-studio-template') || '';
  });

  const [input, setInput] = useState(() => {
    return localStorage.getItem('hive-studio-draft') || '';
  });

  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [outputHtml, setOutputHtml] = useState('');

  // Save draft
  useEffect(() => {
    localStorage.setItem('hive-studio-draft', input);
    localStorage.setItem('hive-studio-template', selectedTemplate);
  }, [input, selectedTemplate]);

  // --- 3. THE PARSER CONNECTION ---
  useEffect(() => {
    const process = async () => {
      // Find the active object from our DB list
      const active = templates.find(t => t.id === selectedTemplate) || templates[0];
      
      if (active) {
        // Construct the config object expected by the parser
        // We combine the JSONB 'config' column with the 'container_class' column
        const parserConfig = {
          ...active.config, 
          containerClass: active.container_class 
        };
        
        const html = await parseToHiveHtml(input, parserConfig);
        setOutputHtml(html);
      }
    };
    
    // Only run if templates are loaded
    if (templates.length > 0) {
      process();
    }
  }, [input, selectedTemplate, templates]);


  // Actions (Same as before)
  const insertDivider = (url) => {
    const htmlCode = `\n<center><img src="${url}" /></center>\n`;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setInput(input.substring(0, start) + htmlCode + input.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + htmlCode.length;
    }, 10);
  };

  const handleToolbarInsert = (startTag, endTag) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    setInput(text.substring(0, start) + startTag + text.substring(start, end) + endTag + text.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, end + startTag.length || start + startTag.length);
    }, 10);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputHtml);
    alert("HTML Copied! Ready to paste into Ecency/PeakD.");
  };

  const handleClear = () => {
    if (confirm("Are you sure? This will delete your current text.")) {
      setInput("");
      localStorage.removeItem('hive-studio-draft');
    }
  };

  const loadBlueprint = () => {
    if (confirm("Replace text with this template's blueprint?")) {
      const t = templates.find(temp => temp.id === selectedTemplate);
      // The DB column is named 'skeleton', make sure we use that
      if (t && t.skeleton) setInput(t.skeleton);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-hive">Hive Studio</h1>
          <button onClick={() => setIsHelpOpen(true)} className="text-gray-400 hover:text-hive transition">
            <HelpCircle size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleClear} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition mr-2">
            <Trash2 size={14} /> Clear
          </button>

          <div className="h-6 w-px bg-gray-200"></div>

          {/* Dynamic Template Picker */}
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded border border-gray-200 min-w-50">
            {loadingTemplates ? (
              <div className="flex items-center gap-2 px-2 text-xs text-gray-400">
                <Loader2 size={12} className="animate-spin" /> Loading styles...
              </div>
            ) : (
              <select 
                className="text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-medium cursor-pointer w-full"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
            
            <button 
              onClick={loadBlueprint}
              className="p-1 text-gray-500 hover:text-hive hover:bg-white rounded shadow-sm transition"
              title="Load Blueprint"
              disabled={loadingTemplates}
            >
              <FileText size={14} />
            </button>
          </div>
          
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 bg-hive text-white px-4 py-2 rounded-lg hover:opacity-90 transition text-sm font-medium shadow-sm active:scale-95 cursor-pointer ml-2"
          >
            <Copy size={16} /> Copy Code
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Column (Editor) */}
        <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Editor</label>
            <DividerPicker onSelect={insertDivider} />
          </div>

          <Toolbar onInsert={handleToolbarInsert} />
          
          <textarea
            ref={textareaRef}
            className="flex-1 w-full p-4 focus:outline-none resize-none font-mono text-sm leading-relaxed"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write your post here..."
            spellCheck="false"
          />
        </div>

        {/* Right Column (Preview) */}
        <div className="w-1/2 p-4 bg-gray-100/50 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-2 px-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Real-time Preview</label>
            <div className="flex bg-gray-200 rounded p-1 gap-1">
              <button onClick={() => setIsMobilePreview(false)} className={`p-1 rounded transition ${!isMobilePreview ? 'bg-white shadow text-hive' : 'text-gray-500'}`}><Monitor size={14} /></button>
              <button onClick={() => setIsMobilePreview(true)} className={`p-1 rounded transition ${isMobilePreview ? 'bg-white shadow text-hive' : 'text-gray-500'}`}><Smartphone size={14} /></button>
            </div>
          </div>
          
          <div className={`transition-all duration-300 h-full ${isMobilePreview ? 'w-93.75' : 'w-full'}`}>
             <Preview htmlContent={outputHtml} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;