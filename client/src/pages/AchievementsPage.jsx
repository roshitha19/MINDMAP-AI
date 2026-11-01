import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  Lock,
  Compass,
  Layers,
  Repeat,
  HelpCircle,
  Zap
} from 'lucide-react';

const iconMap = {
  Compass: Compass,
  Layers: Layers,
  Flame: Flame,
  Award: Award,
  Repeat: Repeat,
  HelpCircle: HelpCircle,
  Sparkles: Sparkles,
};

const AchievementsPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGamification = async () => {
      try {
        const res = await gamificationAPI.getAchievements();
        setProfile(res.data.data);
      } catch (err) {
        console.warn('Gamification load error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGamification();
  }, []);

  const currentLevel = profile?.level || user?.level || 1;
  const currentXp = profile?.xp || user?.xp || 100;
  const levelProgress = profile?.levelProgress || 45;
  const nextLevelXp = profile?.nextLevelXp || 300;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cosmic-violet/20 border border-cosmic-violet/30 text-cosmic-violet text-xs font-semibold mb-2">
          <Award className="w-3.5 h-3.5" />
          <span>Gamified Knowledge Progression</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Achievements & Badges</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Unlock cosmic honors, earn experience points (XP), and elevate your academic rank through verified learning activity.
        </p>
      </div>

      {/* Gamification Progress Hero Card */}
      <div className="cosmic-panel p-6 sm:p-8 rounded-3xl border border-cosmic-border shadow-2xl relative overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950/40 to-purple-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-cosmic-indigo via-cosmic-violet to-purple-600 flex items-center justify-center text-white shadow-cosmic-lg font-black text-2xl shrink-0">
              Lvl {currentLevel}
            </div>

            <div>
              <div className="text-xs font-bold text-cosmic-cyan uppercase tracking-wider">
                Current Title: Cosmic Scholar Tier IV
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {user?.name || 'Explorer'}
              </h2>
              <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                  <Flame className="w-4 h-4" />
                  <span>{user?.streak || 7} Day Streak</span>
                </span>
                <span>•</span>
                <span className="font-mono text-slate-300 font-semibold">{currentXp} Lifetime XP</span>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="w-full md:w-64 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Level {currentLevel + 1} Progress</span>
              <span className="font-mono text-cosmic-violet">{levelProgress}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cosmic-indigo via-cosmic-violet to-cyan-400 transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 text-right">
              {300 - (currentXp % 300)} XP to next academic rank
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <h3 className="text-base font-bold text-white mb-4">Milestone Badges ({profile?.badges?.length || 6})</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(profile?.badges || []).map((badge) => {
            const IconComponent = iconMap[badge.icon] || Award;
            const isUnlocked = badge.unlocked;

            return (
              <div
                key={badge._id || badge.badgeId}
                className={`cosmic-panel p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'border-cosmic-violet/60 bg-gradient-to-br from-slate-900/90 to-purple-950/20 shadow-cosmic-sm'
                    : 'border-slate-800/80 bg-slate-950/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-md ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white border-violet-400/80 shadow-cosmic-md'
                        : 'bg-slate-900 text-slate-600 border-slate-800'
                    }`}>
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {isUnlocked ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-900 text-slate-500 border border-slate-800 text-[10px] font-bold">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">{badge.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{badge.description}</p>
                </div>

                {/* Progress bar within badge */}
                <div className="pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium text-slate-400">
                    <span>Target Progress</span>
                    <span className="font-mono text-slate-300">
                      {Math.min(badge.target, badge.progress)} / {badge.target}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isUnlocked ? 'bg-cosmic-violet' : 'bg-slate-600'
                      }`}
                      style={{ width: `${Math.min(100, (badge.progress / badge.target) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
