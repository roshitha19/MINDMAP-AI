const KnowledgeGraph = require('../models/KnowledgeGraph');
const Concept = require('../models/Concept');
const Subject = require('../models/Subject');
const Mastery = require('../models/Mastery');
const RevisionSchedule = require('../models/RevisionSchedule');
const aiService = require('../services/aiService');
const { SUBJECT_TOPICS_MAP } = require('../services/knowledgeDomains');

// Helper to layout nodes in cosmic concentric orbits
const layoutCosmicNodes = (concepts, relationships) => {
  const nodes = [];
  const edges = [];
  const centerX = 450;
  const centerY = 350;

  const rootIndex = concepts.findIndex(c => c.category === 'main_topic');
  const actualRootIndex = rootIndex !== -1 ? rootIndex : 0;
  const conceptIdMap = new Map();

  concepts.forEach((concept, index) => {
    let x, y;

    if (index === actualRootIndex) {
      x = centerX;
      y = centerY;
    } else {
      const angle = ((index - (index > actualRootIndex ? 1 : 0)) / Math.max(1, concepts.length - 1)) * (2 * Math.PI);
      const orbitRadius = index % 2 === 0 ? 320 : 220;
      x = centerX + Math.cos(angle) * orbitRadius;
      y = centerY + Math.sin(angle) * orbitRadius;
    }

    const nodeId = `node-${index + 1}-${Date.now()}`;
    conceptIdMap.set(concept.name.toLowerCase(), nodeId);

    nodes.push({
      id: nodeId,
      type: 'cosmicNode',
      position: { x: Math.round(x), y: Math.round(y) },
      data: {
        label: concept.name,
        name: concept.name,
        category: concept.category || 'subtopic',
        definition: concept.definition || '',
        explanation: concept.explanation || '',
        formula: concept.formula || '',
        examples: concept.examples || [],
        masteryScore: concept.masteryScore || 10,
      },
    });
  });

  // Construct edges from relationships
  relationships.forEach((rel, idx) => {
    const sourceId = conceptIdMap.get((rel.source || '').toLowerCase());
    const targetId = conceptIdMap.get((rel.target || '').toLowerCase());

    if (sourceId && targetId && sourceId !== targetId) {
      edges.push({
        id: `edge-${idx + 1}-${Date.now()}`,
        source: sourceId,
        target: targetId,
        label: rel.relationType ? rel.relationType.replace(/_/g, ' ') : 'relates to',
        animated: true,
        style: { stroke: '#8B5CF6', strokeWidth: 2 },
      });
    }
  });

  // If no edges matched, connect root to all subtopics
  if (edges.length === 0 && nodes.length > 1) {
    const rootNode = nodes[actualRootIndex];
    nodes.forEach((node, idx) => {
      if (idx !== actualRootIndex) {
        edges.push({
          id: `edge-fallback-${idx}-${Date.now()}`,
          source: rootNode.id,
          target: node.id,
          label: 'subtopic of',
          animated: true,
          style: { stroke: '#6366F1', strokeWidth: 2 },
        });
      }
    });
  }

  return { nodes, edges };
};

// @desc    Get metadata map of subjects and topics
// @route   GET /api/graphs/meta/topics
// @access  Private
const getSubjectsAndTopicsMap = (req, res) => {
  res.status(200).json({
    success: true,
    data: SUBJECT_TOPICS_MAP,
  });
};

// @desc    Generate Knowledge Graph for a Subject & Topic
// @route   POST /api/graphs/generate-for-topic
// @access  Private
const generateGraphForTopic = async (req, res, next) => {
  try {
    const subjectName = req.body.subjectName || req.body.subject;
    const topicName = req.body.topicName || req.body.topic;
    const customPrompt = req.body.customPrompt;

    if (!subjectName || !topicName) {
      return res.status(400).json({ success: false, message: 'Please provide both Subject and Topic' });
    }

    // Find or create subject for user
    let subject = await Subject.findOne({ userId: req.user.id, name: subjectName });
    if (!subject) {
      subject = await Subject.create({
        userId: req.user.id,
        name: subjectName,
        description: `Knowledge domain covering ${subjectName} coursework and concepts.`,
        color: '#8B5CF6',
      });
    }

    // Call AI / Domain generator
    const genResult = await aiService.generateGraphForTopic({
      subjectName,
      topicName,
      customPrompt,
    });

    const { nodes, edges } = layoutCosmicNodes(genResult.concepts, genResult.relationships);

    // Persist Concepts in Database
    const savedConcepts = [];
    const nameToDocId = new Map();

    for (const item of genResult.concepts) {
      let concept = await Concept.findOne({
        userId: req.user.id,
        subjectId: subject._id,
        name: item.name,
      });

      if (!concept) {
        concept = await Concept.create({
          userId: req.user.id,
          subjectId: subject._id,
          name: item.name,
          category: item.category || 'subtopic',
          definition: item.definition || '',
          explanation: item.explanation || '',
          formula: item.formula || '',
          examples: item.examples || [],
        });

        await Mastery.create({
          userId: req.user.id,
          conceptId: concept._id,
          subjectId: subject._id,
          masteryScore: 0,
        });

        await RevisionSchedule.create({
          userId: req.user.id,
          conceptId: concept._id,
          subjectId: subject._id,
          intervalDays: 1,
          nextReviewDate: new Date(),
        });
      }

      savedConcepts.push(concept);
      nameToDocId.set(concept.name.toLowerCase(), concept._id);
    }

    // Inject conceptId into node data
    const finalNodes = nodes.map(node => {
      const matchId = nameToDocId.get((node.data.name || node.data.label || '').toLowerCase());
      return {
        ...node,
        data: {
          ...node.data,
          conceptId: matchId || null,
          subjectId: subject._id,
        },
      };
    });

    // Create Knowledge Graph
    const graphTitle = `${topicName} Universe`;
    const graph = await KnowledgeGraph.create({
      userId: req.user.id,
      subjectId: subject._id,
      topic: topicName,
      title: graphTitle,
      description: `Interactive knowledge graph for ${topicName} in ${subjectName}`,
      nodes: finalNodes,
      edges,
      isDefault: true,
    });

    res.status(201).json({
      success: true,
      message: `Knowledge graph generated for ${topicName}!`,
      data: {
        graph: await KnowledgeGraph.findById(graph._id).populate('subjectId', 'name color icon'),
        concepts: savedConcepts,
        aiProvider: genResult.aiProvider,
        isDemoMode: genResult.isDemoMode,
      },
    });
  } catch (err) {
    console.error('[Graph Generation Controller Error]:', err.stack || err.message);
    res.status(500).json({
      success: false,
      message: `Failed to generate graph for topic: ${err.message}`,
    });
  }
};

// @desc    Get all graphs for user
// @route   GET /api/graphs
// @access  Private
const getGraphs = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    const filter = { userId: req.user.id };
    if (subjectId) filter.subjectId = subjectId;

    const graphs = await KnowledgeGraph.find(filter)
      .populate('subjectId', 'name color icon')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: graphs.length,
      data: graphs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single graph by ID
// @route   GET /api/graphs/:id
// @access  Private
const getGraphById = async (req, res, next) => {
  try {
    const graph = await KnowledgeGraph.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('subjectId', 'name color icon');

    if (!graph) {
      return res.status(404).json({ success: false, message: 'Knowledge graph not found' });
    }

    res.status(200).json({
      success: true,
      data: graph,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new knowledge graph
// @route   POST /api/graphs
// @access  Private
const createGraph = async (req, res, next) => {
  try {
    const { subjectId, subjectName, topic, title, description, nodes, edges, viewport, isDefault } = req.body;

    let targetSubjectId = subjectId;
    if (!targetSubjectId && subjectName) {
      let subj = await Subject.findOne({ userId: req.user.id, name: subjectName });
      if (!subj) {
        subj = await Subject.create({
          userId: req.user.id,
          name: subjectName,
          description: `Subject domain for ${subjectName}`,
        });
      }
      targetSubjectId = subj._id;
    }

    if (!targetSubjectId || !title) {
      return res.status(400).json({ success: false, message: 'Subject and title are required' });
    }

    const graph = await KnowledgeGraph.create({
      userId: req.user.id,
      subjectId: targetSubjectId,
      topic: topic || '',
      title,
      description: description || '',
      nodes: nodes || [],
      edges: edges || [],
      viewport: viewport || { x: 0, y: 0, zoom: 1 },
      isDefault: isDefault || false,
    });

    res.status(201).json({
      success: true,
      message: 'Knowledge graph saved successfully',
      data: await KnowledgeGraph.findById(graph._id).populate('subjectId', 'name color icon'),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update graph (positions, nodes, edges, title, auto-save)
// @route   PUT /api/graphs/:id
// @access  Private
const updateGraph = async (req, res, next) => {
  try {
    let graph = await KnowledgeGraph.findOne({ _id: req.params.id, userId: req.user.id });
    if (!graph) {
      return res.status(404).json({ success: false, message: 'Knowledge graph not found' });
    }

    const { title, topic, description, nodes, edges, viewport, isDefault } = req.body;

    if (title) graph.title = title;
    if (topic !== undefined) graph.topic = topic;
    if (description !== undefined) graph.description = description;
    if (nodes) graph.nodes = nodes;
    if (edges) graph.edges = edges;
    if (viewport) graph.viewport = viewport;
    if (isDefault !== undefined) graph.isDefault = isDefault;

    await graph.save();

    res.status(200).json({
      success: true,
      message: 'Graph saved successfully in MongoDB',
      data: await KnowledgeGraph.findById(graph._id).populate('subjectId', 'name color icon'),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete graph
// @route   DELETE /api/graphs/:id
// @access  Private
const deleteGraph = async (req, res, next) => {
  try {
    const graph = await KnowledgeGraph.findOne({ _id: req.params.id, userId: req.user.id });
    if (!graph) {
      return res.status(404).json({ success: false, message: 'Knowledge graph not found' });
    }

    await graph.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Knowledge graph deleted',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSubjectsAndTopicsMap,
  generateGraphForTopic,
  getGraphs,
  getGraphById,
  createGraph,
  updateGraph,
  deleteGraph,
};
