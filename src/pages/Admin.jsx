import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generateTemplateFromInput } from '../lib/magic';
import Preview from '../components/Preview';
import { parseToHiveHtml } from '../lib/parser';
import { Loader2, Sparkles, Save, LogOut, Trash2, Edit, Plus, Image as ImageIcon, RefreshCw } from 'lucide-react';

export default function Admin() {
  const [session, setSession] = useState(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Data State
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Generator State
  const [rawInput, setRawInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'library'
  
  // The Draft Template
  const [draft, setDraft] = useState({
    id: null, // If ID exists, we are UPDATING, else INSERTING
    name: '',
    category: 'General',
    container_class: '',
    css_code: '',
    skeleton: '',
    description: '',
    thumbnail_url: '' // NEW FIELD
  });

  const [previewHtml, setPreviewHtml] = useState('');

  // 1. AUTH & INITIAL LOAD
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchTemplates();
    });
  }, []);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    const { data, error } = await supabase.from('templates').select('*').order('name');
    if (!error) setTemplates(data);
    setLoadingTemplates(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else fetchTemplates();
    setAuthLoading(false);
  };

  // 2. AI GENERATOR
  const handleAnalyze = async () => {
    if (!rawInput) return;
    setIsGenerating(true);
    try {
      const result = await generateTemplateFromInput(rawInput);
      // Reset ID to null so we create a NEW template, not update an old one
      setDraft(prev => ({ ...prev, ...result, id: null }));
      setActiveTab('edit'); // Switch to edit view to see result
    } catch (err) {
      alert("AI Error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. PREVIEW RENDERER
  useEffect(() => {
    const renderPreview = async () => {
      const config = {
        containerClass: draft.container_class,
        dualWrapper: 'row', 
        left: 'col-6',
        right: 'col-6'
      };
      // Use the parser
      const html = await parseToHiveHtml(draft.skeleton, config);
      setPreviewHtml(html);
    };
    renderPreview();
  }, [draft.skeleton, draft.container_class]);

  // 4. SAVE (Insert or Update)
  const handleSave = async () => {
    if (!draft.name || !draft.skeleton) return alert("Missing data");
    
    // Default config if missing
    const finalData = {
      name: draft.name,
      category: draft.category,
      container_class: draft.container_class,
      css_code: draft.css_code,
      skeleton: draft.skeleton,
      description: draft.description,
      thumbnail_url: draft.thumbnail_url,
      config: { dualWrapper: "text-justify", left: "pull-left", right: "pull-right" }
    };

    let error;
    
    if (draft.id) {
      // UPDATE existing
      const res = await supabase.from('templates').update(finalData).eq('id', draft.id);
      error = res.error;
    } else {
      // INSERT new
      const res = await supabase.from('templates').insert([finalData]);
      error = res.error;
    }
    
    if (error) {
      alert("Error saving: " + error.message);
    } else {
      alert(draft.id ? "Template Updated!" : "Template Created!");
      fetchTemplates(); // Refresh list
      // Don't clear draft immediately so user can keep tweaking if they want
    }
  };

  // 5. DELETE
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this template? This cannot be undone.")) return;
    
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) alert("Error deleting: " + error.message);
    else {
      fetchTemplates();
      // If we deleted the active draft, clear the form
      if (draft.id === id) resetDraft();
    }
  };

  // 6. LOAD FOR EDITING
  const handleEdit = (template) => {
    setDraft(template);
    // Switch to Generate tab but keep form visible? No, usually side by side.
    // We don't need to change tabs because the list is always visible now.
  };

  const resetDraft = () => {
    setDraft({ id: null, name: '', category: 'General', container_class: '', css_code: '', skeleton: '', description: '', thumbnail_url: '' });
    setRawInput('');
  };

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 w-96">
          <h1 className="text-2xl font-bold text-hive mb-6 text-center">Admin Login</h1>
          <input className="w-full p-3 border rounded mb-4" type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full p-3 border rounded mb-6" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={authLoading} className="w-full bg-hive text-white py-3 rounded-lg font-bold">{authLoading ? "Checking..." : "Enter Studio"}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm shrink-0">
        <h1 className="text-xl font-bold text-gray-800">🏭 Template Factory</h1>
        <div className="flex gap-4">
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-red-500 text-sm font-bold"><LogOut size={16}/> Logout</button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* COL 1: LIBRARY (Existing Templates) */}
        <div className="w-64 bg-white border-r flex flex-col shrink-0">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500">LIBRARY ({templates.length})</span>
            <button onClick={resetDraft} className="p-1 hover:bg-white rounded text-hive" title="New Template"><Plus size={16}/></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingTemplates ? (
              <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto"/></div>
            ) : (
              templates.map(t => (
                <div key={t.id} className={`p-3 border-b flex justify-between items-center hover:bg-gray-50 cursor-pointer ${draft.id === t.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`} onClick={() => handleEdit(t)}>
                  <div className="truncate flex-1">
                    <div className="font-bold text-sm text-gray-700 truncate">{t.name}</div>
                    <div className="text-[10px] text-gray-400">{t.category}</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} 
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COL 2: GENERATOR & FORM */}
        <div className="w-1/3 flex flex-col border-r bg-gray-50 overflow-y-auto">
          
          {/* AI Section */}
          <div className="p-4 border-b bg-white">
            <label className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-2">
              <Sparkles size={12} className="text-purple-500"/> AI GENERATOR
            </label>
            <div className="flex gap-2">
              <input 
                className="flex-1 p-2 text-xs border rounded bg-gray-50"
                placeholder="Paste HTML source code here..."
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
              />
              <button 
                onClick={handleAnalyze}
                disabled={isGenerating}
                className="bg-purple-600 text-white px-3 py-2 rounded text-xs font-bold hover:bg-purple-700 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin"/> : "Generate"}
              </button>
            </div>
          </div>

          {/* Edit Form */}
          <div className="p-4 flex-1 flex flex-col gap-3">
            <div className="flex justify-between items-center">
               <label className="text-xs font-bold text-gray-400">EDIT DETAILS</label>
               {draft.id && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Editing Mode</span>}
            </div>

            <input className="p-2 border rounded text-sm" placeholder="Template Name" value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} />
            
            <div className="flex gap-2">
              <input className="flex-1 p-2 border rounded text-sm" placeholder="Category" value={draft.category} onChange={e => setDraft({...draft, category: e.target.value})} />
              <input className="flex-1 p-2 border rounded text-sm font-mono text-red-600" placeholder=".class-name" value={draft.container_class} onChange={e => setDraft({...draft, container_class: e.target.value})} />
            </div>

            {/* THUMBNAIL INPUT (NEW) */}
            <div className="flex gap-2 items-center">
              <div className="bg-gray-200 p-2 rounded text-gray-500"><ImageIcon size={16}/></div>
              <input 
                className="flex-1 p-2 border rounded text-sm text-gray-600" 
                placeholder="Thumbnail URL (https://...)" 
                value={draft.thumbnail_url || ''} 
                onChange={e => setDraft({...draft, thumbnail_url: e.target.value})} 
              />
            </div>
            {draft.thumbnail_url && (
              <div className="h-20 w-full bg-gray-200 rounded overflow-hidden relative border">
                <img src={draft.thumbnail_url} className="w-full h-full object-cover" alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded">Card Preview</span>
              </div>
            )}

            <label className="text-xs font-bold text-gray-400 mt-2">CSS CODE</label>
            <textarea className="h-32 p-2 border rounded font-mono text-xs" value={draft.css_code} onChange={e => setDraft({...draft, css_code: e.target.value})} />

            <label className="text-xs font-bold text-gray-400 mt-2">SKELETON TEXT</label>
            <textarea className="flex-1 min-h-[200px] p-2 border rounded font-mono text-xs" value={draft.skeleton} onChange={e => setDraft({...draft, skeleton: e.target.value})} />
            
            <button onClick={handleSave} className="mt-2 flex justify-center items-center gap-2 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-sm">
              <Save size={18} /> {draft.id ? "Update Template" : "Save New Template"}
            </button>
          </div>
        </div>

        {/* COL 3: LIVE PREVIEW */}
        <div className="flex-1 p-4 bg-gray-200 flex flex-col border-l">
          <label className="text-xs font-bold text-gray-500 mb-2">LIVE PREVIEW</label>
          <div className="flex-1 shadow-lg">
            <Preview htmlContent={previewHtml} extraCss={draft.css_code} />
          </div>
        </div>

      </main>
    </div>
  );
}