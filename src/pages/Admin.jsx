import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generateTemplateFromInput } from '../lib/magic';
import Preview from '../components/Preview';
import { parseToHiveHtml } from '../lib/parser';
import { Loader2, Sparkles, Save, LogOut, Trash2, Plus, Image as ImageIcon, LayoutTemplate, BarChart3, TrendingUp, Users, Activity } from 'lucide-react';

export default function Admin() {
  const [session, setSession] = useState(null);
  
  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // View State (The Tab System)
  const [currentView, setCurrentView] = useState('templates'); // 'templates' | 'analytics'

  // Data State
  const [templates, setTemplates] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generator State
  const [rawInput, setRawInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [draft, setDraft] = useState({
    id: null,
    name: '',
    category: 'General',
    container_class: '',
    css_code: '',
    skeleton: '',
    description: '',
    thumbnail_url: '',
    ai_prompt: ''
  });

  const [previewHtml, setPreviewHtml] = useState('');

  // 1. INITIAL LOAD
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchTemplates();
        fetchAnalytics();
      }
    });
  }, []);

  const fetchTemplates = async () => {
    const { data } = await supabase.from('templates').select('*').order('name');
    if (data) setTemplates(data);
  };

  const fetchAnalytics = async () => {
    // Fetch last 1000 events
    const { data } = await supabase.from('analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);
    if (data) setAnalyticsData(data);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else {
      fetchTemplates();
      fetchAnalytics();
    }
    setAuthLoading(false);
  };

  // --- STATS CALCULATION ---
  const stats = {
    totalPublishes: analyticsData.filter(e => e.event_name === 'publish_success').length,
    magicUses: analyticsData.filter(e => e.event_name === 'magic_brush_used').length,
    copyCode: analyticsData.filter(e => e.event_name === 'copy_code').length,
    topTemplate: (() => {
      const counts = {};
      analyticsData.forEach(e => {
        if(e.template_used) counts[e.template_used] = (counts[e.template_used] || 0) + 1;
      });
      return Object.keys(counts).sort((a,b) => counts[b] - counts[a])[0] || 'None';
    })()
  };

  // ... (Keep existing AI Generator Logic) ...
  const handleAnalyze = async () => {
    if (!rawInput) return;
    setIsGenerating(true);
    try {
      const result = await generateTemplateFromInput(rawInput);
      setDraft(prev => ({ ...prev, ...result, id: null }));
    } catch (err) {
      alert("AI Error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // ... (Keep existing Save Logic) ...
  const handleSave = async () => {
    if (!draft.name || !draft.skeleton) return alert("Missing data");
    const finalData = { ...draft, config: { dualWrapper: "text-justify", left: "pull-left", right: "pull-right" } };
    
    let res = draft.id 
      ? await supabase.from('templates').update(finalData).eq('id', draft.id)
      : await supabase.from('templates').insert([finalData]);

    if (res.error) alert("Error: " + res.error.message);
    else {
      alert("Saved!");
      fetchTemplates();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this template?")) return;
    await supabase.from('templates').delete().eq('id', id);
    fetchTemplates();
    if (draft.id === id) resetDraft();
  };

  const resetDraft = () => {
    setDraft({ id: null, name: '', category: 'General', container_class: '', css_code: '', skeleton: '', description: '', thumbnail_url: '', ai_prompt: '' });
    setRawInput('');
  };

  // ... (Keep Preview Effect) ...
  useEffect(() => {
    const renderPreview = async () => {
      const config = { containerClass: draft.container_class, dualWrapper: 'row', left: 'col-6', right: 'col-6' };
      const html = await parseToHiveHtml(draft.skeleton, config);
      setPreviewHtml(html);
    };
    renderPreview();
  }, [draft.skeleton, draft.container_class]);


  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-app font-sans">
        <form onSubmit={handleLogin} className="bg-bg-panel p-8 rounded-xl shadow-2xl border border-ui-border w-96">
          <h1 className="text-2xl font-bold text-text-primary mb-6 text-center">Admin Access</h1>
          <input className="w-full p-3 bg-bg-editor border border-ui-border rounded-lg mb-4 text-text-primary focus:outline-none focus:border-brand-primary" type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full p-3 bg-bg-editor border border-ui-border rounded-lg mb-6 text-text-primary focus:outline-none focus:border-brand-primary" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={authLoading} className="w-full bg-brand-primary hover:bg-brand-soft text-white py-3 rounded-lg font-bold transition">{authLoading ? "..." : "Login"}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg-app flex flex-col font-sans text-text-primary">
      
      {/* HEADER */}
      <header className="bg-bg-panel border-b border-ui-border px-6 py-3 flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-brand-accent/10 p-1.5 rounded-lg">
            <Sparkles className="text-brand-accent" size={18}/>
          </div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">Hive Studio Admin</h1>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-text-muted hover:text-brand-primary text-sm font-medium transition">
          <LogOut size={16}/> Logout
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* COL 1: NAVIGATION SIDEBAR */}
        <div className="w-64 bg-bg-panel border-r border-ui-border flex flex-col shrink-0">
          
          {/* TABS */}
          <div className="p-4 flex flex-col gap-2 border-b border-ui-border">
            <button 
              onClick={() => setCurrentView('templates')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition ${currentView === 'templates' ? 'bg-brand-primary text-white' : 'text-text-muted hover:bg-bg-panel-soft hover:text-text-primary'}`}
            >
              <LayoutTemplate size={16}/> Templates
            </button>
            <button 
              onClick={() => { setCurrentView('analytics'); fetchAnalytics(); }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition ${currentView === 'analytics' ? 'bg-brand-primary text-white' : 'text-text-muted hover:bg-bg-panel-soft hover:text-text-primary'}`}
            >
              <BarChart3 size={16}/> Analytics
            </button>
          </div>

          {/* TEMPLATE LIST (Only show if in Template view) */}
          {currentView === 'templates' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Library ({templates.length})</div>
              {templates.map(t => (
                <div key={t.id} className={`mx-2 p-2 rounded-lg flex justify-between items-center cursor-pointer mb-1 ${draft.id === t.id ? 'bg-bg-panel-soft border border-ui-border' : 'hover:bg-bg-panel-soft/50'}`} onClick={() => setDraft(t)}>
                  <span className="text-xs font-medium text-text-secondary truncate w-32">{t.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} className="text-text-muted hover:text-red-500"><Trash2 size={12} /></button>
                </div>
              ))}
              <div className="p-4">
                <button onClick={resetDraft} className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-ui-border rounded-lg text-xs text-text-muted hover:text-brand-primary hover:border-brand-primary transition">
                  <Plus size={14}/> Create New
                </button>
              </div>
            </div>
          )}
        </div>

        {/* COL 2 & 3: CONTENT AREA */}
        {currentView === 'templates' ? (
          <>
            {/* WORKBENCH */}
            <div className="w-1/3 flex flex-col border-r border-ui-border bg-bg-app overflow-y-auto custom-scrollbar">
              {/* (Keep your existing Form inputs here) */}
              <div className="p-4 flex-1 flex flex-col gap-4">
                <div className="bg-bg-panel p-4 rounded-lg border border-ui-border">
                  <label className="text-xs font-bold text-brand-accent mb-2 flex items-center gap-2"><Sparkles size={12}/> AI ARCHITECT</label>
                  <div className="flex gap-2">
                    <textarea className="flex-1 p-2 text-xs border border-ui-border rounded bg-bg-editor text-text-primary resize-none h-16 focus:outline-none focus:border-brand-accent" placeholder="Paste HTML..." value={rawInput} onChange={(e) => setRawInput(e.target.value)}/>
                    <button onClick={handleAnalyze} disabled={isGenerating} className="bg-brand-accent text-white px-3 rounded text-xs font-bold hover:bg-brand-accent/80 disabled:opacity-50">{isGenerating ? <Loader2 className="animate-spin"/> : "Gen"}</button>
                  </div>
                </div>

                <input className="p-2 bg-bg-editor border border-ui-border rounded text-sm text-text-primary" placeholder="Template Name" value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} />
                <div className="flex gap-2">
                  <input className="flex-1 p-2 bg-bg-editor border border-ui-border rounded text-sm" placeholder="Category" value={draft.category} onChange={e => setDraft({...draft, category: e.target.value})} />
                  <input className="flex-1 p-2 bg-bg-editor border border-ui-border rounded text-sm text-brand-soft" placeholder=".class" value={draft.container_class} onChange={e => setDraft({...draft, container_class: e.target.value})} />
                </div>
                
                {/* Image & AI Prompt inputs */}
                <input className="p-2 bg-bg-editor border border-ui-border rounded text-sm" placeholder="Thumbnail URL" value={draft.thumbnail_url} onChange={e => setDraft({...draft, thumbnail_url: e.target.value})} />
                <textarea className="h-20 p-2 bg-bg-editor border border-ui-border rounded text-xs text-text-secondary" placeholder="AI Formatting Rules..." value={draft.ai_prompt} onChange={e => setDraft({...draft, ai_prompt: e.target.value})} />

                <textarea className="h-32 p-3 bg-bg-editor border border-ui-border rounded font-mono text-xs text-green-400" value={draft.css_code} onChange={e => setDraft({...draft, css_code: e.target.value})} />
                <textarea className="flex-1 min-h-[200px] p-3 bg-bg-editor border border-ui-border rounded font-mono text-xs text-blue-300" value={draft.skeleton} onChange={e => setDraft({...draft, skeleton: e.target.value})} />
                
                <button onClick={handleSave} className="flex justify-center items-center gap-2 bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-brand-soft transition"><Save size={18} /> Save</button>
              </div>
            </div>

            {/* PREVIEW */}
            <div className="flex-1 p-6 bg-bg-panel-soft flex flex-col">
              <div className="flex-1 shadow-2xl rounded-lg overflow-hidden border border-ui-border"><Preview htmlContent={previewHtml} extraCss={draft.css_code} /></div>
            </div>
          </>
        ) : (
          /* --- ANALYTICS VIEW --- */
          <div className="flex-1 p-8 bg-bg-app overflow-y-auto">
            <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
              <Activity className="text-brand-accent" /> Performance Overview
            </h2>

            {/* KPI CARDS */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-bg-panel p-6 rounded-xl border border-ui-border">
                <div className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Total Publishes</div>
                <div className="text-4xl font-bold text-white">{stats.totalPublishes}</div>
              </div>
              <div className="bg-bg-panel p-6 rounded-xl border border-ui-border">
                <div className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Magic Brush Uses</div>
                <div className="text-4xl font-bold text-brand-primary">{stats.magicUses}</div>
              </div>
              <div className="bg-bg-panel p-6 rounded-xl border border-ui-border">
                <div className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Code Copies</div>
                <div className="text-4xl font-bold text-brand-accent">{stats.copyCode}</div>
              </div>
              <div className="bg-bg-panel p-6 rounded-xl border border-ui-border">
                <div className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Top Template</div>
                <div className="text-xl font-bold text-white truncate">{stats.topTemplate}</div>
              </div>
            </div>

            {/* RECENT ACTIVITY TABLE */}
            <div className="bg-bg-panel rounded-xl border border-ui-border overflow-hidden">
              <div className="px-6 py-4 border-b border-ui-border bg-bg-panel-soft flex justify-between items-center">
                <h3 className="font-bold text-text-primary">Recent Activity Log</h3>
                <button onClick={fetchAnalytics} className="text-xs text-brand-accent hover:underline">Refresh</button>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-bg-editor text-text-muted uppercase text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Event</th>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Template</th>
                    <th className="px-6 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border">
                  {analyticsData.slice(0, 20).map(log => (
                    <tr key={log.id} className="hover:bg-bg-panel-soft/50 transition">
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          log.event_name === 'publish_success' ? 'bg-green-500/20 text-green-400' :
                          log.event_name === 'magic_brush_used' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {log.event_name.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-text-primary font-mono">{log.hive_username || 'Anonymous'}</td>
                      <td className="px-6 py-3 text-text-secondary">{log.template_used}</td>
                      <td className="px-6 py-3 text-text-muted">{new Date(log.created_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}