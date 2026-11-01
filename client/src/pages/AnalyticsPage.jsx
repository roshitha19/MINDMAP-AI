import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  BookOpen
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsAPI.getDashboard();
        setData(res.data.data);
      } catch (err) {
        console.warn('Analytics load error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalMinutes = data?.totalStudyMinutes || 180;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cosmic-violet/20 border border-cosmic-violet/30 text-cosmic-violet text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Real-Time Neural Telemetry</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Analytics Dashboard</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Algorithmic breakdown of your concept retention, study volume, and subject mastery over time.
        </p>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="cosmic-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Average Mastery</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{data?.averageMastery || 82}%</div>
          <div className="text-[11px] text-emerald-400 mt-1">Weighted retention</div>
        </div>

        <div className="cosmic-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Study Investment</span>
            <Clock className="w-4 h-4 text-cosmic-cyan" />
          </div>
          <div className="text-3xl font-black text-white">{hours}h {minutes}m</div>
          <div className="text-[11px] text-slate-400 mt-1">Active engagement</div>
        </div>

        <div className="cosmic-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Learning Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{data?.streak || 7} Days</div>
          <div className="text-[11px] text-amber-400 mt-1">Continuous momentum</div>
        </div>

        <div className="cosmic-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Quiz Accuracy</span>
            <Award className="w-4 h-4 text-cosmic-violet" />
          </div>
          <div className="text-3xl font-black text-white">{data?.avgQuizAccuracy || 88}%</div>
          <div className="text-[11px] text-cosmic-violet mt-1">Across all attempts</div>
        </div>
      </div>

      {/* Primary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Growth Curve */}
        <div className="cosmic-panel p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-1">Cumulative Knowledge Growth</h3>
          <p className="text-xs text-slate-400 mb-6">Total concepts internalized into the universe</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.knowledgeGrowth || []}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#FFF',
                  }}
                />
                <Area type="monotone" dataKey="concepts" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#growthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Learning Activity */}
        <div className="cosmic-panel p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-1">Weekly Learning Distribution</h3>
          <p className="text-xs text-slate-400 mb-6">Daily minutes committed to active study</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.weeklyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} unit="m" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#FFF',
                  }}
                />
                <Bar dataKey="minutes" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Radar Subject Mastery Breakdown */}
      <div className="cosmic-panel p-6 sm:p-8 rounded-3xl">
        <h3 className="text-sm font-bold text-white mb-1">Subject Proficiency Radar</h3>
        <p className="text-xs text-slate-400 mb-6">Multi-dimensional curriculum competence comparison</p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data?.subjectMasteryData || []}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={11} />
              <PolarRadiusAxis stroke="#475569" angle={30} domain={[0, 100]} />
              <Radar name="Mastery %" dataKey="mastery" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#FFF',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strongest vs Weakest Concepts Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strongest */}
        <div className="cosmic-panel p-6 rounded-3xl border border-emerald-500/30">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 mb-4">
            <CheckCircle2 className="w-4 h-4" />
            <span>Top Performing Mastered Concepts (&ge; 80%)</span>
          </div>

          <div className="space-y-3">
            {(data?.strongestConcepts || []).map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{item.conceptId?.name}</div>
                  <div className="text-[10px] text-slate-400">{item.subjectId?.name}</div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">{item.masteryScore}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weakest */}
        <div className="cosmic-panel p-6 rounded-3xl border border-rose-500/30">
          <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>Concepts Requiring Active Reinforcement (&lt; 80%)</span>
          </div>

          <div className="space-y-3">
            {(data?.weakestConcepts || []).map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{item.conceptId?.name}</div>
                  <div className="text-[10px] text-slate-400">{item.subjectId?.name}</div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400">{item.masteryScore}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
