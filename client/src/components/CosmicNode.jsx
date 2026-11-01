import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Crown, 
  Layers, 
  BookOpen, 
  Sigma, 
  Lightbulb, 
  GitFork, 
  Sparkles 
} from 'lucide-react';

const categoryConfig = {
  main_topic: {
    color: 'from-violet-600 via-indigo-600 to-purple-700',
    border: 'border-violet-400/80',
    glow: 'shadow-[0_0_30px_rgba(139,92,246,0.6)]',
    badge: 'bg-violet-950/80 text-violet-300 border-violet-500/40',
    icon: Crown,
    label: 'Main Topic',
  },
  subtopic: {
    color: 'from-indigo-600 to-blue-700',
    border: 'border-indigo-400/60',
    glow: 'shadow-[0_0_20px_rgba(99,102,241,0.4)]',
    badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
    icon: Layers,
    label: 'Subtopic',
  },
  definition: {
    color: 'from-cyan-600 to-sky-700',
    border: 'border-cyan-400/70',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]',
    badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
    icon: BookOpen,
    label: 'Definition',
  },
  formula: {
    color: 'from-emerald-600 to-teal-700',
    border: 'border-emerald-400/70',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    icon: Sigma,
    label: 'Formula',
  },
  example: {
    color: 'from-amber-600 to-yellow-700',
    border: 'border-amber-400/70',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    icon: Lightbulb,
    label: 'Example',
  },
  prerequisite: {
    color: 'from-rose-600 to-pink-700',
    border: 'border-rose-400/80 border-dashed',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]',
    badge: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
    icon: GitFork,
    label: 'Prerequisite',
  },
  advanced: {
    color: 'from-fuchsia-600 via-pink-600 to-purple-700',
    border: 'border-fuchsia-400/80',
    glow: 'shadow-[0_0_25px_rgba(217,70,239,0.5)]',
    badge: 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/40',
    icon: Sparkles,
    label: 'Advanced',
  },
};

const CosmicNode = ({ data, selected }) => {
  const category = data.category || 'subtopic';
  const cfg = categoryConfig[category] || categoryConfig.subtopic;
  const Icon = cfg.icon;
  const mastery = data.masteryScore ?? 10;

  return (
    <div
      className={`relative min-w-[210px] max-w-[260px] rounded-xl p-3.5 backdrop-blur-xl bg-slate-950/85 border-2 transition-all duration-300 cursor-pointer ${
        cfg.border
      } ${selected ? 'ring-2 ring-white scale-105 ' + cfg.glow : cfg.glow} hover:scale-102`}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cosmic-violet !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-cosmic-cyan !border-2 !border-slate-900" />
      <Handle type="target" position={Position.Left} id="left" className="!w-3 !h-3 !bg-cosmic-violet !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-cosmic-cyan !border-2 !border-slate-900" />

      {/* Top Category Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.badge}`}>
          <Icon className="w-3 h-3" />
          <span>{cfg.label}</span>
        </span>
        <span className="text-[11px] font-mono text-slate-400">{mastery}%</span>
      </div>

      {/* Concept Name */}
      <div className="font-bold text-slate-100 text-sm tracking-wide leading-tight mb-2">
        {data.label || data.name}
      </div>

      {/* Snippet / Definition Preview */}
      {data.definition && (
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
          {data.definition}
        </p>
      )}

      {/* Mastery Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${
            mastery >= 80 ? 'from-emerald-500 to-teal-400' : mastery >= 50 ? 'from-amber-500 to-yellow-400' : 'from-rose-500 to-red-400'
          }`}
          style={{ width: `${Math.max(5, mastery)}%` }}
        />
      </div>
    </div>
  );
};

export default memo(CosmicNode);
