import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectsAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Orbit,
  Brain,
  Layers,
  ArrowRight,
  Sparkles,
  Tag,
  Calendar
} from 'lucide-react';

const SubjectsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [semester, setSemester] = useState('Semester 5');
  const [tags, setTags] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await subjectsAPI.getAll();
      setSubjects(res.data.data || []);
    } catch (err) {
      showToast('Error loading subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await subjectsAPI.create({
        name,
        code,
        description,
        color,
        semester,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
      });

      showToast('Subject created successfully!', 'success');
      setShowModal(false);
      setName('');
      setCode('');
      setDescription('');
      setTags('');
      fetchSubjects();
    } catch (err) {
      showToast('Error creating subject', 'error');
    }
  };

  const handleDeleteSubject = async (id, subjectName) => {
    if (!window.confirm(`Are you sure you want to delete ${subjectName}? All associated graphs will be removed.`)) return;

    try {
      await subjectsAPI.delete(id);
      setSubjects(prev => prev.filter(s => s._id !== id));
      showToast('Subject deleted', 'info');
    } catch (err) {
      showToast('Error deleting subject', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cosmic-violet/20 border border-cosmic-violet/30 text-cosmic-violet text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Curriculum Organizer</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Subjects</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize coursework into connected subjects with atomic concept tracking and graph universes.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-md hover:scale-105 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subjects.map((subj) => (
          <div
            key={subj._id}
            className="cosmic-panel p-6 rounded-3xl cosmic-panel-hover flex flex-col justify-between border-t-4"
            style={{ borderTopColor: subj.color || '#8B5CF6' }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  {subj.code || 'CS'}
                </span>
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{subj.semester || 'Semester 5'}</span>
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{subj.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {subj.description || 'Core theoretical and practical computer science coursework.'}
              </p>

              {/* Counts */}
              <div className="flex items-center space-x-4 py-3 border-y border-slate-800/80 text-xs text-slate-300">
                <div className="flex items-center space-x-1.5">
                  <Brain className="w-3.5 h-3.5 text-cosmic-cyan" />
                  <span>{subj.conceptCount || 0} Concepts</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Orbit className="w-3.5 h-3.5 text-cosmic-violet" />
                  <span>{subj.graphCount || 0} Graphs</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-2 flex items-center justify-between">
              <button
                onClick={() => navigate('/universe', { state: { subjectId: subj._id } })}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cosmic-violet/20 hover:bg-cosmic-violet/30 text-cosmic-violet border border-cosmic-violet/30 transition-all flex items-center space-x-1.5"
              >
                <Orbit className="w-3.5 h-3.5" />
                <span>Open Graph</span>
              </button>

              <button
                onClick={() => handleDeleteSubject(subj._id, subj.name)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                title="Delete Subject"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE SUBJECT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full cosmic-panel p-6 rounded-3xl border border-cosmic-border shadow-2xl animate-scale-up">
            <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cosmic-violet" />
              <span>Create New Subject</span>
            </h3>

            <form onSubmit={handleCreateSubject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & Cloud"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS401"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Semester</label>
                  <input
                    type="text"
                    placeholder="e.g. Semester 6"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Theme Color</label>
                <div className="flex items-center space-x-2">
                  {['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Summary of topics covered..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-sm"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;
