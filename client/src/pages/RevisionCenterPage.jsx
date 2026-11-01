import React, { useState, useEffect } from 'react';
import { revisionAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import {
  Repeat,
  Flame,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Sigma,
  Lightbulb,
  ArrowRight,
  RotateCw,
  Sparkles,
  Award
} from 'lucide-react';

const RevisionCenterPage = () => {
  const { showToast } = useNotification();

  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [weakConcepts, setWeakConcepts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  useEffect(() => {
    loadRevisionData();
  }, []);

  const loadRevisionData = async () => {
    try {
      const [qRes, sRes] = await Promise.all([
        revisionAPI.getQueue(),
        revisionAPI.getStats(),
      ]);

      setQueue(qRes.data.queue || []);
      setWeakConcepts(qRes.data.weakConcepts || []);
      setStats(sRes.data.data || null);
    } catch (err) {
      console.warn('Error loading revisions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRateCard = async (rating) => {
    if (!queue[currentIndex]) return;
    const card = queue[currentIndex];

    try {
      const res = await revisionAPI.submitFeedback(card.conceptId._id, rating);
      showToast(`Review recorded! Next review in ${res.data.data.intervalDays} day(s).`, 'success', 2000);

      setIsFlipped(false);
      if (currentIndex < queue.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setSessionCompleted(true);
      }
    } catch (err) {
      showToast('Error recording revision response', 'error');
    }
  };

  const currentCard = queue[currentIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cosmic-violet/20 border border-cosmic-violet/30 text-cosmic-violet text-xs font-semibold mb-2">
            <Repeat className="w-3.5 h-3.5" />
            <span>SuperMemo SM-2 Spaced Repetition</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Smart Revision Center</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Defeat the Ebbinghaus forgetting curve through timed active recall flashcards.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center space-x-3">
          <div className="cosmic-panel px-4 py-2 rounded-2xl flex items-center space-x-3 border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Cards Reviewed</div>
              <div className="text-base font-bold text-white">{stats?.totalReviewsAllTime || 12}</div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Due Today</div>
              <div className="text-base font-bold text-amber-400">{queue.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* FLASHCARD INTERFACE */}
      {!sessionCompleted && queue.length > 0 && currentCard ? (
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Card {currentIndex + 1} of {queue.length}
            </span>
            <span className="font-mono text-cosmic-cyan">
              Ease Factor: {currentCard.easeFactor || 2.5}
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cosmic-indigo to-cosmic-violet transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }}
            />
          </div>

          {/* Interactive Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[360px] cosmic-panel p-8 rounded-3xl border border-cosmic-border shadow-2xl cursor-pointer transition-all duration-500 hover:border-cosmic-violet/60 relative flex flex-col justify-between"
          >
            {/* Top Card Info */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                {currentCard.subjectId?.name || 'Computer Science'}
              </span>
              <span className="text-xs text-slate-500 flex items-center space-x-1">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click anywhere to flip</span>
              </span>
            </div>

            {/* Front vs Back View */}
            {!isFlipped ? (
              <div className="py-12 text-center my-auto">
                <span className="text-xs font-semibold uppercase text-cosmic-violet tracking-widest">
                  {currentCard.conceptId?.category ? currentCard.conceptId.category.replace('_', ' ') : 'Concept'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 mb-4">
                  {currentCard.conceptId?.name}
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Can you recall its formal invariant, asymptotic bound, or operational definition?
                </p>
              </div>
            ) : (
              <div className="py-6 space-y-4 my-auto animate-fade-in text-left">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{currentCard.conceptId?.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                    {currentCard.conceptId?.definition || currentCard.conceptId?.explanation}
                  </p>
                </div>

                {currentCard.conceptId?.formula && (
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Formula</span>
                    <div className="bg-slate-900 border border-emerald-500/30 p-2.5 rounded-lg text-xs font-mono text-emerald-300 mt-1">
                      {currentCard.conceptId.formula}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-center text-[11px] text-slate-500 border-t border-slate-800/80 pt-3">
              {isFlipped ? 'How accurately did you recall this concept?' : 'Tap to reveal answer'}
            </div>
          </div>

          {/* SM-2 Response Rating Buttons (Visible when flipped) */}
          {isFlipped && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up">
              <button
                onClick={() => handleRateCard('again')}
                className="py-3 px-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 hover:bg-rose-900/80 text-rose-300 text-xs font-bold transition-all flex flex-col items-center shadow-lg"
              >
                <span>Again</span>
                <span className="text-[10px] font-normal text-rose-400 mt-0.5">Reset (1 day)</span>
              </button>

              <button
                onClick={() => handleRateCard('difficult')}
                className="py-3 px-4 rounded-2xl bg-amber-950/70 border border-amber-500/40 hover:bg-amber-900/80 text-amber-300 text-xs font-bold transition-all flex flex-col items-center shadow-lg"
              >
                <span>Difficult</span>
                <span className="text-[10px] font-normal text-amber-400 mt-0.5">2 days</span>
              </button>

              <button
                onClick={() => handleRateCard('good')}
                className="py-3 px-4 rounded-2xl bg-blue-950/70 border border-blue-500/40 hover:bg-blue-900/80 text-blue-300 text-xs font-bold transition-all flex flex-col items-center shadow-lg"
              >
                <span>Good</span>
                <span className="text-[10px] font-normal text-blue-400 mt-0.5">4-6 days</span>
              </button>

              <button
                onClick={() => handleRateCard('easy')}
                className="py-3 px-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold transition-all flex flex-col items-center shadow-lg"
              >
                <span>Easy</span>
                <span className="text-[10px] font-normal text-emerald-400 mt-0.5">7+ days bonus</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Completed or Empty State */
        <div className="cosmic-panel p-10 rounded-3xl border border-cosmic-border text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-emerald-glow">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">All Daily Revisions Completed!</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Great job! You have satisfied all scheduled SuperMemo SM-2 intervals for today. Your neural memory pathways are strengthened.
          </p>
        </div>
      )}

      {/* Weak Concepts Detection List */}
      {weakConcepts.length > 0 && (
        <div className="cosmic-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>Identified Concepts Needing Attention (&lt; 50% Mastery)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weakConcepts.map((item) => (
              <div
                key={item._id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">{item.conceptId?.name}</div>
                  <div className="text-[10px] text-slate-400">{item.subjectId?.name}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {item.masteryScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RevisionCenterPage;
