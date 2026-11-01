import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Orbit,
  Sparkles,
  ArrowRight,
  Brain,
  GitBranch,
  Repeat,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  Zap,
  Globe2,
  Atom,
} from 'lucide-react';

const faqs = [
  {
    q: 'How does MINDMAP AI generate knowledge graphs from my notes?',
    a: 'MINDMAP AI processes your uploaded PDFs, Word documents, or pasted study text through an AI concept extractor. It extracts key terms, formulas, and definitions, establishes semantic and prerequisite relationships, and visualizes them on an interactive React Flow canvas.',
  },
  {
    q: 'What is the Spaced Repetition (SM-2) algorithm used for revisions?',
    a: 'We implement the SuperMemo SM-2 spaced repetition algorithm. Depending on whether you mark a concept as Again, Difficult, Good, or Easy, the system dynamically recalculates memory decay intervals and schedules your optimal next review date.',
  },
  {
    q: 'Can I use this without a remote AI API key?',
    a: 'Yes! MINDMAP AI includes an integrated local Cosmic NLP Rule Engine that runs automatically in Demo Mode when no API key is configured. It extracts concepts, synthesizes graphs, and generates quizzes seamlessly.',
  },
  {
    q: 'How is knowledge mastery calculated?',
    a: 'Mastery is calculated using a weighted academic algorithm: 50% quiz assessment accuracy, 30% recency decay (exponential Ebbinghaus forgetting curve), and 20% practice engagement volume.',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { demoLogin, isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleDemoAccess = async () => {
    setLoadingDemo(true);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login error', err);
      navigate('/login');
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-darkest text-slate-100 selection:bg-cosmic-violet selection:text-white">
      {/* SaaS Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 h-20 bg-slate-950/80 border-b border-cosmic-border backdrop-blur-xl px-6 lg:px-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cosmic-indigo to-cosmic-violet p-0.5 shadow-cosmic-sm flex items-center justify-center">
            <Orbit className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-black text-lg tracking-wider bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              MINDMAP AI
            </span>
            <span className="block text-[9px] text-slate-400 font-medium tracking-widest uppercase">
              Personal Knowledge Universe
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#ai-engine" className="hover:text-white transition-colors">AI Engine</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-sm hover:scale-105 transition-all"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleDemoAccess}
                disabled={loadingDemo}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-cosmic-indigo via-cosmic-violet to-purple-600 text-white shadow-cosmic-md hover:scale-105 transition-all flex items-center space-x-2"
              >
                <span>{loadingDemo ? 'Launching...' : '1-Click Demo'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-6 lg:px-16 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cosmic-violet/20 rounded-full blur-[140px] pointer-events-none" />

        {/* Academic Project Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cosmic-violet/10 border border-cosmic-violet/30 text-cosmic-violet text-xs font-semibold mb-8 animate-pulse-slow">
          <Atom className="w-4 h-4" />
          <span>B.Tech CSE Major Capstone Project — Cosmic Intelligence Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-tight">
          Your knowledge has a shape.{' '}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Discover it.
          </span>
        </h1>

        {/* Supporting text */}
        <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-3xl leading-relaxed">
          Transform scattered learning resources into an intelligent universe of connected knowledge. 
          Learn smarter, discover connections, and master every concept.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleDemoAccess}
            disabled={loadingDemo}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-cosmic-indigo via-cosmic-violet to-pink-600 text-white shadow-cosmic-lg hover:scale-105 transition-all flex items-center justify-center space-x-3"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore Your Universe</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors"
          >
            Get Started Free
          </button>
        </div>

        {/* Simulated Knowledge Graph Interactive Canvas Preview */}
        <div className="mt-16 w-full rounded-2xl border border-cosmic-border bg-slate-950/80 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-slate-400">interactive-canvas://data-structures-constellation</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-medium">
              Live React Flow Canvas
            </span>
          </div>

          {/* Glowing Animated Preview Nodes */}
          <div className="h-80 sm:h-96 relative flex items-center justify-center bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Center Main Topic */}
            <div className="absolute z-20 p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-cosmic-lg border border-violet-400/80 text-left max-w-xs animate-float">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/30">Main Topic</span>
              <h4 className="text-sm font-bold mt-1">Binary Search Tree (BST)</h4>
              <p className="text-[11px] text-violet-200 mt-1 line-clamp-1">Invariance: Left &lt; Root &lt; Right</p>
              <div className="mt-2 text-[10px] font-mono text-emerald-300">Mastery: 92% • Strong</div>
            </div>

            {/* Orbiting Satellite Nodes */}
            <div className="absolute top-8 left-12 p-3 rounded-xl bg-slate-900/90 border border-rose-500/60 shadow-cosmic-sm text-left">
              <span className="text-[9px] font-semibold text-rose-400 uppercase">Prerequisite</span>
              <div className="text-xs font-bold text-slate-200">Big-O Notation</div>
            </div>

            <div className="absolute top-8 right-16 p-3 rounded-xl bg-slate-900/90 border border-fuchsia-500/60 shadow-cosmic-sm text-left">
              <span className="text-[9px] font-semibold text-fuchsia-400 uppercase">Advanced</span>
              <div className="text-xs font-bold text-slate-200">AVL Rotations</div>
            </div>

            <div className="absolute bottom-10 left-20 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/60 shadow-cosmic-sm text-left">
              <span className="text-[9px] font-semibold text-cyan-400 uppercase">Definition</span>
              <div className="text-xs font-bold text-slate-200">Dynamic Programming</div>
            </div>

            <div className="absolute bottom-10 right-20 p-3 rounded-xl bg-slate-900/90 border border-amber-500/60 shadow-cosmic-sm text-left">
              <span className="text-[9px] font-semibold text-amber-400 uppercase">Example</span>
              <div className="text-xs font-bold text-slate-200">Priority Heap</div>
            </div>
          </div>
        </div>
      </section>

      {/* Illustrative Live Stats */}
      <section className="border-y border-slate-800/80 bg-slate-950/60 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text">
              10,000+
            </div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Concepts Mapped</div>
            <span className="text-[10px] text-slate-600 italic">illustrative demo metric</span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
              98.4%
            </div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">SM-2 Retention Rate</div>
            <span className="text-[10px] text-slate-600 italic">illustrative demo metric</span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text">
              500+
            </div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Learning Roadmaps</div>
            <span className="text-[10px] text-slate-600 italic">illustrative demo metric</span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text">
              100%
            </div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Real MERN Stack</div>
            <span className="text-[10px] text-slate-600 italic">verified production build</span>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-cosmic-cyan uppercase tracking-widest">Architectural Pillars</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
            Everything You Need to Master Any Knowledge Domain
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="cosmic-panel p-8 rounded-2xl cosmic-panel-hover">
            <div className="w-12 h-12 rounded-xl bg-violet-950/80 border border-violet-500/40 flex items-center justify-center text-violet-400 mb-6">
              <Orbit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">My Universe React Flow</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore interconnected concept constellations. Visualized with custom glowing nodes for topics, formulas, definitions, and prerequisites.
            </p>
          </div>

          <div className="cosmic-panel p-8 rounded-2xl cosmic-panel-hover">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-6">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Knowledge Extraction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload PDF or DOCX files and let the AI service parse raw materials into structured nodes, prerequisites, and relationship edges.
            </p>
          </div>

          <div className="cosmic-panel p-8 rounded-2xl cosmic-panel-hover">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-6">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Spaced Repetition (SM-2)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              SuperMemo SM-2 memory scheduling optimizes review timing based on difficulty responses (Again, Difficult, Good, Easy).
            </p>
          </div>

          <div className="cosmic-panel p-8 rounded-2xl cosmic-panel-hover">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Quiz Center</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate dynamic MCQs from uploaded notes or concepts. Submissions update live concept mastery scores in real-time.
            </p>
          </div>

          <div className="cosmic-panel p-8 rounded-2xl cosmic-panel-hover">
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-6">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Prerequisite Roadmaps</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Topological prerequisite sorting structures computer science career goals into progressive, verifiable stages.
            </p>
          </div>

          <div className="cosmic-panel p-8 rounded-2xl cosmic-panel-hover">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400 mb-6">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Recharts Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect knowledge growth curves, weekly learning minutes, radar mastery breakdowns, and identified weak concepts.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 lg:px-16 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-cosmic-violet uppercase tracking-widest">Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            From Scattered Notes to Connected Universe
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Input Material', desc: 'Upload PDF/DOCX coursework or paste lecture notes directly.' },
            { step: '02', title: 'AI Synthesis', desc: 'Extract concepts, mathematical bounds, and directed relationships.' },
            { step: '03', title: 'Graph Visualizer', desc: 'Interact with nodes on the React Flow canvas and inspect explanations.' },
            { step: '04', title: 'Permanent Retention', desc: 'Master concepts with SM-2 spaced repetitions and quiz challenges.' },
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative">
              <span className="text-3xl font-black text-cosmic-violet/40 font-mono">{item.step}</span>
              <h4 className="text-sm font-bold text-white mt-2 mb-1">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 lg:px-16 max-w-4xl mx-auto border-t border-slate-800">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-cosmic-cyan uppercase tracking-widest">Got Questions?</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer transition-colors hover:border-slate-700"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="flex items-center justify-between font-semibold text-sm text-slate-200">
                <span>{f.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </div>
              {openFaq === i && (
                <p className="mt-3 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-6 lg:px-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Orbit className="w-5 h-5 text-cosmic-violet" />
            <span className="font-bold text-slate-300">MINDMAP AI</span>
            <span>— Personal Knowledge Universe</span>
          </div>
          <div>
            Built with MERN Stack • React Flow • SuperMemo SM-2 • Recharts • AI Extraction
          </div>
          <div>
            &copy; 2026 Academic Major Capstone Project.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
