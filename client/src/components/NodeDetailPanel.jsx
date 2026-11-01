import React from 'react';
import { 
  X, 
  HelpCircle, 
  Bot, 
  Repeat, 
  BookOpen, 
  Sigma, 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NodeDetailPanel = ({ node, onClose }) => {
  const navigate = useNavigate();
  if (!node) return null;

  const { data } = node;
  const mastery = data.masteryScore ?? 10;

  return (
    <div className="absolute top-0 right-0 w-96 h-full z-40 bg-slate-950/95 border-l border-cosmic-border backdrop-blur-2xl p-6 overflow-y-auto flex flex-col shadow-2xl transition-all duration-300 animate-slide-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cosmic-violet/20 text-cosmic-violet border border-cosmic-violet/30 capitalize">
          {data.category ? data.category.replace('_', ' ') : 'Concept'}
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Title & Mastery Gauge */}
      <div className="my-5">
        <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
          {data.name || data.label}
        </h2>
        
        {/* Mastery Bar */}
        <div className="mt-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-400">Knowledge Mastery</span>
            <span className={`font-mono font-bold ${
              mastery >= 80 ? 'text-emerald-400' : mastery >= 50 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {mastery}% ({mastery >= 80 ? 'Strong' : mastery >= 50 ? 'Moderate' : 'Needs Review'})
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                mastery >= 80 ? 'from-emerald-500 to-teal-400' : mastery >= 50 ? 'from-amber-500 to-yellow-400' : 'from-rose-500 to-red-400'
              }`}
              style={{ width: `${mastery}%` }}
            />
          </div>
        </div>
      </div>

      {/* Concept Definition */}
      {data.definition && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cosmic-cyan" />
            <span>Definition</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/60">
            {data.definition}
          </p>
        </div>
      )}

      {/* In-depth Explanation */}
      {data.explanation && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            <span>Detailed Explanation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
            {data.explanation}
          </p>
        </div>
      )}

      {/* Formula if present */}
      {data.formula && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
            <Sigma className="w-3.5 h-3.5" />
            <span>Mathematical Formula / Bound</span>
          </div>
          <div className="bg-slate-900 border border-emerald-500/30 p-2.5 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto">
            {data.formula}
          </div>
        </div>
      )}

      {/* Practical Examples */}
      {data.examples && data.examples.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Practical Applications & Examples</span>
          </div>
          <ul className="space-y-1.5">
            {data.examples.map((ex, i) => (
              <li key={i} className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800 flex items-start space-x-2">
                <span className="text-amber-400 text-xs mt-0.5">•</span>
                <span>{ex}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Action Shortcuts */}
      <div className="mt-auto pt-4 border-t border-slate-800/80 space-y-2">
        <button
          onClick={() => {
            navigate('/tutor', { state: { conceptName: data.name || data.label } });
          }}
          className="w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center space-x-2 bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-sm hover:opacity-95 transition-all"
        >
          <Bot className="w-4 h-4" />
          <span>Ask AI Tutor to Explain</span>
        </button>

        <button
          onClick={() => {
            navigate('/quizzes', { state: { conceptId: data.conceptId, conceptName: data.name || data.label } });
          }}
          className="w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-cosmic-cyan" />
          <span>Test Understanding in Quiz</span>
        </button>

        <button
          onClick={() => {
            navigate('/revisions');
          }}
          className="w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors"
        >
          <Repeat className="w-4 h-4 text-emerald-400" />
          <span>Review in Spaced Repetition</span>
        </button>
      </div>
    </div>
  );
};

export default NodeDetailPanel;
