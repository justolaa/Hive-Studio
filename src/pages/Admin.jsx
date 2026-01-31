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
  const [activeTab, setActiveTab] = useState('generate');
  
  // The Draft Template
  const [draft, setDraft] = useState({
    id: null,
    name: '',
    category: 'General',
    container_class: '',
    css_code: '',
    skeleton: '',
    description: '',
    thumbnail_url: ''
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
      setDraft(prev => ({ ...prev, ...result, id: null }));
      setActiveTab('edit'); 
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
      const html = await parseToHiveHtml(draft.skeleton, config);
      setPreviewHtml(html);
    };
    renderPreview();
  }, [draft.skeleton, draft.container_class]);

  // 4. SAVE
  const handleSave = async () => {
    if (!draft.name || !draft.skeleton) return alert("Missing data");
    
    const finalData = {
      name: draft.name,
      category: draft.category,
      container_class: draft.container_class,
      css_code: draft.css_code,
      skeleton: draft.skeleton,
      description: draft.description,
      thumbnail_url: draft.thumbnail_url,
      ai_prompt: draft.ai_prompt,
      config: { dualWrapper: "text-justify", left: "pull-left", right: "pull-right" }
    };

    let error;
    if (draft.id) {
      const res = await supabase.from('templates').update(finalData).eq('id', draft.id);
      error = res.error;
    } else {
      const res = await supabase.from('templates').insert([finalData]);
      error = res.error;
    }
    
    if (error) {
      alert("Error saving: " + error.message);
    } else {
      alert(draft.id ? "Template Updated!" : "Template Created!");
      fetchTemplates();
    }
  };

  // 5. DELETE
  const handleDelete = async (id) => {
    if (!confirm("Delete this template?")) return;
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) alert("Error deleting: " + error.message);
    else {
      fetchTemplates();
      if (draft.id === id) resetDraft();
    }
  };

  // 6. LOAD FOR EDITING
  const handleEdit = (template) => {
    setDraft(template);
  };

  const resetDraft = () => {
    setDraft({ id: null, name: '', ai_prompt: '', category: 'General', container_class: '', css_code: '', skeleton: '', description: '', thumbnail_url: '' });
    setRawInput('');
  };

  // --- LOGIN SCREEN ---
  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-app font-sans">
        <form onSubmit={handleLogin} className="bg-bg-panel p-8 rounded-xl shadow-2xl border border-ui-border w-96">
          <div className="flex justify-center mb-6">
            <div className="bg-brand-primary/10 p-3 rounded-xl border border-brand-primary/20">
               <Sparkles className="text-brand-primary" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2 text-center">Admin Access</h1>
          <p className="text-text-muted text-xs text-center mb-6 uppercase tracking-widest">Authorized Personnel Only</p>
          
          <input className="w-full p-3 bg-bg-editor border border-ui-border rounded-lg mb-4 text-text-primary focus:outline-none focus:border-brand-primary transition" type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full p-3 bg-bg-editor border border-ui-border rounded-lg mb-6 text-text-primary focus:outline-none focus:border-brand-primary transition" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          
          <button disabled={authLoading} className="w-full bg-brand-primary hover:bg-brand-soft text-white py-3 rounded-lg font-bold transition shadow-lg shadow-brand-primary/20">
            {authLoading ? "Verifying..." : "Enter Factory"}
          </button>
        </form>
      </div>
    );
  }

  // --- ADMIN DASHBOARD ---
  return (
    <div className="h-screen bg-bg-app flex flex-col font-sans text-text-primary">
      
      {/* HEADER */}
      <header className="bg-bg-panel border-b border-ui-border px-6 py-3 flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-brand-accent/10 p-1.5 rounded-lg">
            <Sparkles className="text-brand-accent" size={18}/>
          </div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">Template Factory</h1>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-text-muted hover:text-brand-primary text-sm font-medium transition">
          <LogOut size={16}/> Logout
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* COL 1: LIBRARY */}
        <div className="w-64 bg-bg-panel border-r border-ui-border flex flex-col shrink-0">
          <div className="p-4 border-b border-ui-border bg-bg-panel-soft flex justify-between items-center">
            <span className="text-xs font-bold text-text-muted tracking-wider">LIBRARY ({templates.length})</span>
            <button onClick={resetDraft} className="p-1 hover:bg-bg-editor rounded text-brand-primary transition" title="New Template"><Plus size={16}/></button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingTemplates ? (
              <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto text-brand-primary"/></div>
            ) : (
              templates.map(t => (
                <div 
                  key={t.id} 
                  className={`p-3 border-b border-ui-border/50 flex justify-between items-center cursor-pointer transition
                    ${draft.id === t.id ? 'bg-brand-primary/10 border-l-4 border-l-brand-primary' : 'hover:bg-bg-panel-soft text-text-secondary'}
                  `} 
                  onClick={() => handleEdit(t)}
                >
                  <div className="truncate flex-1">
                    <div className={`font-bold text-sm truncate ${draft.id === t.id ? 'text-brand-primary' : 'text-text-primary'}`}>{t.name}</div>
                    <div className="text-[10px] opacity-60">{t.category}</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} 
                    className="p-2 text-text-muted hover:text-brand-primary hover:bg-bg-editor rounded transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        

        {/* COL 2: WORKBENCH */}
        <div className="w-1/3 flex flex-col border-r border-ui-border bg-bg-app overflow-y-auto custom-scrollbar">
          
          {/* AI Generator Box */}
          <div className="p-4 border-b border-ui-border bg-bg-panel">
            <label className="text-xs font-bold text-brand-accent mb-2 flex items-center gap-2">
              <Sparkles size={12}/> AI ARCHITECT
            </label>
            <div className="flex flex-col gap-2">
              <textarea 
                className="w-full p-3 text-xs border border-ui-border rounded-lg bg-bg-editor text-text-primary focus:outline-none focus:border-brand-accent resize-none h-20 placeholder:text-text-muted/50"
                placeholder="Paste HTML source code or describe a style..."
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
              />
              <button 
                onClick={handleAnalyze}
                disabled={isGenerating}
                className="bg-brand-accent text-white py-2 rounded-lg text-xs font-bold hover:bg-brand-accent/80 disabled:opacity-50 transition flex justify-center items-center gap-2"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin"/> : "Generate Template"}
              </button>
            </div>
          </div>

          {/* Manual Edit Form */}
          <div className="p-4 flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-center">
               <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Configuration</label>
               {draft.id && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">EDITING ID: {draft.id.slice(0,4)}...</span>}
            </div>

            <div className="space-y-3">
              <input className="w-full p-2 bg-bg-editor border border-ui-border rounded text-sm text-text-primary focus:border-brand-primary focus:outline-none" placeholder="Template Name" value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} />
              
              <div className="flex gap-2">
                <input className="flex-1 p-2 bg-bg-editor border border-ui-border rounded text-sm text-text-primary focus:border-brand-primary focus:outline-none" placeholder="Category" value={draft.category} onChange={e => setDraft({...draft, category: e.target.value})} />
                <input className="flex-1 p-2 bg-bg-editor border border-ui-border rounded text-sm text-brand-soft font-mono focus:border-brand-primary focus:outline-none" placeholder=".class-name" value={draft.container_class} onChange={e => setDraft({...draft, container_class: e.target.value})} />
              </div>

               {/* --- NEW FIELD: AI INSTRUCTIONS --- */}
            <div>
              <label className="text-[10px] font-bold text-brand-accent mb-1 block flex items-center gap-1">
                <Sparkles size={10}/> AI FORMATTING RULES
              </label>
              <textarea 
                className="w-full h-24 p-2 bg-bg-editor border border-ui-border rounded text-xs text-text-secondary focus:border-brand-accent focus:outline-none resize-none placeholder:text-text-muted/30"
                placeholder="Specific rules for the AI (e.g. 'Use pull-left for images', 'Wrap tables in divs')"
                value={draft.ai_prompt || ''} 
                onChange={e => setDraft({...draft, ai_prompt: e.target.value})} 
              />
            </div>

              {/* Thumbnail */}
              <div className="space-y-1">
                <div className="flex gap-2 items-center bg-bg-editor border border-ui-border rounded p-1">
                  <div className="p-1.5 rounded bg-bg-panel text-text-muted"><ImageIcon size={14}/></div>
                  <input 
                    className="flex-1 bg-transparent text-sm text-text-primary focus:outline-none" 
                    placeholder="Thumbnail URL..." 
                    value={draft.thumbnail_url || ''} 
                    onChange={e => setDraft({...draft, thumbnail_url: e.target.value})} 
                  />
                </div>
                {draft.thumbnail_url && (
                  <div className="h-24 w-full bg-bg-panel rounded-lg overflow-hidden border border-ui-border relative">
                    <img src={draft.thumbnail_url} className="w-full h-full object-cover opacity-80" alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>

              {/* Code Areas */}
              <div>
                <label className="text-[10px] font-bold text-text-muted mb-1 block">CSS RULES</label>
                <textarea className="w-full h-32 p-3 bg-bg-editor border border-ui-border rounded font-mono text-xs text-green-400 focus:outline-none focus:border-brand-primary" value={draft.css_code} onChange={e => setDraft({...draft, css_code: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-muted mb-1 block">SKELETON HTML</label>
                <textarea className="w-full h-48 p-3 bg-bg-editor border border-ui-border rounded font-mono text-xs text-blue-300 focus:outline-none focus:border-brand-primary" value={draft.skeleton} onChange={e => setDraft({...draft, skeleton: e.target.value})} />
              </div>
            
              <button onClick={handleSave} className="w-full flex justify-center items-center gap-2 bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-brand-soft transition shadow-lg shadow-brand-primary/20">
                <Save size={18} /> {draft.id ? "Update Template" : "Save New Template"}
              </button>
            </div>
          </div>
        </div>

        {/* COL 3: PREVIEW */}
        <div className="flex-1 p-6 bg-bg-panel-soft flex flex-col border-l border-ui-border">
          <label className="text-xs font-bold text-text-muted mb-3 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-success"></span> Live Preview
          </label>
          <div className="flex-1 shadow-2xl rounded-lg overflow-hidden border border-ui-border">
            <Preview htmlContent={previewHtml} extraCss={draft.css_code} />
          </div>
        </div>

      </main>
    </div>
  );
}