import React, { useState, useEffect } from 'react';
import { resourceAPI, subjectsAPI, conceptsAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import {
  FolderArchive,
  Upload,
  FileText,
  Link2,
  Trash2,
  Search,
  ExternalLink,
  Plus,
  BookOpen,
  Eye,
  X,
  FileCode,
  Tag
} from 'lucide-react';

const ResourceLibraryPage = () => {
  const { showToast } = useNotification();

  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [concepts, setConcepts] = useState([]);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [previewResource, setPreviewResource] = useState(null);

  // Form State
  const [uploadFile, setUploadFile] = useState(null);
  const [resourceTitle, setResourceTitle] = useState('');
  const [targetSubjectId, setTargetSubjectId] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [resourceTags, setResourceTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedSubject, selectedType]);

  const loadData = async () => {
    try {
      const [rRes, sRes, cRes] = await Promise.all([
        resourceAPI.getAll({
          subjectId: selectedSubject || undefined,
          type: selectedType || undefined,
        }),
        subjectsAPI.getAll(),
        conceptsAPI.getAll(),
      ]);

      setResources(rRes.data.data || []);
      setSubjects(sRes.data.data || []);
      setConcepts(cRes.data.data || []);
      if (sRes.data.data?.length > 0 && !targetSubjectId) {
        setTargetSubjectId(sRes.data.data[0]._id);
      }
    } catch (err) {
      console.warn('Resource library fetch error', err);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      showToast('Please select a file', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', resourceTitle || uploadFile.name);
      formData.append('subjectId', targetSubjectId);
      formData.append('tags', resourceTags);

      await resourceAPI.upload(formData);
      showToast('Resource uploaded and indexed successfully!', 'success');
      setShowUploadModal(false);
      setUploadFile(null);
      setResourceTitle('');
      setResourceTags('');
      loadData();
    } catch (err) {
      showToast('Error uploading resource', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!resourceTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await resourceAPI.createManual({
        title: resourceTitle,
        type: externalUrl ? 'link' : 'note',
        contentText: noteContent,
        externalUrl,
        subjectId: targetSubjectId,
        tags: resourceTags ? resourceTags.split(',').map(t => t.trim()) : [],
      });

      showToast('Study note recorded in universe!', 'success');
      setShowNoteModal(false);
      setResourceTitle('');
      setNoteContent('');
      setExternalUrl('');
      setResourceTags('');
      loadData();
    } catch (err) {
      showToast('Error saving note', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Delete this resource permanently?')) return;
    try {
      await resourceAPI.delete(id);
      setResources(prev => prev.filter(r => r._id !== id));
      showToast('Resource removed', 'info');
    } catch (err) {
      showToast('Error deleting resource', 'error');
    }
  };

  const filteredResources = resources.filter(r =>
    !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cosmic-violet/20 border border-cosmic-violet/30 text-cosmic-violet text-xs font-semibold mb-2">
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Digital Knowledge Vault</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Resource Library</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Store lecture slides, research papers, Markdown notes, and external links attached to concepts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNoteModal(true)}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Note / Link</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-md hover:scale-105 transition-all flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="cosmic-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search library documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cosmic-violet text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none capitalize"
          >
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
            <option value="note">Markdown Note</option>
            <option value="link">External Link</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing {filteredResources.length} items
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => (
          <div
            key={res._id}
            className="cosmic-panel p-6 rounded-3xl cosmic-panel-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                  res.type === 'pdf' ? 'bg-rose-950/60 border-rose-500/40 text-rose-300' :
                  res.type === 'docx' ? 'bg-blue-950/60 border-blue-500/40 text-blue-300' :
                  res.type === 'link' ? 'bg-amber-950/60 border-amber-500/40 text-amber-300' :
                  'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                }`}>
                  {res.type}
                </span>
                <span className="text-[11px] text-slate-500">
                  {res.fileSize ? `${Math.round(res.fileSize / 1024)} KB` : 'Note'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1.5 truncate">{res.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                {res.contentText || res.externalUrl || 'No preview text extracted.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => setPreviewResource(res)}
                className="text-xs font-semibold text-cosmic-violet hover:underline flex items-center space-x-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Document</span>
              </button>

              <button
                onClick={() => handleDeleteResource(res._id)}
                className="p-1 hover:text-rose-400 text-slate-500"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full cosmic-panel p-6 rounded-3xl border border-cosmic-border shadow-2xl animate-scale-up">
            <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-cosmic-violet" />
              <span>Upload Document to Vault</span>
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select File (PDF, DOCX, TXT)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.txt,.md"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cosmic-violet/20 file:text-cosmic-violet hover:file:bg-cosmic-violet/30 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems Chapter 8 - Paging"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Subject</label>
                <select
                  value={targetSubjectId}
                  onChange={(e) => setTargetSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-sm"
                >
                  {isSubmitting ? 'Uploading...' : 'Upload & Parse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL NOTE MODAL */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full cosmic-panel p-6 rounded-3xl border border-cosmic-border shadow-2xl animate-scale-up">
            <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cosmic-violet" />
              <span>Record Markdown Note or Web Link</span>
            </h3>

            <form onSubmit={handleNoteSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red-Black Tree Rotation Rules"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">External Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Markdown Notes / Content</label>
                <textarea
                  rows="5"
                  placeholder="Write your study notes, code snippets, or formulas..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none font-mono resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cosmic-violet text-white shadow-cosmic-sm"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewResource && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full cosmic-panel p-6 sm:p-8 rounded-3xl border border-cosmic-border shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  {previewResource.type}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{previewResource.title}</h3>
              </div>
              <button
                onClick={() => setPreviewResource(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {previewResource.contentText || 'No preview content available.'}
            </div>

            {previewResource.externalUrl && (
              <a
                href={previewResource.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-cosmic-cyan hover:underline flex items-center space-x-1"
              >
                <span>Open external resource link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceLibraryPage;
