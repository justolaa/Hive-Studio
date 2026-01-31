import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, LayoutTemplate, Zap, Github, ArrowRight } from 'lucide-react';
import LoginButton from '../components/LoginButton'; // Import the smart button

export default function Landing() {
  // 1. Add Auth State (Same as Home.jsx)
  const [username, setUsername] = useState(localStorage.getItem('hive_user') || '');

  const handleLogin = (user) => {
    setUsername(user);
    localStorage.setItem('hive_user', user);
  };

  const handleLogout = () => {
    setUsername('');
    localStorage.removeItem('hive_user');
  };

  return (
    <div className="min-h-screen bg-bg-app text-text-primary font-sans selection:bg-brand-primary selection:text-white">
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-brand-primary/10 p-2 rounded-lg border border-brand-primary/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E31337" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8L12 3L20 8V18L12 23L4 18V8Z" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Hive Studio</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* 2. REPLACED: The old Link with the Smart LoginButton */}
          <div className="scale-90 origin-right">
             <LoginButton username={username} onLogin={handleLogin} onLogout={handleLogout} />
          </div>

          <Link 
            to="/studio" 
            className="bg-bg-panel border border-ui-border hover:border-brand-primary text-text-primary px-5 py-2 rounded-lg text-sm font-bold transition-all hover:bg-bg-panel-soft"
          >
            Open Editor
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold mb-8 animate-fade-in">
          <Sparkles size={12} />
          <span>POWERED BY GEMINI AI</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white leading-tight">
          Write Beautiful Hive Posts <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-purple-500 to-brand-accent">
            Without The Struggle.
          </span>
        </h1>
        
        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          The professional editor for Hive creators. Auto-formatting, dual-language support, and AI styling tools—all in your browser.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/studio"
            className="group flex items-center gap-2 px-8 py-4 bg-brand-primary hover:bg-brand-soft text-white rounded-xl text-lg font-bold shadow-[0_0_30px_rgba(227,19,55,0.4)] transition-all hover:scale-105"
          >
            Start Creating <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
          </Link>
          <a 
            href="https://github.com/justolaa/Hive-Studio" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 px-8 py-4 bg-bg-panel hover:bg-bg-panel-soft border border-ui-border rounded-xl text-lg font-medium text-text-secondary transition-all"
          >
            <Github size={20} /> Star on GitHub
          </a>
        </div>
      </div>

      {/* MOCKUP PREVIEW */}
      <div className="relative max-w-6xl mx-auto px-4 mb-32">
        <div className="absolute inset-0 bg-brand-primary/20 blur-[100px] rounded-full opacity-50"></div>
        <div className="relative bg-bg-panel border border-ui-border rounded-xl shadow-2xl overflow-hidden aspect-[16/9] flex items-center justify-center group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-app/90 z-10"></div>
          {/* Visual Placeholder for screenshot */}
          <div className="text-center z-20">
             <div className="text-6xl mb-4">🎨</div>
             <h3 className="text-2xl font-bold text-white mb-2">Visual Editor Preview</h3>
             <p className="text-text-muted">Takes your Markdown and turns it into art.</p>
          </div>
        </div>
      </div>

      {/* FEATURES GRID */}
      <div className="max-w-7xl mx-auto px-6 py-20 border-t border-ui-border">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 bg-bg-panel rounded-2xl border border-ui-border hover:border-brand-primary/50 transition duration-300">
            <div className="w-12 h-12 bg-bg-panel-soft rounded-xl flex items-center justify-center mb-4 text-brand-primary">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Magic Brush AI</h3>
            <p className="text-text-secondary leading-relaxed">
              Messy text? One click fixes grammar, adds headers, and formats your post structure automatically using Gemini 2.5.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-bg-panel rounded-2xl border border-ui-border hover:border-purple-500/50 transition duration-300">
            <div className="w-12 h-12 bg-bg-panel-soft rounded-xl flex items-center justify-center mb-4 text-purple-500">
              <LayoutTemplate size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Smart Templates</h3>
            <p className="text-text-secondary leading-relaxed">
              Don't start from zero. Load professional blueprints for Reviews, Finance, or Diaries that look great on PeakD & Ecency.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-bg-panel rounded-2xl border border-ui-border hover:border-blue-500/50 transition duration-300">
            <div className="w-12 h-12 bg-bg-panel-soft rounded-xl flex items-center justify-center mb-4 text-blue-500">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Instant Publishing</h3>
            <p className="text-text-secondary leading-relaxed">
              Connect Hive Keychain to publish directly to the blockchain. No copying and pasting required.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-ui-border py-12 bg-bg-panel">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-text-muted text-sm">
            © 2026 Hive Studio. Built for the Hive Blockchain.
          </div>
          <div className="flex gap-6 text-sm font-medium text-text-secondary">
            {/* You can still access admin by typing the URL, or put a hidden link here */}
            <Link to="/admin" className="hover:text-brand-primary transition opacity-50 hover:opacity-100">Admin</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}