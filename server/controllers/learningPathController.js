const LearningGoal = require('../models/LearningGoal');
const Concept = require('../models/Concept');

const PREBUILT_TEMPLATES = [
  {
    title: 'Full Stack Web Engineering',
    targetRole: 'Full Stack Developer',
    description: 'Master modern frontend architectures, distributed backend APIs, database management, and cloud deployment pipelines.',
    category: 'Web Architecture',
    stages: [
      {
        stageNumber: 1,
        title: 'Core Computing & JavaScript Invariants',
        description: 'Deep dive into event loop, asynchronous IO, DOM tree, and closure closures.',
        prerequisites: ['Basic Programming Logic'],
        requiredConcepts: [
          { name: 'JavaScript Event Loop & Microtasks', category: 'main_topic', isCompleted: true },
          { name: 'DOM Tree Rendering & Virtual DOM', category: 'subtopic', isCompleted: true },
          { name: 'Promises, Async/Await & Generator Flows', category: 'formula', isCompleted: false },
        ],
        isCompleted: false,
      },
      {
        stageNumber: 2,
        title: 'Frontend Component Hierarchies & State Machines',
        description: 'React architectural patterns, state trees, caching layers, and performance profiling.',
        prerequisites: ['Core Computing & JavaScript Invariants'],
        requiredConcepts: [
          { name: 'React Reconciliation & Fiber Tree', category: 'main_topic', isCompleted: false },
          { name: 'State Management & Context Invalidation', category: 'subtopic', isCompleted: false },
          { name: 'CSS Tailwind Grid & Glassmorphic Design', category: 'example', isCompleted: false },
        ],
        isCompleted: false,
      },
      {
        stageNumber: 3,
        title: 'Distributed REST & Database Modeling',
        description: 'Node.js runtime, MongoDB schema normalization vs indexing, and JWT authorization.',
        prerequisites: ['Frontend Component Hierarchies & State Machines'],
        requiredConcepts: [
          { name: 'Express Middleware & REST Constraints', category: 'main_topic', isCompleted: false },
          { name: 'MongoDB Indexing & Aggregation Pipelines', category: 'definition', isCompleted: false },
          { name: 'JWT Stateless Session & Cryptographic Hashing', category: 'formula', isCompleted: false },
        ],
        isCompleted: false,
      },
      {
        stageNumber: 4,
        title: 'Production CI/CD & Knowledge Graph Visualization',
        description: 'Containerization, reactive data flows, and interactive canvas rendering.',
        prerequisites: ['Distributed REST & Database Modeling'],
        requiredConcepts: [
          { name: 'React Flow Canvas Graph Orchestration', category: 'advanced', isCompleted: false },
          { name: 'Docker Containerization & Reverse Proxy', category: 'advanced', isCompleted: false },
        ],
        isCompleted: false,
      },
    ],
  },
  {
    title: 'Machine Learning & Cognitive Systems',
    targetRole: 'AI & ML Engineer',
    description: 'Foundations of mathematical optimization, neural layers, gradient descent, and LLM orchestration.',
    category: 'Artificial Intelligence',
    stages: [
      {
        stageNumber: 1,
        title: 'Mathematical Foundations & Linear Algebra',
        description: 'Vector spaces, matrix decomposition, eigenvalues, and multivariate calculus.',
        prerequisites: ['Calculus & Matrix Operations'],
        requiredConcepts: [
          { name: 'Matrix Factorization & Eigenvectors', category: 'formula', isCompleted: true },
          { name: 'Multivariate Partial Derivatives & Jacobians', category: 'formula', isCompleted: false },
        ],
        isCompleted: false,
      },
      {
        stageNumber: 2,
        title: 'Supervised Learning & Cost Functions',
        description: 'Loss formulation, regularization, and gradient descent variants.',
        prerequisites: ['Mathematical Foundations & Linear Algebra'],
        requiredConcepts: [
          { name: 'Gradient Descent & Learning Rate Dynamics', category: 'main_topic', isCompleted: false },
          { name: 'L1/L2 Regularization & Overfitting Minimization', category: 'subtopic', isCompleted: false },
        ],
        isCompleted: false,
      },
      {
        stageNumber: 3,
        title: 'Deep Neural Architectures & Transformers',
        description: 'Backpropagation, attention mechanisms, and fine-tuning.',
        prerequisites: ['Supervised Learning & Cost Functions'],
        requiredConcepts: [
          { name: 'Backpropagation & Chain Rule Activation', category: 'main_topic', isCompleted: false },
          { name: 'Self-Attention & Scaled Dot-Product Mechanisms', category: 'advanced', isCompleted: false },
        ],
        isCompleted: false,
      },
    ],
  },
  {
    title: 'Data Structures & Algorithmic Mastery',
    targetRole: 'Core Systems & Algorithms Engineer',
    description: 'Asymptotic complexity, balanced search trees, graph algorithms, and dynamic programming.',
    category: 'Computer Science Core',
    stages: [
      {
        stageNumber: 1,
        title: 'Asymptotic Bounds & Linear Structures',
        description: 'Big-O notation, amortized analysis, linked structures, and stacks.',
        prerequisites: ['Discrete Mathematics'],
        requiredConcepts: [
          { name: 'Big-O Asymptotic Complexity Bounds', category: 'formula', isCompleted: true },
          { name: 'Monotonic Stacks & Sliding Window Queues', category: 'subtopic', isCompleted: false },
        ],
        isCompleted: false,
      },
      {
        stageNumber: 2,
        title: 'Trees & Balanced Constellations',
        description: 'Binary search trees, AVL rotations, and red-black properties.',
        prerequisites: ['Asymptotic Bounds & Linear Structures'],
        requiredConcepts: [
          { name: 'Binary Search Tree Invariants', category: 'main_topic', isCompleted: false },
          { name: 'AVL Tree Self-Balancing Rotations', category: 'advanced', isCompleted: false },
        ],
        isCompleted: false,
      },
      {
        stageNumber: 3,
        title: 'Graphs & Dynamic Programming',
        description: 'Topological sort, shortest paths, and optimal substructure.',
        prerequisites: ['Trees & Balanced Constellations'],
        requiredConcepts: [
          { name: 'Graph BFS/DFS & Cycle Detection', category: 'main_topic', isCompleted: false },
          { name: 'Dynamic Programming Memoization vs Tabulation', category: 'advanced', isCompleted: false },
        ],
        isCompleted: false,
      },
    ],
  },
];

// @desc    Get user learning paths
// @route   GET /api/paths
// @access  Private
const getPaths = async (req, res, next) => {
  try {
    let paths = await LearningGoal.find({ userId: req.user.id }).sort({ createdAt: -1 });

    // If user has no paths yet, automatically clone the Full Stack roadmap for them
    if (paths.length === 0) {
      const defaultGoal = await LearningGoal.create({
        ...PREBUILT_TEMPLATES[0],
        userId: req.user.id,
        progressPercentage: 20,
      });
      paths = [defaultGoal];
    }

    res.status(200).json({
      success: true,
      data: paths,
      templates: PREBUILT_TEMPLATES,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get path by ID
// @route   GET /api/paths/:id
// @access  Private
const getPathById = async (req, res, next) => {
  try {
    const path = await LearningGoal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!path) {
      return res.status(404).json({ success: false, message: 'Learning path not found' });
    }

    res.status(200).json({
      success: true,
      data: path,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create learning path (from template or custom)
// @route   POST /api/paths
// @access  Private
const createPath = async (req, res, next) => {
  try {
    const { templateIndex, title, targetRole, description, category, stages } = req.body;

    let pathData;
    if (templateIndex !== undefined && PREBUILT_TEMPLATES[templateIndex]) {
      pathData = {
        ...PREBUILT_TEMPLATES[templateIndex],
        userId: req.user.id,
      };
    } else {
      pathData = {
        userId: req.user.id,
        title: title || 'Custom Learning Roadmap',
        targetRole: targetRole || 'Software Engineer',
        description: description || '',
        category: category || 'Custom',
        stages: stages || [],
      };
    }

    const path = await LearningGoal.create(pathData);

    res.status(201).json({
      success: true,
      data: path,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle concept milestone in learning path
// @route   PUT /api/paths/:id/toggle-concept
// @access  Private
const toggleMilestone = async (req, res, next) => {
  try {
    const { stageNumber, conceptName } = req.body;
    const path = await LearningGoal.findOne({ _id: req.params.id, userId: req.user.id });

    if (!path) {
      return res.status(404).json({ success: false, message: 'Learning path not found' });
    }

    let totalConcepts = 0;
    let completedConcepts = 0;

    path.stages.forEach(stage => {
      let stageAllDone = true;
      stage.requiredConcepts.forEach(c => {
        totalConcepts++;
        if (stage.stageNumber === stageNumber && c.name === conceptName) {
          c.isCompleted = !c.isCompleted;
        }
        if (c.isCompleted) {
          completedConcepts++;
        } else {
          stageAllDone = false;
        }
      });
      stage.isCompleted = stageAllDone;
    });

    path.progressPercentage = totalConcepts > 0 ? Math.round((completedConcepts / totalConcepts) * 100) : 0;
    await path.save();

    res.status(200).json({
      success: true,
      data: path,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPaths,
  getPathById,
  createPath,
  toggleMilestone,
};
