import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  LayoutTemplate,
  Zap,
  Github,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  BrainCircuit,
  Link2
} from 'lucide-react';

import LoginButton from '../components/LoginButton';
import { PopupModal } from "react-calendly";

export default function Landing() {

  const [username, setUsername] = useState(localStorage.getItem('hive_user') || '');
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);

  const handleLogin = (user) => {
    setUsername(user);
    localStorage.setItem('hive_user', user);
  };

  const handleLogout = () => {
    setUsername('');
    localStorage.removeItem('hive_user');
  };

  return (
    <div className="min-h-screen bg-bg-app text-text-primary font-sans selection:bg-brand-primary selection:text-white pb-24">

      {/* NAVBAR */}

      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">

        <div className="flex items-center gap-2">
          <div className="bg-brand-primary/10 p-2 rounded-lg border border-brand-primary/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E31337" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8L12 3L20 8V18L12 23L4 18V8Z" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Hive Studio
          </span>
        </div>

        <div className="flex items-center gap-4">

          <div className="scale-90 origin-right">
            <LoginButton
              username={username}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
          </div>

          <Link
            to="/studio"
            className="bg-bg-panel border border-ui-border hover:border-brand-primary text-text-primary px-5 py-2 rounded-lg text-sm font-bold transition-all hover:bg-bg-panel-soft"
          >
            Open Editor
          </Link>

        </div>
      </nav>


      {/* HERO */}

      <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">

        {/* Animated SaaS Glow */}

        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">

          <div className="w-[800px] h-[800px] bg-gradient-to-r from-brand-primary via-purple-500 to-brand-accent rounded-full blur-[160px] opacity-30 animate-pulse"></div>

        </div>


        <div className="relative">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold mb-8">
            <Sparkles size={12} />
            <span>CREATED BY JUSTOLA1</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white leading-tight">

            Write Beautiful Hive Posts <br />

            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-purple-500 to-brand-accent">
              Without The Struggle
            </span>

          </h1>

          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-6 leading-relaxed">
            The professional editor for Hive creators. Auto-formatting, dual-language support, and AI styling tools, all in your browser.
          </p>


          {/* Credibility Strip */}

          <div className="flex justify-center items-center gap-2 text-sm text-text-muted mb-10">
            <ShieldCheck size={16} />
            Trusted by Hive creators • Built by an AI engineer
          </div>


          {/* CTA */}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

            <Link
              to="/studio"
              className="group flex items-center gap-2 px-8 py-4 bg-brand-primary hover:bg-brand-soft text-white rounded-xl text-lg font-bold shadow-[0_0_30px_rgba(227,19,55,0.4)] transition-all hover:scale-105"
            >
              Start Creating
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
            </Link>

            <a
              href="https://github.com/justolaa/Hive-Studio"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-bg-panel hover:bg-bg-panel-soft border border-ui-border rounded-xl text-lg font-medium text-text-secondary transition-all"
            >
              <Github size={20}/>
              Star on GitHub
            </a>

          </div>
{/* 👇 PASTE THE PRODUCT HUNT BADGE HERE 👇 */}
        <div className="mt-12 flex justify-center animate-fade-in hover:scale-105 transition-transform duration-300">
          <a 
            href="https://www.producthunt.com/products/hive-studio?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-hive-studio" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img 
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1098046&theme=dark&t=1773475897936" 
              alt="Hive Studio - AI-powered formatting tool for Hive bloggers | Product Hunt" 
              width="250" 
              height="54" 
            />
          </a>
        </div>
        {/* 👆 END OF PRODUCT HUNT BADGE 👆 */}

          {/* SaaS Feature Badges */}

          <div className="flex flex-wrap justify-center gap-4 mt-12 text-sm">

            <div className="flex items-center gap-2 bg-bg-panel border border-ui-border px-4 py-2 rounded-full">
              <Zap size={16}/>
              AI Formatting
            </div>

            <div className="flex items-center gap-2 bg-bg-panel border border-ui-border px-4 py-2 rounded-full">
              <BrainCircuit size={16}/>
              Smart Templates
            </div>

            <div className="flex items-center gap-2 bg-bg-panel border border-ui-border px-4 py-2 rounded-full">
              <Link2 size={16}/>
              Hive Keychain Publishing
            </div>

          </div>

        </div>

      </div>


      {/* MOCKUP PREVIEW (Replaced with Arcade Demo) */}
      <div className="relative max-w-5xl mx-auto px-4 mb-32 z-10">
        {/* Glow effect behind the demo */}
        <div className="absolute inset-0 bg-brand-primary/20 blur-[100px] rounded-full opacity-50 pointer-events-none"></div>
        
        {/* The Arcade Embed Container */}
        <div className="relative bg-bg-panel border border-ui-border rounded-xl shadow-2xl p-2 md:p-4">
          <div style={{ position: 'relative', paddingBottom: 'calc(46.925329428989755% + 41px)', height: '0', width: '100%' }}>
            <iframe
              src="https://demo.arcade.software/t9j8roh8VrCSNxyHwUcP?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
              title="Format and Preview a Bilingual Blog Post in Hive Studio"
              frameBorder="0"
              loading="lazy"
              allowFullScreen
              allow="clipboard-write"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', colorScheme: 'light', borderRadius: '8px' }}
            />
          </div>
        </div>
      </div>


      {/* FEATURES */}

      <div className="max-w-7xl mx-auto px-6 py-20 border-t border-ui-border">

        <div className="grid md:grid-cols-3 gap-8">

          <div className="p-6 bg-bg-panel rounded-2xl border border-ui-border hover:border-brand-primary/50 transition duration-300">

            <div className="w-12 h-12 bg-bg-panel-soft rounded-xl flex items-center justify-center mb-4 text-brand-primary">
              <Sparkles size={24}/>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Magic Brush AI
            </h3>

            <p className="text-text-secondary leading-relaxed">
              Messy text? One click adds headers and formats your post structure automatically.
            </p>

          </div>


          <div className="p-6 bg-bg-panel rounded-2xl border border-ui-border hover:border-purple-500/50 transition duration-300">

            <div className="w-12 h-12 bg-bg-panel-soft rounded-xl flex items-center justify-center mb-4 text-purple-500">
              <LayoutTemplate size={24}/>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Smart Templates
            </h3>

            <p className="text-text-secondary leading-relaxed">
              Load professional blueprints for Reviews, Finance, or Diaries that look great on PeakD & Ecency.
            </p>

          </div>


          <div className="p-6 bg-bg-panel rounded-2xl border border-ui-border hover:border-blue-500/50 transition duration-300">

            <div className="w-12 h-12 bg-bg-panel-soft rounded-xl flex items-center justify-center mb-4 text-blue-500">
              <Zap size={24}/>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Instant Publishing
            </h3>

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


          <div className="flex items-center gap-4">

            <span className="text-sm text-text-secondary">
              Need a custom app?
            </span>

            <button
              onClick={() => setIsCalendlyOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-full text-xs font-bold hover:bg-brand-primary hover:text-white transition"
            >
              <MessageCircle size={14}/>
              Discuss Your Project
            </button>

          </div>

        </div>


        {/* FLOATING CTA */}

        <button
          onClick={() => setIsCalendlyOpen(true)}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-bg-panel/90 backdrop-blur-md border border-ui-border shadow-2xl px-4 py-2.5 rounded-full hover:border-brand-primary hover:shadow-[0_0_15px_rgba(227,19,55,0.3)] hover:-translate-y-1 transition-all duration-300 group"
        >

          <div className="relative flex h-2.5 w-2.5">

            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>

            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>

          </div>

          <div className="flex flex-col">

            <span className="text-[10px] text-text-muted leading-none mb-0.5">
              Built by an AI Engineer
            </span>

            <span className="text-xs font-bold text-text-primary group-hover:text-brand-primary transition-colors leading-none">
              Book a Discovery Call
            </span>

          </div>

        </button>

      </footer>


      {/* CALENDLY */}

      <PopupModal
        url="https://calendly.com/idowuolamide81"
        pageSettings={{
          backgroundColor: '0F1117',
          hideEventTypeDetails: false,
          hideLandingPageDetails: false,
          primaryColor: 'E31337',
          textColor: 'E6EAF2'
        }}
        onModalClose={() => setIsCalendlyOpen(false)}
        open={isCalendlyOpen}
        rootElement={document.getElementById("root")}
      />

    </div>
  );
}