import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiAPI, subjectsAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import {
  Upload,
  FileText,
  Sparkles,
  RefreshCw,
  Save,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Brain,
  Layers,
  ArrowRight
} from 'lucide-react';

const GraphGeneratorPage = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'text'
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [subjectName, setSubjectName] = useState('Operating Systems');
  const [graphTitle, setGraphTitle] = useState('Memory Management Universe');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);

  // Edit node inside preview
  const [editingIndex, setEditingIndex] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDef, setEditDef] = useState('');

  // Handle file drop/selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Run AI Extraction
  const handleExtract = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setExtractionResult(null);

    try {
      let res;
      if (activeTab === 'upload') {
        if (!file) {
          showToast('Please select a PDF, DOCX, or TXT file', 'error');
          setIsProcessing(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subjectName', subjectName);
        res = await aiAPI.extractFile(formData);
      } else {
        if (!pastedText.trim()) {
          showToast('Please paste your study notes or curriculum', 'error');
          setIsProcessing(false);
          return;
        }
        res = await aiAPI.extractText({
          text: pastedText,
          subjectName,
        });
      }

      setExtractionResult(res.data.data);
      showToast(
        `Extracted ${res.data.data.concepts?.length || 0} concepts with ${res.data.data.aiProvider}`,
        'success'
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to extract concepts', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove node from preview
  const handleRemoveConcept = (index) => {
    if (!extractionResult) return;
    const updatedConcepts = extractionResult.concepts.filter((_, i) => i !== index);
    const updatedNodes = extractionResult.previewGraph.nodes.filter((_, i) => i !== index);
    setExtractionResult({
      ...extractionResult,
      concepts: updatedConcepts,
      previewGraph: {
        ...extractionResult.previewGraph,
        nodes: updatedNodes,
      },
    });
    showToast('Node removed from candidate universe', 'info', 1800);
  };

  // Edit node
  const startEditConcept = (index) => {
    const c = extractionResult.concepts[index];
    setEditingIndex(index);
    setEditName(c.name);
    setEditCategory(c.category);
    setEditDef(c.definition);
  };

  const saveEditConcept = () => {
    if (!extractionResult || editingIndex === null) return;
    const updatedConcepts = [...extractionResult.concepts];
    updatedConcepts[editingIndex] = {
      ...updatedConcepts[editingIndex],
      name: editName,
      category: editCategory,
      definition: editDef,
    };

    const updatedNodes = [...extractionResult.previewGraph.nodes];
    if (updatedNodes[editingIndex]) {
      updatedNodes[editingIndex].data.name = editName;
      updatedNodes[editingIndex].data.label = editName;
      updatedNodes[editingIndex].data.category = editCategory;
      updatedNodes[editingIndex].data.definition = editDef;
    }

    setExtractionResult({
      ...extractionResult,
      concepts: updatedConcepts,
      previewGraph: {
        ...extractionResult.previewGraph,
        nodes: updatedNodes,
      },
    });
    setEditingIndex(null);
    showToast('Concept updated!', 'success', 1500);
  };

  // Confirm and persist to database
  const handleSaveToUniverse = async () => {
    if (!extractionResult) return;
    setIsSaving(true);
    try {
      const res = await aiAPI.saveGeneratedGraph({
        subjectName,
        graphTitle: graphTitle || `${subjectName} Universe`,
        concepts: extractionResult.concepts,
        previewGraph: extractionResult.previewGraph,
      });

      showToast('Knowledge Universe successfully created & saved!', 'success');
      navigate('/universe', { state: { graphId: res.data.data.graph._id } });
    } catch (err) {
      showToast('Error saving generated graph', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cosmic-violet/20 border border-cosmic-violet/30 text-cosmic-violet text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Extraction Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          AI Knowledge Graph Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Upload PDF/DOCX coursework or paste textbook materials. The AI parses entities, categorizes definitions, and builds a connected knowledge constellation.
        </p>
      </div>

      {/* Input Section */}
      <div className="cosmic-panel p-6 sm:p-8 rounded-3xl">
        {/* Source Switcher Tabs */}
        <div className="flex border-b border-slate-800 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-cosmic-violet text-white shadow-cosmic-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document (PDF, DOCX, TXT)</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`ml-3 flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'text'
                ? 'bg-cosmic-violet text-white shadow-cosmic-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Notes / Study Text</span>
          </button>
        </div>

        {/* Form Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject Domain</label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g. Distributed Systems"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cosmic-violet text-xs text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Graph Title</label>
            <input
              type="text"
              value={graphTitle}
              onChange={(e) => setGraphTitle(e.target.value)}
              placeholder="e.g. Memory Virtualization Constellation"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cosmic-violet text-xs text-white outline-none"
            />
          </div>
        </div>

        {activeTab === 'upload' ? (
          <div className="border-2 border-dashed border-slate-700 hover:border-cosmic-violet/60 rounded-2xl p-8 text-center bg-slate-950/60 transition-colors">
            <input
              type="file"
              id="file-input"
              accept=".pdf,.docx,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-cosmic-violet mb-3 shadow-cosmic-sm">
                <Upload className="w-7 h-7" />
              </div>
              <span className="text-sm font-bold text-slate-200">
                {file ? file.name : 'Click to select or drag and drop course documents'}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                Supports PDF, DOCX, TXT, and Markdown files up to 15MB
              </span>
            </label>
          </div>
        ) : (
          <div>
            <textarea
              rows="6"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste lecture notes, textbook chapters, or concept summaries here (at least 2-3 paragraphs)..."
              className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 focus:border-cosmic-violet text-xs text-slate-100 placeholder-slate-500 outline-none leading-relaxed resize-none"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleExtract}
            disabled={isProcessing}
            className="px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cosmic-indigo via-cosmic-violet to-purple-600 text-white shadow-cosmic-md hover:scale-105 transition-all flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Synthesizing with AI...' : 'Generate Knowledge Universe'}</span>
          </button>
        </div>
      </div>

      {/* AI Extraction Preview & Review Panel */}
      {extractionResult && (
        <div className="cosmic-panel p-6 sm:p-8 rounded-3xl border border-cosmic-violet/40 shadow-2xl animate-scale-up space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Candidate Universe Preview</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  extractionResult.isDemoMode
                    ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                }`}>
                  Engine: {extractionResult.aiProvider}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Extracted {extractionResult.concepts?.length} atomic concepts & {extractionResult.relationships?.length} semantic relationships.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleExtract}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300 hover:text-white border border-slate-700 flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>

              <button
                onClick={handleSaveToUniverse}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-glow flex items-center space-x-2 hover:scale-105 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Persisting...' : 'Confirm & Save to My Universe'}</span>
              </button>
            </div>
          </div>

          {/* Concepts Grid for Review / Editing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {extractionResult.concepts.map((concept, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cosmic-violet/20 text-cosmic-violet border border-cosmic-violet/30 capitalize">
                      {concept.category ? concept.category.replace('_', ' ') : 'Subtopic'}
                    </span>
                    <div className="flex items-center space-x-1 text-slate-400">
                      <button
                        onClick={() => startEditConcept(index)}
                        className="p-1 hover:text-white"
                        title="Edit Concept"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveConcept(index)}
                        className="p-1 hover:text-rose-400"
                        title="Remove Node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">{concept.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {concept.definition || concept.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Concept Modal */}
      {editingIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full cosmic-panel p-6 rounded-3xl border border-cosmic-border">
            <h3 className="text-base font-bold text-white mb-4">Edit Candidate Concept</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Concept Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none capitalize"
                >
                  <option value="main_topic">Main Topic</option>
                  <option value="subtopic">Subtopic</option>
                  <option value="definition">Definition</option>
                  <option value="formula">Formula</option>
                  <option value="example">Example</option>
                  <option value="prerequisite">Prerequisite</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Definition</label>
                <textarea
                  rows="3"
                  value={editDef}
                  onChange={(e) => setEditDef(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none resize-none"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setEditingIndex(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={saveEditConcept}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-cosmic-violet text-white shadow-cosmic-sm"
              >
                Save Edits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphGeneratorPage;
