import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase'; 
import { parseToHiveHtml } from '../lib/parser';
import Preview from '../components/Preview';
import DividerPicker from '../components/DividerPicker';
import Toolbar from '../components/Toolbar';
import HelpModal from '../components/HelpModal';
import TemplateGallery from '../components/TemplateGallery';
import LoginButton from '../components/LoginButton';
import PublishModal from '../components/PublishModal';
import { publishPost} from '../lib/hive';
import { Copy, Smartphone, Monitor, Trash2, FileText, HelpCircle, Loader2, LayoutTemplate, Send } from 'lucide-react'; 
import { polishText } from '../lib/magic';


export default function Home() {const textareaRef = useRef(null);
  
  // State
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  // Add these with your other states
const [username, setUsername] = useState(localStorage.getItem('hive_user') || '');
const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
const [isPublishing, setIsPublishing] = useState(false);
  
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    return localStorage.getItem('hive-studio-template') || '';
  });

  const [input, setInput] = useState(() => {
    return localStorage.getItem('hive-studio-draft') || '';
  });

  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false); // NEW STATE
  const [outputHtml, setOutputHtml] = useState('');

  // Load Templates
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
        if (data.length > 0 && !localStorage.getItem('hive-studio-template')) {
          setSelectedTemplate(data[0].id);
        }
      }
      setLoadingTemplates(false);
    }
    loadTemplates();
  }, []);

  // Save State
  useEffect(() => {
    localStorage.setItem('hive-studio-draft', input);
    localStorage.setItem('hive-studio-template', selectedTemplate);
  }, [input, selectedTemplate]);

  // Parser
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


  // Actions
  const handleLogin = (user) => {
  setUsername(user);
  localStorage.setItem('hive_user', user);
};

const handleLogout = () => {
  setUsername('');
  localStorage.removeItem('hive_user');
};

const handlePublish = async (title, tags) => {
    if (!username) return alert("Please login first!");
    
    setIsPublishing(true);
    try {
      // Use our new helper function
      // We pass 'outputHtml' because that is the formatted code
      const result = await publishPost(username, title, outputHtml, tags);

      alert(`Published successfully! 🚀\nPermlink: ${result.permlink}`);
      setIsPublishModalOpen(false);
      
      // Optional: Open the post in a new tab (PeakD)
      if(confirm("Open post in PeakD?")) {
        window.open(`https://peakd.com/@${username}/${result.permlink}`, '_blank');
      }
      
    } catch (error) {
      console.error(error);
      alert("Publish failed: " + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

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
      if (t && t.skeleton) setInput(t.skeleton);
    }
  };

  const handleMagic = async () => {
    if (!input.trim()) return alert("Please write some text first!");
    
    // 1. Initial Confirmation
    if (!confirm("✨ Magic Brush will:\n1. Auto-format your text\n2. Insert relevant dividers\n3. Suggest the best template\n\nProceed?")) return;

    setIsMagicLoading(true);
    try {
      // 2. Call the AI
      const aiResponse = await polishText(input);
      
      // 3. Apply the Text formatting immediately
      setInput(aiResponse.formatted_text);

      // 4. Check for Template Suggestion
      // If the AI suggests a different template than the one currently selected...
      if (aiResponse.suggested_template_id && aiResponse.suggested_template_id !== selectedTemplate) {
        
        const switchMsg = `✨ AI Analysis Complete!\n\nTopic Detected: ${aiResponse.topic_detected}\nSuggested Template: ${aiResponse.suggested_template_name}\n\nDo you want to switch to this template?`;
        
        if (confirm(switchMsg)) {
          setSelectedTemplate(aiResponse.suggested_template_id);
        }
      } else {
        // Just notify success if no template switch needed
        alert(`✨ Magic Polish Complete! (Topic: ${aiResponse.topic_detected})`);
      }

    } catch (error) {
      console.error(error);
      alert("AI Error: " + error.message);
    } finally {
      setIsMagicLoading(false);
    }
  };
  // Helper to get active template name
  const activeTemplateName = templates.find(t => t.id === selectedTemplate)?.name || "Loading...";

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

        <PublishModal 
  isOpen={isPublishModalOpen} 
  onClose={() => setIsPublishModalOpen(false)} 
  onPublish={handlePublish}
  isPublishing={isPublishing}
/>
      
      {/* NEW: The Gallery Modal */}
      <TemplateGallery 
        isOpen={isGalleryOpen} 
        onClose={() => setIsGalleryOpen(false)}
        templates={templates}
        selectedId={selectedTemplate}
        onSelect={setSelectedTemplate}
      />

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

          {/* NEW: Gallery Button & Blueprint Button Group */}
          <div className="flex items-center gap-0 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            
            {/* 1. Open Gallery */}
            <button 
              onClick={() => setIsGalleryOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white hover:text-hive transition text-sm font-medium text-gray-700 border-r border-gray-200"
              title="Browse Templates"
            >
              <LayoutTemplate size={14} />
              {loadingTemplates ? <Loader2 size={12} className="animate-spin" /> : activeTemplateName}
            </button>
            
            {/* 2. Load Blueprint */}
            <button 
              onClick={loadBlueprint}
              className="px-3 py-1.5 hover:bg-white hover:text-hive transition text-gray-500"
              title="Load Blueprint (Starter Text)"
              disabled={loadingTemplates}
            >
              <FileText size={14} />
            </button>
          </div>
          
          <LoginButton username={username} onLogin={handleLogin} onLogout={handleLogout} />

<div className="h-6 w-px bg-gray-200 mx-2"></div>

{/* Publish Actions */}
<div className="flex gap-2">
  <button 
    onClick={handleCopy}
    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
  >
    <Copy size={16} /> Code
  </button>

  <button 
    onClick={() => {
      if(!username) return alert("Please login to publish!");
      setIsPublishModalOpen(true);
    }}
    className="flex items-center gap-2 bg-hive text-white px-4 py-2 rounded-lg hover:opacity-90 transition text-sm font-bold shadow-sm active:scale-95"
  >
    <Send size={16} /> Publish
  </button>
</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Column (Editor) */}
        {/* UPDATE 2: Change 'w-1/2' to 'w-full md:w-1/2' */}
        {/* UPDATE 3: On mobile, we want the editor to take 50% height, or you can use tabs */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col border-r border-gray-200 bg-white">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Editor</label>
            <DividerPicker onSelect={insertDivider} />
          </div>

          <Toolbar 
            onInsert={handleToolbarInsert} 
            activeTemplate={templates.find(t => t.id === selectedTemplate)}
            onMagic={handleMagic}
            isMagicLoading={isMagicLoading}
          />
          
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
        {/* UPDATE 4: Change width and height for mobile */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full p-4 bg-gray-100/50 flex flex-col items-center border-t md:border-t-0">
          <div className="w-full flex justify-between items-center mb-2 px-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Real-time Preview</label>
            <div className="flex bg-gray-200 rounded p-1 gap-1">
              <button onClick={() => setIsMobilePreview(false)} className={`p-1 rounded transition ${!isMobilePreview ? 'bg-white shadow text-hive' : 'text-gray-500'}`}><Monitor size={14} /></button>
              <button onClick={() => setIsMobilePreview(true)} className={`p-1 rounded transition ${isMobilePreview ? 'bg-white shadow text-hive' : 'text-gray-500'}`}><Smartphone size={14} /></button>
            </div>
          </div>
          
          {/* Note: The inner mobile preview toggle still works within this container */}
          <div className={`transition-all duration-300 h-full ${isMobilePreview ? 'w-[375px]' : 'w-full'}`}>
             <Preview htmlContent={outputHtml} />
          </div>
        </div>
      </main>
    </div>
  );
}