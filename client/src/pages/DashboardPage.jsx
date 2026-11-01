import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, graphsAPI, revisionAPI } from '../services/api';
import {
  Orbit,
  BookOpen,
  Brain,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  Upload,
  Bot,
  Repeat,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [graphs, setGraphs] = useState([]);
  const [revisionDue, setRevisionDue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [anRes, grRes, revRes] = await Promise.all([
          analyticsAPI.getDashboard(),
          graphsAPI.getAll(),
          revisionAPI.getQueue(),
        ]);
        setAnalytics(anRes.data.data);
        setGraphs(grRes.data.data || []);
        setRevisionDue(revRes.data.dueCount || 0);
      } catch (err) {
        console.warn('Dashboard load warning', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/40 border border-cosmic-border shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cosmic-violet/20 border border-cosmic-violet/30 text-cosmic-violet text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cosmic Laboratory Online</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Explorer'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-xl leading-relaxed">
              Your knowledge has a shape. Explore your neural constellations, review spaced repetition flashcards, or synthesize new course materials with AI.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/generator')}
              className="px-5 py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-md hover:scale-105 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Graph</span>
            </button>
            <button
              onClick={() => navigate('/universe')}
              className="px-5 py-3 rounded-2xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center space-x-2"
            >
              <Orbit className="w-4 h-4 text-cosmic-cyan" />
              <span>Open Universe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spaced Revision Alert Banner (if cards are due) */}
      {revisionDue > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 to-slate-900 border border-amber-500/40 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Repeat className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {revisionDue} Concept{revisionDue > 1 ? 's' : ''} Due for Spaced Review Today
              </div>
              <div className="text-xs text-amber-300/80">
                Reinforce long-term neural retention via SuperMemo SM-2.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/revisions')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shrink-0"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="cosmic-panel p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Subjects</span>
            <BookOpen className="w-4 h-4 text-cosmic-violet" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {analytics?.totalSubjects || 3}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Academic domains</div>
        </div>

        <div className="cosmic-panel p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Concepts</span>
            <Brain className="w-4 h-4 text-cosmic-cyan" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {analytics?.totalConcepts || 7}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Atomic nodes</div>
        </div>

        <div className="cosmic-panel p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Graphs</span>
            <Orbit className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {analytics?.totalGraphs || 1}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Constellations</div>
        </div>

        <div className="cosmic-panel p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Avg Mastery</span>
            <TrendingUp className="w-4 h-4 text-fuchsia-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {analytics?.averageMastery || 82}%
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Strong retention</div>
        </div>

        <div className="cosmic-panel p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Study Time</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {Math.round((analytics?.totalStudyMinutes || 180) / 60)}h {(analytics?.totalStudyMinutes || 180) % 60}m
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total investment</div>
        </div>

        <div className="cosmic-panel p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {user?.streak || 7} Days
          </div>
          <div className="text-[11px] text-amber-400 mt-1">Active momentum</div>
        </div>
      </div>

      {/* Charts & Interactive Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Recharts */}
        <div className="lg:col-span-2 cosmic-panel p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Weekly Learning Minutes</h3>
              <p className="text-xs text-slate-400">Daily study investment across subjects</p>
            </div>
            <span className="text-xs font-mono text-cosmic-cyan px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30">
              Live Tracker
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.weeklyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} unit="m" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Bar dataKey="minutes" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Mastery Distribution */}
        <div className="cosmic-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Subject Proficiency</h3>
            <p className="text-xs text-slate-400 mb-6">Curriculum mastery breakdown</p>

            <div className="space-y-4">
              {(analytics?.subjectMasteryData || []).map((subj, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{subj.fullName || subj.subject}</span>
                    <span className="font-mono text-slate-400">{subj.mastery}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${subj.mastery}%`,
                        backgroundColor: subj.color || '#8B5CF6',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/analytics')}
            className="w-full mt-6 py-2.5 px-4 rounded-xl text-xs font-semibold text-cosmic-violet bg-cosmic-violet/10 hover:bg-cosmic-violet/20 border border-cosmic-violet/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>View Full Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-base font-bold text-white mb-4">Quick Laboratory Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            onClick={() => navigate('/subjects')}
            className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cosmic-violet/50 hover:bg-slate-900 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-950/80 text-violet-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">New Subject</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Organize course</span>
          </button>

          <button
            onClick={() => navigate('/generator')}
            className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">AI Graph Generator</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Extract from PDF</span>
          </button>

          <button
            onClick={() => navigate('/universe')}
            className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Orbit className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">Knowledge Graph</span>
            <span className="text-[10px] text-slate-400 mt-0.5">React Flow canvas</span>
          </button>

          <button
            onClick={() => navigate('/tutor')}
            className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">Ask AI Tutor</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Contextual dialog</span>
          </button>

          <button
            onClick={() => navigate('/revisions')}
            className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Repeat className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">Daily Revision</span>
            <span className="text-[10px] text-slate-400 mt-0.5">SM-2 flashcards</span>
          </button>
        </div>
      </div>

      {/* Recent Knowledge Graphs Constellations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Your Knowledge Constellations</h3>
          <button
            onClick={() => navigate('/universe')}
            className="text-xs text-cosmic-violet hover:underline flex items-center space-x-1 font-semibold"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {graphs.map((graph) => (
            <div
              key={graph._id}
              onClick={() => navigate('/universe', { state: { graphId: graph._id } })}
              className="cosmic-panel p-5 rounded-2xl cosmic-panel-hover cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  {graph.subjectId?.name || 'General Knowledge'}
                </span>
                <span className="text-xs font-mono text-cosmic-cyan">
                  {graph.nodes?.length || 0} nodes
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">{graph.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {graph.description || 'Interactive React Flow knowledge universe.'}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Updated recently</span>
                <span className="text-cosmic-violet font-semibold flex items-center space-x-1">
                  <span>Open Graph</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
