import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CosmicNode from '../components/CosmicNode';
import NodeDetailPanel from '../components/NodeDetailPanel';
import { graphsAPI, subjectsAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

import {
  Orbit,
  Search,
  Filter,
  Plus,
  Save,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronDown,
  X,
  Trash2,
  Edit3,
  Check,
  BookOpen,
  ArrowRight,
  FolderKanban,
  Compass,
  Cpu,
  Loader2,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'main_topic', label: 'Main Topics' },
  { id: 'subtopic', label: 'Subtopics' },
  { id: 'definition', label: 'Definitions' },
  { id: 'formula', label: 'Formulas' },
  { id: 'example', label: 'Examples' },
  { id: 'prerequisite', label: 'Prerequisites' },
  { id: 'advanced', label: 'Advanced' },
];

const CANONICAL_SUBJECTS = [
  'Computer Networks',
  'DBMS',
  'Operating Systems',
  'Data Structures & Algorithms',
  'Java Programming',
  'Python Programming',
  'JavaScript / Web Technologies',
  'Machine Learning & Data Science',
  'Artificial Intelligence',
  'Full-Stack Web Development',
];

const UniversePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  // Graphs and selection
  const [graphs, setGraphs] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState(null);
  const [topicsMap, setTopicsMap] = useState({});

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Inspection & Filtering
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Manual Node Creation Modal
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeCategory, setNewNodeCategory] = useState('subtopic');
  const [newNodeDef, setNewNodeDef] = useState('');
  const [newNodeFormula, setNewNodeFormula] = useState('');

  // Workflow Modal: Select Subject & Topic to Generate Graph
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalSubject, setModalSubject] = useState(CANONICAL_SUBJECTS[0]);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [modalTopic, setModalTopic] = useState('');
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Saved Graphs Drawer Modal
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);
  const [editingGraphId, setEditingGraphId] = useState(null);
  const [editingTitleText, setEditingTitleText] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Custom node types for React Flow
  const nodeTypes = useMemo(() => ({ cosmicNode: CosmicNode }), []);

  // Fetch topics map and user graphs on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gRes, tRes] = await Promise.all([
          graphsAPI.getAll(),
          graphsAPI.getTopicsMap().catch(() => ({ data: { data: {} } })),
        ]);

        const allGraphs = gRes.data.data || [];
        setGraphs(allGraphs);
        if (tRes.data?.data) {
          setTopicsMap(tRes.data.data);
        }

        // If target graph passed via navigation state, select it
        const targetId = location.state?.graphId;
        const initialGraph = targetId ? allGraphs.find((g) => g._id === targetId) : allGraphs[0];

        if (initialGraph) {
          loadGraphIntoCanvas(initialGraph);
        } else if (allGraphs.length === 0) {
          // Open create wizard automatically if no graphs exist
          setShowCreateModal(true);
        }
      } catch (err) {
        console.warn('Error loading universe graphs', err);
        showToast('Could not load knowledge graphs', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.state]);

  // Synchronize available topics when modal subject changes
  useEffect(() => {
    const activeSubj = modalSubject === 'custom' ? customSubjectInput : modalSubject;
    const available = topicsMap[activeSubj] || [];
    if (available.length > 0) {
      setModalTopic(available[0]);
    } else {
      setModalTopic('custom');
    }
  }, [modalSubject, customSubjectInput, topicsMap]);

  // Load a graph into the React Flow canvas
  const loadGraphIntoCanvas = (graph) => {
    setSelectedGraph(graph);

    const formattedNodes = (graph.nodes || []).map((n) => ({
      ...n,
      type: 'cosmicNode',
    }));

    const formattedEdges = (graph.edges || []).map((e) => ({
      ...e,
      animated: true,
      style: e.style || { stroke: '#8B5CF6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8B5CF6' },
    }));

    setNodes(formattedNodes);
    setEdges(formattedEdges);
    setSelectedNode(null);
  };

  // Switch to another graph
  const handleSelectGraph = (graphId) => {
    const target = graphs.find((g) => g._id === graphId);
    if (target) {
      loadGraphIntoCanvas(target);
      setShowSavedDrawer(false);
    }
  };

  // Node Click handler
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  // Edge Connection handler
  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        label: 'relates to',
        animated: true,
        style: { stroke: '#8B5CF6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#8B5CF6' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      showToast('Concepts connected!', 'success', 2500);
    },
    [setEdges, showToast]
  );

  // Manual Node Creation
  const handleCreateNode = async (e) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    const newNodeId = `node-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: 'cosmicNode',
      position: {
        x: 400 + Math.random() * 80 - 40,
        y: 300 + Math.random() * 80 - 40,
      },
      data: {
        label: newNodeName,
        name: newNodeName,
        category: newNodeCategory,
        definition: newNodeDef,
        formula: newNodeFormula,
        masteryScore: 10,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setShowAddNodeModal(false);
    setNewNodeName('');
    setNewNodeDef('');
    setNewNodeFormula('');
    showToast(`Created node "${newNodeName}"`, 'success');
  };

  // Save Graph Changes to MongoDB
  const handleSaveGraph = async () => {
    if (!selectedGraph) {
      showToast('No active graph to save. Please generate or load one first.', 'warning');
      return;
    }
    setIsSaving(true);
    try {
      const res = await graphsAPI.update(selectedGraph._id, {
        nodes,
        edges,
        title: selectedGraph.title,
        topic: selectedGraph.topic,
      });

      const updated = res.data.data;
      setSelectedGraph(updated);
      setGraphs((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
      showToast('Knowledge constellation saved permanently to MongoDB!', 'success');
    } catch (err) {
      showToast('Failed to save graph changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-Layout constellation in concentric orbits
  const handleAutoLayout = () => {
    const centerX = 450;
    const centerY = 350;
    const updated = nodes.map((n, i) => {
      if (i === 0) return { ...n, position: { x: centerX, y: centerY } };
      const angle = (i / Math.max(1, nodes.length - 1)) * 2 * Math.PI;
      const radius = i % 2 === 0 ? 300 : 210;
      return {
        ...n,
        position: {
          x: Math.round(centerX + Math.cos(angle) * radius),
          y: Math.round(centerY + Math.sin(angle) * radius),
        },
      };
    });
    setNodes(updated);
    showToast('Auto-layout applied', 'info', 2000);
  };

  // Generate Knowledge Graph for Subject & Topic (Step 3)
  const handleGenerateGraph = async (e) => {
    e.preventDefault();

    const finalSubject = modalSubject === 'custom' ? customSubjectInput.trim() : modalSubject;
    const finalTopic = modalTopic === 'custom' ? customTopicInput.trim() : modalTopic;

    if (!finalSubject || !finalTopic) {
      showToast('Please provide both Subject and Topic', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await graphsAPI.generateForTopic({
        subjectName: finalSubject,
        topicName: finalTopic,
      });

      const newGraph = res.data.data.graph;
      // Prepend to graphs list
      setGraphs((prev) => [newGraph, ...prev.filter((g) => g._id !== newGraph._id)]);
      loadGraphIntoCanvas(newGraph);
      setShowCreateModal(false);

      const modeInfo = res.data.data.isDemoMode
        ? ' (Synthesized from Verified CS Knowledge Base)'
        : ' (AI Powered)';
      showToast(`Generated "${finalTopic}" knowledge graph${modeInfo}!`, 'success', 4000);
    } catch (err) {
      console.error('Graph generation error:', err);
      showToast(err.response?.data?.message || 'Failed to generate graph for topic', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete Graph
  const handleDeleteGraph = async (graphId, e) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this knowledge graph?')) return;

    try {
      await graphsAPI.delete(graphId);
      const remaining = graphs.filter((g) => g._id !== graphId);
      setGraphs(remaining);

      if (selectedGraph?._id === graphId) {
        if (remaining.length > 0) {
          loadGraphIntoCanvas(remaining[0]);
        } else {
          setSelectedGraph(null);
          setNodes([]);
          setEdges([]);
        }
      }
      showToast('Knowledge graph deleted', 'info');
    } catch (err) {
      showToast('Failed to delete graph', 'error');
    }
  };

  // Start Rename Graph
  const handleStartRename = (graph, e) => {
    e?.stopPropagation();
    setEditingGraphId(graph._id);
    setEditingTitleText(graph.title);
  };

  // Save Rename Graph
  const handleSaveRename = async (graphId, e) => {
    e?.stopPropagation();
    if (!editingTitleText.trim()) return;

    try {
      const res = await graphsAPI.update(graphId, { title: editingTitleText.trim() });
      const updated = res.data.data;
      setGraphs((prev) => prev.map((g) => (g._id === graphId ? updated : g)));
      if (selectedGraph?._id === graphId) {
        setSelectedGraph(updated);
      }
      setEditingGraphId(null);
      showToast('Graph title updated', 'success');
    } catch (err) {
      showToast('Failed to rename graph', 'error');
    }
  };

  // Filtered and searched nodes
  const displayNodes = useMemo(() => {
    return nodes.map((node) => {
      const matchCat = selectedCategory === 'all' || node.data?.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        (node.data?.name || node.data?.label || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const isDimmed = !matchCat || !matchSearch;

      return {
        ...node,
        style: {
          opacity: isDimmed ? 0.2 : 1,
          pointerEvents: isDimmed ? 'none' : 'all',
          transition: 'opacity 0.3s ease',
        },
      };
    });
  }, [nodes, selectedCategory, searchQuery]);

  // Current subject topics list helper
  const currentSubjectTopics = useMemo(() => {
    const activeSubj = modalSubject === 'custom' ? customSubjectInput : modalSubject;
    return topicsMap[activeSubj] || [];
  }, [modalSubject, customSubjectInput, topicsMap]);

  return (
    <div className="relative h-[calc(100vh-6.5rem)] rounded-3xl overflow-hidden border border-cosmic-border bg-slate-950 flex flex-col">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Active Graph Info, Quick Switch, Search */}
        <div className="flex items-center space-x-2.5 pointer-events-auto">
          {/* Active Graph Badge / Quick Switch */}
          <div className="relative">
            <select
              value={selectedGraph?._id || ''}
              onChange={(e) => handleSelectGraph(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-white shadow-xl focus:border-cosmic-violet outline-none backdrop-blur-xl cursor-pointer"
            >
              {graphs.length === 0 && <option value="">No Graphs Created</option>}
              {graphs.map((g) => (
                <option key={g._id} value={g._id} className="bg-slate-950 text-white">
                  {g.title} ({g.subjectId?.name || g.topic || 'General'})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Node Search Bar */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search concepts in universe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-500 shadow-xl focus:border-cosmic-violet outline-none backdrop-blur-xl w-52 transition-all focus:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right Action Tools: + Create Another Graph, Saved Graphs, Save, Layout */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* STEP 6: Prominent + Create Another Graph Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cosmic-indigo via-cosmic-violet to-cosmic-pink text-white shadow-cosmic-sm hover:opacity-95 transition-all flex items-center space-x-1.5 ring-1 ring-white/20"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Create Another Graph</span>
          </button>

          {/* STEP 5: Access Saved Graphs Drawer */}
          <button
            onClick={() => setShowSavedDrawer(true)}
            title="Browse all saved knowledge graphs"
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-xl transition-all flex items-center space-x-1.5"
          >
            <FolderKanban className="w-3.5 h-3.5 text-cosmic-cyan" />
            <span className="hidden sm:inline">Saved Graphs</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800 text-cosmic-cyan font-mono border border-slate-700">
              {graphs.length}
            </span>
          </button>

          {/* Manual Add Concept Node */}
          <button
            onClick={() => setShowAddNodeModal(true)}
            title="Manually create a single concept node"
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 shadow-xl transition-colors hidden sm:flex items-center space-x-1 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Add Node</span>
          </button>

          {/* Auto Layout */}
          <button
            onClick={handleAutoLayout}
            title="Auto-arrange nodes in cosmic concentric orbits"
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 shadow-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-cosmic-cyan" />
          </button>

          {/* STEP 4: Save Graph Option */}
          <button
            onClick={handleSaveGraph}
            disabled={isSaving || !selectedGraph}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-500/50 shadow-xl transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Graph'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-30 flex items-center space-x-1.5 max-w-[80%] overflow-x-auto p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-cosmic-violet text-white shadow-cosmic-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* React Flow Canvas / Empty State */}
      <div className="flex-1 w-full h-full relative">
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={displayNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={2.5}
            className="bg-[#030712]"
          >
            <Background color="#1E1B4B" gap={20} size={1.5} />
            <Controls position="top-right" style={{ top: '65px' }} />
            <MiniMap
              nodeColor={(n) => {
                const cat = n.data?.category;
                if (cat === 'main_topic') return '#8B5CF6';
                if (cat === 'formula') return '#10B981';
                if (cat === 'definition') return '#06B6D4';
                if (cat === 'prerequisite') return '#F43F5E';
                return '#6366F1';
              }}
              maskColor="rgba(3, 7, 18, 0.75)"
              style={{
                backgroundColor: '#0B0F19',
                border: '1px solid #1E293B',
                borderRadius: '12px',
              }}
              position="bottom-right"
            />
          </ReactFlow>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-cosmic-violet/20 border border-cosmic-violet/40 flex items-center justify-center mb-4 text-cosmic-violet shadow-cosmic-glow">
              <Compass className="w-8 h-8 animate-spin-slow" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Knowledge Graph</h3>
            <p className="text-slate-400 text-sm max-w-md mb-6">
              Select a computer science subject and topic to generate an interactive cosmic constellation.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-md hover:scale-105 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Another Graph</span>
            </button>
          </div>
        )}

        {/* Slide-out Node Detail Inspection Drawer */}
        {selectedNode && (
          <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </div>

      {/* MODAL: STEP 1, 2, 3 -> Subject & Topic Selection & Graph Generation */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl cosmic-panel rounded-3xl p-6 sm:p-8 border border-cosmic-border shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cosmic-violet/20 border border-cosmic-violet/40 flex items-center justify-center text-cosmic-violet">
                  <Orbit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Generate Knowledge Universe</h3>
                  <p className="text-xs text-slate-400">Step-by-step topic graph synthesis</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateGraph} className="mt-6 space-y-6">
              {/* STEP 1: Select Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cosmic-cyan mb-2">
                  Step 1: Select Subject
                </label>
                <select
                  value={modalSubject}
                  onChange={(e) => setModalSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:border-cosmic-violet outline-none"
                >
                  {CANONICAL_SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                  <option value="custom">✏️ Custom Subject (Enter below)</option>
                </select>

                {modalSubject === 'custom' && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Type custom subject name (e.g. Distributed Systems)..."
                      value={customSubjectInput}
                      onChange={(e) => setCustomSubjectInput(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-slate-900/90 border border-cosmic-violet/60 text-xs text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* STEP 2: Select Topic / Subtopic */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cosmic-cyan mb-2">
                  Step 2: Select Topic
                </label>

                {currentSubjectTopics.length > 0 && modalSubject !== 'custom' ? (
                  <>
                    <p className="text-xs text-slate-400 mb-2">
                      Popular topics for <span className="text-white font-semibold">{modalSubject}</span>:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {currentSubjectTopics.map((top) => (
                        <button
                          type="button"
                          key={top}
                          onClick={() => {
                            setModalTopic(top);
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all ${
                            modalTopic === top
                              ? 'bg-cosmic-violet/30 border-cosmic-violet text-white shadow-cosmic-sm'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          {top}
                        </button>
                      ))}
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setModalTopic('custom')}
                        className={`text-xs flex items-center space-x-1 font-medium ${
                          modalTopic === 'custom' ? 'text-cosmic-cyan font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>Or enter a custom topic...</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 mb-2">
                    Enter the specific topic or concept you would like to map for this subject.
                  </div>
                )}

                {(modalTopic === 'custom' || currentSubjectTopics.length === 0 || modalSubject === 'custom') && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      required
                      placeholder="e.g. TCP/IP Model, Normalization, Deadlocks, Closures..."
                      value={customTopicInput}
                      onChange={(e) => setCustomTopicInput(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-slate-900/90 border border-cosmic-violet/60 text-xs text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* STEP 3 Action: Generate Interactive Topic Graph */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cosmic-indigo via-cosmic-violet to-cosmic-cyan text-white shadow-cosmic-md hover:opacity-95 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Synthesizing Graph...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Knowledge Graph</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 5: Slide-out "My Saved Graphs" Drawer */}
      {showSavedDrawer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md h-full bg-slate-950 border-l border-cosmic-border p-6 flex flex-col shadow-2xl animate-slide-left">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <FolderKanban className="w-5 h-5 text-cosmic-cyan" />
                <h3 className="text-base font-bold text-white">My Saved Universes</h3>
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 font-mono">
                  {graphs.length}
                </span>
              </div>
              <button
                onClick={() => setShowSavedDrawer(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Graphs */}
            <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
              {graphs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No saved graphs found</p>
                  <button
                    onClick={() => {
                      setShowSavedDrawer(false);
                      setShowCreateModal(true);
                    }}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-cosmic-violet text-white"
                  >
                    Create Your First Graph
                  </button>
                </div>
              ) : (
                graphs.map((g) => {
                  const isCurrent = selectedGraph?._id === g._id;
                  const isEditing = editingGraphId === g._id;

                  return (
                    <div
                      key={g._id}
                      onClick={() => handleSelectGraph(g._id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                        isCurrent
                          ? 'bg-cosmic-violet/15 border-cosmic-violet/80 shadow-cosmic-sm'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        {isEditing ? (
                          <div className="flex-1 flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingTitleText}
                              onChange={(e) => setEditingTitleText(e.target.value)}
                              className="px-2 py-1 rounded bg-slate-800 text-xs text-white border border-cosmic-violet outline-none w-full"
                              autoFocus
                            />
                            <button
                              onClick={(e) => handleSaveRename(g._id, e)}
                              className="p-1 rounded text-emerald-400 hover:bg-slate-800"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingGraphId(null);
                              }}
                              className="p-1 rounded text-slate-400 hover:bg-slate-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-white group-hover:text-cosmic-cyan transition-colors line-clamp-1">
                              {g.title}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-1">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cosmic-violet/20 text-cosmic-violet border border-cosmic-violet/30">
                                {g.subjectId?.name || 'General Subject'}
                              </span>
                              {g.topic && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-950/40 text-cyan-300 border border-cyan-800/30">
                                  {g.topic}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(g.nodes || []).length} nodes
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Actions: Rename, Delete */}
                        {!isEditing && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => handleStartRename(g, e)}
                              title="Rename graph"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 opacity-60 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteGraph(g._id, e)}
                              title="Delete graph"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 opacity-60 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {isCurrent && (
                        <div className="mt-2 flex items-center text-[10px] text-cosmic-cyan font-semibold">
                          <Check className="w-3 h-3 mr-1" />
                          <span>Currently active on canvas</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom New Graph Action */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowSavedDrawer(false);
                  setShowCreateModal(true);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-sm hover:opacity-95 transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Another Graph</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Single Concept Node Manually */}
      {showAddNodeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md cosmic-panel rounded-3xl p-6 border border-cosmic-border shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cosmic-violet" />
                <span>Create Concept Node</span>
              </h3>
              <button
                onClick={() => setShowAddNodeModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Concept Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red-Black Tree Balancing"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cosmic-violet text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={newNodeCategory}
                  onChange={(e) => setNewNodeCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cosmic-violet text-xs text-white outline-none capitalize"
                >
                  <option value="main_topic">Main Topic</option>
                  <option value="subtopic">Subtopic</option>
                  <option value="definition">Definition</option>
                  <option value="formula">Formula</option>
                  <option value="example">Example</option>
                  <option value="prerequisite">Prerequisite</option>
                  <option value="advanced">Advanced Concept</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Definition & Summary</label>
                <textarea
                  rows="2"
                  placeholder="Concise explanation of this concept..."
                  value={newNodeDef}
                  onChange={(e) => setNewNodeDef(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cosmic-violet text-xs text-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Formula (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. T(n) = 2T(n/2) + O(n)"
                  value={newNodeFormula}
                  onChange={(e) => setNewNodeFormula(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cosmic-violet text-xs text-emerald-400 font-mono outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddNodeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-sm"
                >
                  Add Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversePage;
