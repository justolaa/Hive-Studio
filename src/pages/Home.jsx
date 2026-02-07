import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase'; 
import { parseToHiveHtml } from '../lib/parser';
import { logEvent } from '../lib/analytics';
import Preview from '../components/Preview';
import DividerPicker from '../components/DividerPicker';
import Toolbar from '../components/Toolbar';
import HelpModal from '../components/HelpModal';
import TemplateGallery from '../components/TemplateGallery';
import LoginButton from '../components/LoginButton';
import PublishModal from '../components/PublishModal';
import MagicResultModal from '../components/MagicResultModal';
import ImageManager from '../components/ImageManager';
import { publishPost } from '../lib/hive';
import { polishText } from '../lib/magic';
import { Copy, Smartphone, Monitor, Trash2, FileText, HelpCircle, Loader2, LayoutTemplate, Send, Menu } from 'lucide-react'; 
import { Link } from 'react-router-dom';

export default function Home() {
  const textareaRef = useRef(null);
  
  // --- STATE ---
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [magicResult, setMagicResult] = useState(null); // Stores AI result
const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
const [isRePolishing, setIsRePolishing] = useState(false); // For the 2nd pass
const rawTextRef = useRef(''); 
  
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    return localStorage.getItem('hive-studio-template') || '';
  });

 const [input, setInput] = useState(() => {
    // If they have a saved draft, load it.
    const saved = localStorage.getItem('hive-studio-draft');
    if (saved) return saved;

    // If new user, show a CLEAN start instead of code
    return `# My New Post

Start writing here...

(Click "Magic Brush" to format, or the File icon above to load a template blueprint)`;
  });

  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [outputHtml, setOutputHtml] = useState('');
  const [username, setUsername] = useState(localStorage.getItem('hive_user') || '');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    async function loadTemplates() {
      const { data, error } = await supabase.from('templates').select('*').order('name');
      if (!error) {
        setTemplates(data);
        if (data.length > 0 && !localStorage.getItem('hive-studio-template')) {
          setSelectedTemplate(data[0].id);
        }
      }
      setLoadingTemplates(false);
    }
    loadTemplates();
  }, []);

  useEffect(() => {
    localStorage.setItem('hive-studio-draft', input);
    localStorage.setItem('hive-studio-template', selectedTemplate);
  }, [input, selectedTemplate]);

  useEffect(() => {
    const process = async () => {
      const active = templates.find(t => t.id === selectedTemplate) || templates[0];
      if (active) {
        const parserConfig = { ...active.config, containerClass: active.container_class };
        const html = await parseToHiveHtml(input, parserConfig);
        setOutputHtml(html);
      }
    };
    if (templates.length > 0) process();
  }, [input, selectedTemplate, templates]);

  // --- HANDLERS ---
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

     // --- TRACKING ---
    logEvent('copy_code', {
      username: username || 'anonymous',
      template: activeTemplateName
    });
    // ----------------
    alert("HTML Copied! Ready to paste into Ecency/PeakD.");
  };

  const handleClear = () => {
    if (confirm("Are you sure? This will delete your current text.")) {
      setInput("");
      localStorage.removeItem('hive-studio-draft');
    }
  };

  const loadBlueprint = () => {
    if (confirm("Replace current text with this template's blueprint?")) {
      const t = templates.find(temp => temp.id === selectedTemplate);
      if (t && t.skeleton) setInput(t.skeleton);
    }
  };

  const handleLogin = (user) => {
    setUsername(user);
    localStorage.setItem('hive_user', user);
  };

  const handleLogout = () => {
    setUsername('');
    localStorage.removeItem('hive_user');
  };

  // Updated to accept the data object from the modal
  const handlePublish = async (publishData) => {
    if (!username) return alert("Please login first!");
    
    setIsPublishing(true);
    try {
      // 1. Publish to Blockchain
      const result = await publishPost(username, publishData, outputHtml);
      
      // 2. Track Event (FIXED)
      // We access tags from 'publishData.tags'
      logEvent('publish_success', {
        username: username,
        template: activeTemplateName,
        meta: { 
          frontend: 'hive-studio', 
          tags: publishData.tags, // <--- The Fix
          community: publishData.community || 'blog'
        }
      });
      
      alert(`Published successfully! 🚀\nPermlink: ${result.permlink}`);
      setIsPublishModalOpen(false);
      
      if(confirm("Open post in PeakD?")) {
        window.open(`https://peakd.com/@${username}/${result.permlink}`, '_blank');
      }
    } catch (error) {
      alert("Publish failed: " + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleMagic = async () => {
    if (!input.trim()) return alert("Please write some text first!");
    
    // 1. CACHE RAW TEXT IN REF (Immediate & Permanent)
    rawTextRef.current = input;

    // Custom confirm dialog for Magic Brush
    // Note: If you want to skip this confirm since we have the modal, you can.
    // if (!confirm("Proceed with AI formatting?")) return; 

    setIsMagicLoading(true);
    try {
      const activeTemplateName = templates.find(t => t.id === selectedTemplate)?.name || "Standard";

       // --- TRACKING ---
      logEvent('magic_brush_used', {
        username: username || 'anonymous',
        template: activeTemplateName,
        meta: { length: input.length } // Track how long the text was
      });
      // ----------------
      // Pass ID if we have it, otherwise Name
      const aiResponse = await polishText(input, selectedTemplate || "standard");
      
      setMagicResult(aiResponse);
      setInput(aiResponse.formatted_text);

      if (aiResponse.suggested_template_id && aiResponse.suggested_template_id !== selectedTemplate) {
        setIsMagicModalOpen(true);
      } else {
        alert(`✨ Magic Polish Complete! (Topic: ${aiResponse.topic_detected})`);
      }
    } catch (error) {
      alert("AI Error: " + error.message);
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (magicResult?.suggested_template_id) {
      const newId = magicResult.suggested_template_id;
      setSelectedTemplate(newId);
      rePolish(newId); // Auto-repolish with new rules
    }
    setIsMagicModalOpen(false);
  };

  const handleOpenManualGallery = () => {
    setIsMagicModalOpen(false);
    setIsGalleryOpen(true);
    setIsRePolishing(true);
  };

  // Option 3: Keep Current (Just close)
  const handleKeepCurrent = () => {
    setIsMagicModalOpen(false);
  };

  const handleTemplateSelect = (id) => {
    setSelectedTemplate(id);
    if (isRePolishing) {
      rePolish(id);
    }
  };

  

  const rePolish = async (newTemplateId) => {
    setIsMagicLoading(true); 
    try {
      // 2. USE CACHED RAW TEXT
      // Use the clean text we saved before the first AI pass
      const textToPolish = rawTextRef.current || input; 
      
      console.log("Re-Polishing with Template ID:", newTemplateId); // Debug Log
      
      const newFormat = await polishText(textToPolish, newTemplateId);
      setInput(newFormat.formatted_text);
    } catch (e) {
      console.error("Re-polish failed", e);
      alert("Failed to apply new template: " + e.message);
    } finally {
      setIsMagicLoading(false);
      setIsRePolishing(false);
    }
  };

  const handleImageInsert = (html) => {
  const textarea = textareaRef.current;
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  setInput(text.substring(0, start) + html + text.substring(end));
};

  const activeTemplateName = templates.find(t => t.id === selectedTemplate)?.name || "Loading...";

  // Calculate word count
  // 1. Trim whitespace from start/end
  // 2. Split by any whitespace character (space, tab, newline)
  // 3. Filter out empty strings to handle double spaces correctly
  const wordCount = input.trim() === '' ? 0 : input.trim().split(/\s+/).length;

  // --- NEW UI RENDER ---
  return (
    <div className="h-screen flex flex-col bg-bg-app text-text-primary overflow-hidden font-sans">
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      
      {/* NEW MODAL */}
      <MagicResultModal 
        isOpen={isMagicModalOpen}
        onClose={() => setIsMagicModalOpen(false)}
        aiData={magicResult}
        onApplySuggestion={handleAcceptSuggestion}
        onOpenGallery={handleOpenManualGallery}
        onKeepCurrent={handleKeepCurrent}
      />

      <TemplateGallery 
        isOpen={isGalleryOpen} 
        onClose={() => {
          setIsGalleryOpen(false);
          setIsRePolishing(false); // Cancel magic mode if closed without picking
        }}
        templates={templates}
        selectedId={selectedTemplate}
        onSelect={handleTemplateSelect} // Use the new handler
      />
      
      <PublishModal 
        isOpen={isPublishModalOpen} 
        onClose={() => setIsPublishModalOpen(false)} 
        onPublish={handlePublish}
        isPublishing={isPublishing}
        username={username} // <--- ADD THIS LINE
      />

      <ImageManager 
  isOpen={isImageModalOpen} 
  onClose={() => setIsImageModalOpen(false)}
  onInsert={handleImageInsert}
  username={username} // Crucial: Pass username for folder structure
/>

      {/* HEADER: Dark Panel */}
      <header className="bg-bg-panel border-b border-ui-border px-6 py-3 flex justify-between items-center shadow-lg z-20 shrink-0">
        <div className="flex items-center gap-3">
  <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
    <div className="bg-brand-primary/10 p-2 rounded-lg border border-brand-primary/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 8L12 3L20 8V18L12 23L4 18V8Z" stroke="#E31337" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight leading-none">Hive Studio</h1>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold mt-0.5">Creator Terminal</p>
          </div>
           </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <LoginButton username={username} onLogin={handleLogin} onLogout={handleLogout} />
          
          <div className="h-6 w-px bg-ui-divider"></div>

          {/* Template Selector Button */}
          <button 
            onClick={() => setIsGalleryOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-bg-panel-soft hover:bg-ui-hover text-text-secondary hover:text-text-primary rounded-lg border border-ui-border transition text-sm group"
          >
            <LayoutTemplate size={14} className="text-text-muted group-hover:text-brand-primary transition-colors"/>
            {loadingTemplates ? <Loader2 size={12} className="animate-spin" /> : activeTemplateName}
          </button>

          {/* Publish Button (Gradient Accent) */}
          <button 
            onClick={() => { if(!username) return alert("Login first!"); setIsPublishModalOpen(true); }}
            className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/90 text-white px-5 py-2 rounded-lg transition text-xs font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)] active:scale-95"
          >
            <Send size={14} /> PUBLISH
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      {/* MAIN WORKSPACE */}
      {/* Container: Flex Column on Mobile, Row on Desktop */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-bg-app p-0 md:p-4 gap-4">
        
        {/* LEFT: EDITOR PANEL */}
        {/* FIX: Added 'h-1/2 md:h-full'. 
            On mobile, it takes top 50%. On desktop, it takes full height. */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col bg-bg-panel rounded-none md:rounded-xl border-b md:border border-ui-border shadow-2xl overflow-hidden shrink-0">
          
          {/* Editor Header Bar */}
          <div className="flex justify-between items-center px-4 py-2 border-b border-ui-border bg-bg-panel-soft shrink-0">
            <div className="flex items-center gap-3">
               <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
               </div>
               <div className="h-4 w-px bg-ui-divider mx-1"></div>
               <button onClick={handleClear} title="Clear Editor" className="text-text-muted hover:text-brand-primary transition">
                  <Trash2 size={14} />
               </button>
               
               <button 
                  onClick={loadBlueprint}
                  className={`flex items-center gap-2 px-2 py-1 hover:bg-ui-hover text-text-secondary hover:text-text-primary rounded-lg border border-transparent hover:border-ui-border transition text-xs ${
                    input.length < 200 ? "animate-pulse text-brand-primary" : ""
                  }`}
                  title="Load Template Blueprint"
                >
                  <FileText size={14} />
                  <span className="hidden lg:inline">Blueprint</span>
                </button>
            </div>
            
            <div className="scale-90 origin-right">
               <DividerPicker onSelect={insertDivider} />
            </div>
          </div>

          <Toolbar 
            onInsert={handleToolbarInsert} 
            activeTemplate={templates.find(t => t.id === selectedTemplate)}
            onMagic={handleMagic}
            isMagicLoading={isMagicLoading}
            onImage={() => {
               if (!username) return alert("Please login to upload images.");
               setIsImageModalOpen(true);
             }}
          />
          
          {/* The Editor Textarea */}
          <div className="flex-1 relative bg-bg-editor">
           <textarea
              ref={textareaRef}
              className="absolute inset-0 w-full h-full p-6 bg-transparent text-text-primary resize-none focus:outline-none font-mono text-sm leading-loose" 
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="# Start writing your masterpiece..."
              spellCheck="false"
            />
          </div>
          
          <div className="px-4 py-1.5 bg-bg-panel border-t border-ui-border flex justify-between items-center text-[10px] text-text-muted">
             <span>Markdown Supported</span>
             <span className="font-mono">{wordCount} words</span>
          </div>
        </div>

        {/* RIGHT: PREVIEW PANEL */}
        {/* FIX: Added 'h-1/2 md:h-full'. 
            On mobile, it takes bottom 50%. On desktop, it takes full height. */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col bg-bg-panel-soft rounded-none md:rounded-xl border-t md:border border-ui-border shadow-xl overflow-hidden relative">
          
          <div className="flex justify-between items-center px-4 py-3 border-b border-ui-border bg-bg-panel shrink-0">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-success shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> 
              PeakD Preview
            </label>
            
            <div className="flex bg-bg-editor rounded-lg p-0.5 gap-1 border border-ui-border">
              <button 
                onClick={() => setIsMobilePreview(false)}
                className={`p-1.5 rounded-md transition ${!isMobilePreview ? 'bg-bg-panel-soft text-brand-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
                title="Desktop View"
              >
                <Monitor size={14} />
              </button>
              <button 
                onClick={() => setIsMobilePreview(true)}
                className={`p-1.5 rounded-md transition ${isMobilePreview ? 'bg-bg-panel-soft text-brand-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
                title="Mobile View"
              >
                <Smartphone size={14} />
              </button>
            </div>
          </div>
          
          {/* Preview Canvas */}
          <div className={`flex-1 bg-bg-panel-soft relative transition-all duration-300 ${
            isMobilePreview 
              ? 'overflow-y-auto p-4 flex justify-center items-start' 
              : 'overflow-hidden p-4 md:p-8 flex justify-center items-start h-full' 
          }`}>
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

             <div className={`transition-all duration-500 ease-in-out bg-white shadow-2xl flex flex-col shrink-0 ${
                isMobilePreview 
                  ? 'w-[375px] h-[667px] rounded-[30px] border-[8px] border-bg-editor overflow-hidden mb-8' 
                  : 'w-full h-full rounded-sm overflow-hidden' 
             }`}>
                <div className="flex-1 h-full w-full relative">
                   <Preview htmlContent={outputHtml} />
                </div>
             </div>
          </div>
          
          <div className="px-4 py-2 bg-bg-panel border-t border-ui-border flex justify-end gap-3 shrink-0 z-10">
             <button onClick={() => setIsHelpOpen(true)} className="text-text-muted hover:text-brand-primary transition flex items-center gap-1 text-xs">
                <HelpCircle size={14} /> Help
             </button>
             <button onClick={handleCopy} className="text-text-muted hover:text-brand-primary transition flex items-center gap-1 text-xs">
                <Copy size={14} /> Copy HTML
             </button>
          </div>
        </div>

      </main>
    </div>
  );
}