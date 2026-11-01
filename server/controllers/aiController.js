const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const aiService = require('../services/aiService');
const Subject = require('../models/Subject');
const Concept = require('../models/Concept');
const KnowledgeGraph = require('../models/KnowledgeGraph');
const Conversation = require('../models/Conversation');
const Mastery = require('../models/Mastery');
const RevisionSchedule = require('../models/RevisionSchedule');

// Helper to calculate cosmic radial / constellation coordinates for React Flow
const layoutCosmicNodes = (concepts, relationships) => {
  const nodes = [];
  const edges = [];
  const centerX = 450;
  const centerY = 350;

  // Find root or main topic
  const rootIndex = concepts.findIndex(c => c.category === 'main_topic');
  const actualRootIndex = rootIndex !== -1 ? rootIndex : 0;

  const conceptIdMap = new Map();

  concepts.forEach((concept, index) => {
    let x, y;

    if (index === actualRootIndex) {
      x = centerX;
      y = centerY;
    } else {
      // Position surrounding nodes in concentric orbits
      const angle = ((index - (index > actualRootIndex ? 1 : 0)) / (concepts.length - 1)) * (2 * Math.PI);
      const orbitRadius = index % 2 === 0 ? 300 : 220;
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

  // If no edges were matched, link root to all sub-nodes
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

// @desc    Extract concepts and graph structure from raw text or notes
// @route   POST /api/ai/extract-text
// @access  Private
const extractFromText = async (req, res, next) => {
  try {
    const { text, subjectId, subjectName } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide at least 10 characters of content' });
    }

    let resolvedSubjectName = subjectName;
    if (subjectId && !resolvedSubjectName) {
      const subject = await Subject.findById(subjectId);
      if (subject) resolvedSubjectName = subject.name;
    }

    const extractionResult = await aiService.extractConceptsAndGraph(text, resolvedSubjectName || 'Computer Science');
    const { nodes, edges } = layoutCosmicNodes(extractionResult.concepts, extractionResult.relationships);

    res.status(200).json({
      success: true,
      data: {
        concepts: extractionResult.concepts,
        relationships: extractionResult.relationships,
        previewGraph: { nodes, edges },
        aiProvider: extractionResult.aiProvider,
        isDemoMode: extractionResult.isDemoMode,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Extract concepts from uploaded file (PDF, DOCX, TXT)
// @route   POST /api/ai/extract-file
// @access  Private
const extractFromFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const filePath = req.file.path;
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();
    let extractedText = '';

    if (fileExt === 'pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (fileExt === 'docx') {
      const docxResult = await mammoth.extractRawText({ path: filePath });
      extractedText = docxResult.value;
    } else {
      // txt or markdown
      extractedText = fs.readFileSync(filePath, 'utf-8');
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Could not extract sufficient text from file' });
    }

    const subjectName = req.body.subjectName || req.file.originalname.replace(/\.[^/.]+$/, '');
    const extractionResult = await aiService.extractConceptsAndGraph(extractedText, subjectName);
    const { nodes, edges } = layoutCosmicNodes(extractionResult.concepts, extractionResult.relationships);

    res.status(200).json({
      success: true,
      fileName: req.file.originalname,
      extractedSnippet: extractedText.substring(0, 300) + '...',
      data: {
        concepts: extractionResult.concepts,
        relationships: extractionResult.relationships,
        previewGraph: { nodes, edges },
        aiProvider: extractionResult.aiProvider,
        isDemoMode: extractionResult.isDemoMode,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Confirm and save extracted concepts and graph to user universe
// @route   POST /api/ai/save-generated-graph
// @access  Private
const saveGeneratedGraph = async (req, res, next) => {
  try {
    const { subjectId, subjectName, graphTitle, concepts, previewGraph } = req.body;

    let targetSubjectId = subjectId;

    // Create subject if not existing
    if (!targetSubjectId && subjectName) {
      const newSubject = await Subject.create({
        userId: req.user.id,
        name: subjectName,
        description: `Knowledge domain created via AI extraction for ${subjectName}`,
      });
      targetSubjectId = newSubject._id;
    }

    if (!targetSubjectId) {
      return res.status(400).json({ success: false, message: 'Subject ID or Name is required' });
    }

    // Persist Concepts in Database
    const savedConcepts = [];
    const nameToDocId = new Map();

    for (const item of concepts) {
      let concept = await Concept.findOne({
        userId: req.user.id,
        subjectId: targetSubjectId,
        name: item.name,
      });

      if (!concept) {
        concept = await Concept.create({
          userId: req.user.id,
          subjectId: targetSubjectId,
          name: item.name,
          category: item.category || 'subtopic',
          definition: item.definition || '',
          explanation: item.explanation || '',
          formula: item.formula || '',
          examples: item.examples || [],
        });

        // Initialize tracking
        await Mastery.create({
          userId: req.user.id,
          conceptId: concept._id,
          subjectId: targetSubjectId,
          masteryScore: 0,
        });

        await RevisionSchedule.create({
          userId: req.user.id,
          conceptId: concept._id,
          subjectId: targetSubjectId,
          intervalDays: 1,
          nextReviewDate: new Date(),
        });
      }

      savedConcepts.push(concept);
      nameToDocId.set(concept.name.toLowerCase(), concept._id);
    }

    // Update nodes with conceptId reference
    const updatedNodes = previewGraph.nodes.map(node => {
      const matchId = nameToDocId.get((node.data.name || node.data.label || '').toLowerCase());
      return {
        ...node,
        data: {
          ...node.data,
          conceptId: matchId || null,
          subjectId: targetSubjectId,
        },
      };
    });

    // Create Knowledge Graph
    const graph = await KnowledgeGraph.create({
      userId: req.user.id,
      subjectId: targetSubjectId,
      title: graphTitle || `${subjectName || 'Knowledge'} Universe`,
      description: `AI-synthesized knowledge constellation containing ${savedConcepts.length} concepts`,
      nodes: updatedNodes,
      edges: previewGraph.edges,
      isDefault: true,
    });

    res.status(201).json({
      success: true,
      message: 'Knowledge universe created and persisted!',
      data: {
        graph,
        conceptCount: savedConcepts.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Chat with AI Tutor
// @route   POST /api/ai/tutor-chat
// @access  Private
const tutorChat = async (req, res, next) => {
  try {
    const { conversationId, message, subjectId, conceptId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId: req.user.id });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        userId: req.user.id,
        subjectId: subjectId || null,
        conceptId: conceptId || null,
        title: message.substring(0, 40) + '...',
        messages: [],
      });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    let subjectContext = '';
    let conceptContext = '';

    if (subjectId) {
      const s = await Subject.findById(subjectId);
      if (s) subjectContext = s.name;
    }
    if (conceptId) {
      const c = await Concept.findById(conceptId);
      if (c) conceptContext = c.name;
    }

    // Generate AI response
    const tutorResult = await aiService.chatWithTutor({
      messages: conversation.messages,
      subjectContext,
      conceptContext,
    });

    // Add assistant reply
    conversation.messages.push({
      role: 'assistant',
      content: tutorResult.reply,
      timestamp: new Date(),
      metadata: {
        aiProvider: tutorResult.aiProvider,
        isDemoMode: tutorResult.isDemoMode,
      },
    });

    await conversation.save();

    res.status(200).json({
      success: true,
      data: {
        conversationId: conversation._id,
        reply: tutorResult.reply,
        aiProvider: tutorResult.aiProvider,
        isDemoMode: tutorResult.isDemoMode,
        messages: conversation.messages,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user chat conversations
// @route   GET /api/ai/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.id })
      .populate('subjectId', 'name')
      .populate('conceptId', 'name')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete conversation
// @route   DELETE /api/ai/conversations/:id
// @access  Private
const deleteConversation = async (req, res, next) => {
  try {
    const conv = await Conversation.findOne({ _id: req.params.id, userId: req.user.id });
    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    await conv.deleteOne();
    res.status(200).json({ success: true, message: 'Conversation deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  extractFromText,
  extractFromFile,
  saveGeneratedGraph,
  tutorChat,
  getConversations,
  deleteConversation,
};
