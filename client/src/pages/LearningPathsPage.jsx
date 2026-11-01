import React, { useState, useEffect } from 'react';
import { pathsAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import {
  Compass,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  GitMerge,
  Layers,
  Plus,
  BookOpen,
  Award
} from 'lucide-react';

const LearningPathsPage = () => {
  const { showToast } = useNotification();

  const [paths, setPaths] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaths();
  }, []);

  const loadPaths = async () => {
    try {
      const res = await pathsAPI.getAll();
      const userPaths = res.data.data || [];
      setPaths(userPaths);
      setTemplates(res.data.templates || []);
      if (userPaths.length > 0) {
        setSelectedPath(userPaths[0]);
      }
    } catch (err) {
      console.warn('Paths load warning', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConcept = async (stageNumber, conceptName) => {
    if (!selectedPath) return;

    try {
      const res = await pathsAPI.toggleConcept(selectedPath._id, {
        stageNumber,
        conceptName,
      });

      setSelectedPath(res.data.data);
      setPaths(prev => prev.map(p => p._id === res.data.data._id ? res.data.data : p));
      showToast('Milestone progress updated!', 'success', 1800);
    } catch (err) {
      showToast('Error updating milestone', 'error');
    }
  };

  const handleCloneTemplate = async (templateIndex) => {
    try {
      const res = await pathsAPI.create({ templateIndex });
      setPaths(prev => [res.data.data, ...prev]);
      setSelectedPath(res.data.data);
      showToast('Learning roadmap added to your profile!', 'success');
    } catch (err) {
      showToast('Failed to add roadmap', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cosmic-violet/20 border border-cosmic-violet/30 text-cosmic-violet text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Topological Prerequisite Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Smart Learning Paths</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Structured career and syllabus roadmaps sequenced using graph-based dependency resolution.
          </p>
        </div>
      </div>

      {/* Path Selector Tabs */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2">
        {paths.map((p) => (
          <button
            key={p._id}
            onClick={() => setSelectedPath(p)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedPath?._id === p._id
                ? 'bg-cosmic-violet/25 text-white border-cosmic-violet/50 shadow-cosmic-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* ACTIVE ROADMAP VIEW */}
      {selectedPath && (
        <div className="space-y-6">
          {/* Progress Header Card */}
          <div className="cosmic-panel p-6 sm:p-8 rounded-3xl border border-cosmic-border shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cosmic-violet/20 text-cosmic-violet border border-cosmic-violet/30">
                Target Role: {selectedPath.targetRole}
              </span>
              <h2 className="text-2xl font-bold text-white mt-2">{selectedPath.title}</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                {selectedPath.description}
              </p>
            </div>

            <div className="w-full md:w-56 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Total Completion</span>
                <span className="font-mono text-emerald-400 text-sm">{selectedPath.progressPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${selectedPath.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sequential Stages DAG */}
          <div className="space-y-6 relative">
            {selectedPath.stages.map((stage, stageIdx) => (
              <div
                key={stageIdx}
                className={`cosmic-panel p-6 rounded-3xl border transition-all ${
                  stage.isCompleted
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-slate-800 bg-slate-900/70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-xl bg-cosmic-violet/20 border border-cosmic-violet/40 text-cosmic-violet font-bold text-xs flex items-center justify-center font-mono">
                      {stage.stageNumber}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{stage.title}</h3>
                      <p className="text-xs text-slate-400">{stage.description}</p>
                    </div>
                  </div>

                  {stage.prerequisites && stage.prerequisites.length > 0 && (
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                      <GitMerge className="w-3.5 h-3.5 text-cosmic-cyan" />
                      <span>Prereq: {stage.prerequisites.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Concept Milestones Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stage.requiredConcepts.map((concept, cIdx) => (
                    <div
                      key={cIdx}
                      onClick={() => handleToggleConcept(stage.stageNumber, concept.name)}
                      className={`p-3.5 rounded-2xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                        concept.isCompleted
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-200'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        {concept.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <span className={`truncate ${concept.isCompleted ? 'line-through text-slate-400' : ''}`}>
                          {concept.name}
                        </span>
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500 font-mono">
                        {concept.category || 'core'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catalog of Prebuilt Roadmaps */}
      <div>
        <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-cosmic-cyan" />
          <span>Available Curated Roadmaps</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((tmpl, idx) => (
            <div key={idx} className="cosmic-panel p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  {tmpl.category}
                </span>
                <h4 className="text-sm font-bold text-white mt-2 mb-1">{tmpl.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{tmpl.description}</p>
              </div>

              <button
                onClick={() => handleCloneTemplate(idx)}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cosmic-violet border border-cosmic-violet/30 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Roadmap to Universe</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPathsPage;
