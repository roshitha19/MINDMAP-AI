require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Concept = require('../models/Concept');
const KnowledgeGraph = require('../models/KnowledgeGraph');
const Relationship = require('../models/Relationship');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Mastery = require('../models/Mastery');
const RevisionSchedule = require('../models/RevisionSchedule');
const LearningGoal = require('../models/LearningGoal');
const Resource = require('../models/Resource');
const Achievement = require('../models/Achievement');
const Notification = require('../models/Notification');
const StudySession = require('../models/StudySession');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindmap_ai';
    await mongoose.connect(mongoUri);
    console.log('🌌 [Seeder]: Connected to MongoDB...');

    // Clean existing demo user data
    const demoEmail = 'demo@mindmap.ai';
    const existingUser = await User.findOne({ email: demoEmail });
    if (existingUser) {
      const uId = existingUser._id;
      await Subject.deleteMany({ userId: uId });
      await Concept.deleteMany({ userId: uId });
      await KnowledgeGraph.deleteMany({ userId: uId });
      await Relationship.deleteMany({ userId: uId });
      await Quiz.deleteMany({ userId: uId });
      await QuizAttempt.deleteMany({ userId: uId });
      await Mastery.deleteMany({ userId: uId });
      await RevisionSchedule.deleteMany({ userId: uId });
      await LearningGoal.deleteMany({ userId: uId });
      await Resource.deleteMany({ userId: uId });
      await Achievement.deleteMany({ userId: uId });
      await Notification.deleteMany({ userId: uId });
      await StudySession.deleteMany({ userId: uId });
      await User.deleteOne({ _id: uId });
      console.log('🧹 [Seeder]: Cleared previous demo user data');
    }

    // 1. Create Demo User
    const user = await User.create({
      name: 'Alex Rivera',
      email: demoEmail,
      password: 'Mindmap@2026',
      avatar: 'cosmic-avatar-1',
      bio: '3rd Year Computer Science & Engineering | Quantum & Graph AI Enthusiast',
      isVerified: true,
      xp: 1450,
      level: 4,
      streak: 7,
      learningInterests: ['Data Structures', 'Operating Systems', 'Machine Learning', 'Distributed Systems'],
      learningGoals: ['Crack FAANG Interviews', 'Build Production AI Systems'],
    });
    console.log(`👤 [Seeder]: Created Demo User: ${user.email} (Password: Mindmap@2026)`);

    // 2. Create Subjects
    const dsaSubject = await Subject.create({
      userId: user._id,
      name: 'Data Structures & Algorithms',
      code: 'CS301',
      description: 'Asymptotic complexity, balanced search trees, graph traversals, and dynamic programming.',
      color: '#8B5CF6',
      icon: 'Binary',
      semester: 'Semester 5',
      tags: ['Algorithms', 'Trees', 'Graphs'],
    });

    const osSubject = await Subject.create({
      userId: user._id,
      name: 'Operating Systems',
      code: 'CS302',
      description: 'Kernel architecture, CPU scheduling, virtual memory, paging, and concurrency primitives.',
      color: '#06B6D4',
      icon: 'Cpu',
      semester: 'Semester 5',
      tags: ['Kernel', 'Concurrency', 'Memory'],
    });

    const mlSubject = await Subject.create({
      userId: user._id,
      name: 'Machine Learning Fundamentals',
      code: 'CS305',
      description: 'Supervised learning, gradient descent optimization, loss functions, and neural layers.',
      color: '#10B981',
      icon: 'Sparkles',
      semester: 'Semester 6',
      tags: ['AI', 'Neural Networks', 'Math'],
    });

    console.log('📚 [Seeder]: Created 3 Core Academic Subjects');

    // 3. Create Concepts for DSA
    const bst = await Concept.create({
      userId: user._id,
      subjectId: dsaSubject._id,
      name: 'Binary Search Tree (BST)',
      category: 'main_topic',
      definition: 'A node-based binary tree data structure where each node has at most two children, maintaining the invariant that left < root < right.',
      explanation: 'Provides logarithmic search, insertion, and deletion on average. In degenerate skew cases, degrades to O(n) linear performance.',
      formula: 'T_{avg}(n) = O(\\log n), \\quad T_{worst}(n) = O(n)',
      examples: ['Dictionary lookup keys', 'Ordered priority queues', 'Expression tree parsing'],
      masteryScore: 92,
      reviewCount: 6,
      lastReviewed: new Date(),
    });

    const avl = await Concept.create({
      userId: user._id,
      subjectId: dsaSubject._id,
      name: 'AVL Tree Self-Balancing',
      category: 'advanced',
      definition: 'A height-balanced binary search tree where the difference between heights of left and right subtrees cannot exceed 1 for any node.',
      explanation: 'Maintains balance using LL, RR, LR, and RL rotations immediately upon insertion or deletion.',
      formula: 'BalanceFactor(N) = Height(LeftSubtree) - Height(RightSubtree) \\in \\{-1, 0, 1\\}',
      examples: ['High-frequency read-heavy database indexing'],
      prerequisites: [bst._id],
      masteryScore: 85,
      reviewCount: 4,
      lastReviewed: new Date(),
    });

    const heap = await Concept.create({
      userId: user._id,
      subjectId: dsaSubject._id,
      name: 'Binary Heap & Priority Queue',
      category: 'subtopic',
      definition: 'A complete binary tree that satisfies the heap-order property (Max-Heap or Min-Heap).',
      explanation: 'Enables constant-time retrieval of the minimum or maximum element and logarithmic insertion/deletion via sift-up and sift-down.',
      formula: 'Parent(i) = \\lfloor \\frac{i-1}{2} \\rfloor, \\quad Left(i) = 2i + 1',
      examples: ["Dijkstra's Shortest Path Algorithm", "Huffman Coding", "Heap Sort"],
      prerequisites: [bst._id],
      masteryScore: 78,
      reviewCount: 3,
      lastReviewed: new Date(),
    });

    const dp = await Concept.create({
      userId: user._id,
      subjectId: dsaSubject._id,
      name: 'Dynamic Programming',
      category: 'definition',
      definition: 'An algorithmic technique that solves complex problems by breaking them into overlapping subproblems and storing intermediate solutions.',
      explanation: 'Requires two key properties: Optimal Substructure and Overlapping Subproblems. Implemented via Memoization (top-down) or Tabulation (bottom-up).',
      formula: 'OPT(i) = \\max(OPT(i-1), OPT(i-w) + v_i)',
      examples: ['0/1 Knapsack Problem', 'Longest Common Subsequence (LCS)', 'Floyd-Warshall'],
      masteryScore: 68,
      reviewCount: 2,
      lastReviewed: new Date(),
    });

    const bigO = await Concept.create({
      userId: user._id,
      subjectId: dsaSubject._id,
      name: 'Big-O Asymptotic Notation',
      category: 'prerequisite',
      definition: 'A mathematical notation that describes the limiting behavior of a function when the argument tends towards infinity.',
      explanation: 'Characterizes functions according to their growth rates, giving an upper bound on time or space complexity.',
      formula: 'f(n) = O(g(n)) \\iff \\exists c > 0, n_0 > 0 : 0 \\le f(n) \\le c \\cdot g(n) \\; \\forall n \\ge n_0',
      examples: ['Linear search O(n)', 'Binary search O(log n)', 'Merge sort O(n log n)'],
      masteryScore: 95,
      reviewCount: 8,
      lastReviewed: new Date(),
    });

    // 4. Create Concepts for OS
    const virtMem = await Concept.create({
      userId: user._id,
      subjectId: osSubject._id,
      name: 'Virtual Memory & Paging',
      category: 'main_topic',
      definition: 'A memory management capability that provides an idealized abstraction of storage resources that are actually physically fragmented.',
      explanation: 'Uses a Memory Management Unit (MMU) and Page Tables to translate Virtual Addresses to Physical Addresses, backed by secondary storage swapping.',
      formula: 'Virtual Address = Page Number (p) \\; || \\; Offset (d)',
      examples: ['Linux kernel demand paging', 'Page fault trap handling', 'TLB translation caching'],
      masteryScore: 88,
      reviewCount: 5,
      lastReviewed: new Date(),
    });

    const deadlock = await Concept.create({
      userId: user._id,
      subjectId: osSubject._id,
      name: 'Deadlock & Coffman Conditions',
      category: 'definition',
      definition: 'A state in which each process in a set is blocked waiting for an event that only another process in the set can cause.',
      explanation: 'Requires all four Coffman conditions simultaneously: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
      formula: 'Deadlock \\iff \\text{MutualExclusion} \\land \\text{Hold\\&Wait} \\land \\text{NoPreemption} \\land \\text{CircularWait}',
      examples: ["Dining Philosophers Problem", "Banker's Algorithm resource allocation"],
      masteryScore: 72,
      reviewCount: 3,
      lastReviewed: new Date(),
    });

    console.log('💡 [Seeder]: Created 7 Detailed Academic Concepts');

    // 5. Create Mastery & Revision Schedules
    const concepts = [bst, avl, heap, dp, bigO, virtMem, deadlock];
    for (const c of concepts) {
      await Mastery.create({
        userId: user._id,
        conceptId: c._id,
        subjectId: c.subjectId,
        masteryScore: c.masteryScore,
        quizAttemptsCount: 4,
        quizCorrectCount: Math.round((c.masteryScore / 100) * 4),
        accuracyRate: c.masteryScore,
        revisionCount: c.reviewCount,
        lastQuizDate: new Date(),
        lastRevisionDate: new Date(),
        status: c.masteryScore >= 80 ? 'strong' : c.masteryScore >= 50 ? 'moderate' : 'weak',
      });

      await RevisionSchedule.create({
        userId: user._id,
        conceptId: c._id,
        subjectId: c.subjectId,
        intervalDays: c.masteryScore > 80 ? 6 : 2,
        repetitions: c.reviewCount,
        easeFactor: 2.5,
        nextReviewDate: c.masteryScore < 75 ? new Date() : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        lastReviewDate: new Date(),
        history: [
          { rating: 'good', reviewDate: new Date(), newInterval: 4, newEaseFactor: 2.5 },
        ],
      });
    }

    // 6. Create Interactive React Flow Knowledge Graph for DSA
    const dsaNodes = [
      {
        id: 'node-bst',
        type: 'cosmicNode',
        position: { x: 420, y: 260 },
        data: {
          conceptId: bst._id,
          name: bst.name,
          label: bst.name,
          category: 'main_topic',
          definition: bst.definition,
          explanation: bst.explanation,
          formula: bst.formula,
          examples: bst.examples,
          masteryScore: bst.masteryScore,
        },
      },
      {
        id: 'node-bigo',
        type: 'cosmicNode',
        position: { x: 120, y: 260 },
        data: {
          conceptId: bigO._id,
          name: bigO.name,
          label: bigO.name,
          category: 'prerequisite',
          definition: bigO.definition,
          explanation: bigO.explanation,
          formula: bigO.formula,
          examples: bigO.examples,
          masteryScore: bigO.masteryScore,
        },
      },
      {
        id: 'node-avl',
        type: 'cosmicNode',
        position: { x: 720, y: 150 },
        data: {
          conceptId: avl._id,
          name: avl.name,
          label: avl.name,
          category: 'advanced',
          definition: avl.definition,
          explanation: avl.explanation,
          formula: avl.formula,
          examples: avl.examples,
          masteryScore: avl.masteryScore,
        },
      },
      {
        id: 'node-heap',
        type: 'cosmicNode',
        position: { x: 720, y: 380 },
        data: {
          conceptId: heap._id,
          name: heap.name,
          label: heap.name,
          category: 'subtopic',
          definition: heap.definition,
          explanation: heap.explanation,
          formula: heap.formula,
          examples: heap.examples,
          masteryScore: heap.masteryScore,
        },
      },
      {
        id: 'node-dp',
        type: 'cosmicNode',
        position: { x: 420, y: 520 },
        data: {
          conceptId: dp._id,
          name: dp.name,
          label: dp.name,
          category: 'definition',
          definition: dp.definition,
          explanation: dp.explanation,
          formula: dp.formula,
          examples: dp.examples,
          masteryScore: dp.masteryScore,
        },
      },
    ];

    const dsaEdges = [
      {
        id: 'edge-bigo-bst',
        source: 'node-bigo',
        target: 'node-bst',
        label: 'prerequisite for',
        animated: true,
        style: { stroke: '#EC4899', strokeWidth: 2 },
      },
      {
        id: 'edge-bst-avl',
        source: 'node-bst',
        target: 'node-avl',
        label: 'balances into',
        animated: true,
        style: { stroke: '#A855F7', strokeWidth: 2 },
      },
      {
        id: 'edge-bst-heap',
        source: 'node-bst',
        target: 'node-heap',
        label: 'shares tree topology',
        animated: true,
        style: { stroke: '#6366F1', strokeWidth: 2 },
      },
      {
        id: 'edge-bst-dp',
        source: 'node-bst',
        target: 'node-dp',
        label: 'subproblem decomposition',
        animated: true,
        style: { stroke: '#06B6D4', strokeWidth: 2 },
      },
    ];

    await KnowledgeGraph.create({
      userId: user._id,
      subjectId: dsaSubject._id,
      title: 'Data Structures & Algorithms Constellation',
      description: 'Foundational binary search trees, self-balancing rotations, priority queues, and dynamic programming.',
      nodes: dsaNodes,
      edges: dsaEdges,
      isDefault: true,
    });

    console.log('🌌 [Seeder]: Created React Flow Knowledge Universe for DSA');

    // 7. Create Sample Quiz & Attempt (10 Questions Standard)
    const dsaQuiz = await Quiz.create({
      userId: user._id,
      subjectId: dsaSubject._id,
      conceptIds: [bst._id, avl._id, heap._id, dp._id, bigO._id],
      title: 'Data Structures & Algorithms Comprehensive Assessment',
      difficulty: 'intermediate',
      timeLimitMinutes: 15,
      questions: [
        {
          question: 'What is the maximum allowable height difference between subtrees in an AVL tree node?',
          options: ['0', '1', '2', 'log(n)'],
          correctAnswerIndex: 1,
          explanation: 'In an AVL tree, the Balance Factor of any node is defined as Height(Left) - Height(Right) and must belong to {-1, 0, 1}.',
          conceptId: avl._id,
        },
        {
          question: 'What is the worst-case time complexity of searching in an unbalanced Binary Search Tree?',
          options: ['O(log n)', 'O(1)', 'O(n)', 'O(n log n)'],
          correctAnswerIndex: 2,
          explanation: 'In a skewed degenerate BST (e.g. inserting elements in sorted order), the tree degenerates into a singly linked list, resulting in O(n) search time.',
          conceptId: bst._id,
        },
        {
          question: 'In a 0-indexed binary array representation of a heap, what is the index of the left child of node i?',
          options: ['2i', '2i + 1', '2i + 2', 'i / 2'],
          correctAnswerIndex: 1,
          explanation: 'In a 0-indexed array, the left child of index i is located at 2i + 1, and the right child at 2i + 2.',
          conceptId: heap._id,
        },
        {
          question: 'Which two key properties characterize problems solvable using Dynamic Programming?',
          options: [
            'Greedy choice and linear independence',
            'Optimal substructure and overlapping subproblems',
            'Divide and conquer without memoization',
            'Deterministic finite automata and pumping lemma',
          ],
          correctAnswerIndex: 1,
          explanation: 'Dynamic programming requires optimal substructure (optimal solution contains optimal sub-solutions) and overlapping subproblems (subproblems recur multiple times).',
          conceptId: dp._id,
        },
        {
          question: 'What is the time complexity of building a binary heap of n elements bottom-up using Floyds algorithm?',
          options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'],
          correctAnswerIndex: 1,
          explanation: 'Building a heap bottom-up with heapify takes linear O(n) time due to the converging sum of heights.',
          conceptId: heap._id,
        },
        {
          question: 'Which traversal order on a Binary Search Tree produces node values in strictly non-decreasing sorted order?',
          options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
          correctAnswerIndex: 1,
          explanation: 'An in-order traversal (Left, Root, Right) of a valid BST visits keys in strictly ascending order.',
          conceptId: bst._id,
        },
        {
          question: 'What is the worst-case time complexity of standard QuickSort without random pivot selection?',
          options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'],
          correctAnswerIndex: 2,
          explanation: 'When the chosen pivot is always the smallest or largest element (such as in an already sorted array), partitioning is maximally unbalanced, degrading time complexity to O(n^2).',
          conceptId: bigO._id,
        },
        {
          question: 'In an AVL tree, what rotation combination restores balance for a Right-Left (RL) heavy violation?',
          options: [
            'Single Left Rotation',
            'Single Right Rotation',
            'Right Rotation on right child, then Left Rotation on parent',
            'Left Rotation on left child, then Right Rotation on parent',
          ],
          correctAnswerIndex: 2,
          explanation: 'A Right-Left (RL) imbalance is resolved by a double rotation: first a Right rotation on the right child, followed by a Left rotation on the parent node.',
          conceptId: avl._id,
        },
        {
          question: 'Which algorithmic paradigm does Dijkstras Single Source Shortest Path algorithm utilize?',
          options: ['Greedy Method', 'Dynamic Programming', 'Backtracking', 'Branch and Bound'],
          correctAnswerIndex: 0,
          explanation: 'Dijkstras algorithm is a classic greedy algorithm that picks the unvisited vertex with the minimum known distance at each iteration.',
          conceptId: bigO._id,
        },
        {
          question: 'What is the worst-case auxiliary space complexity of recursive Depth-First Search (DFS) on a tree of N nodes?',
          options: ['O(1)', 'O(N) due to recursion stack', 'O(N^2)', 'O(log N) guaranteed'],
          correctAnswerIndex: 1,
          explanation: 'In the worst case (a degenerate linear tree or chain), the recursion stack reaches depth N, requiring O(N) auxiliary space.',
          conceptId: bigO._id,
        },
      ],
    });

    await QuizAttempt.create({
      userId: user._id,
      quizId: dsaQuiz._id,
      score: 9,
      totalQuestions: 10,
      percentage: 90,
      xpEarned: 100,
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      answers: [
        { questionIndex: 0, selectedOption: 1, isCorrect: true, conceptId: avl._id },
        { questionIndex: 1, selectedOption: 2, isCorrect: true, conceptId: bst._id },
        { questionIndex: 2, selectedOption: 1, isCorrect: true, conceptId: heap._id },
        { questionIndex: 3, selectedOption: 1, isCorrect: true, conceptId: dp._id },
        { questionIndex: 4, selectedOption: 1, isCorrect: true, conceptId: heap._id },
        { questionIndex: 5, selectedOption: 1, isCorrect: true, conceptId: bst._id },
        { questionIndex: 6, selectedOption: 2, isCorrect: true, conceptId: bigO._id },
        { questionIndex: 7, selectedOption: 2, isCorrect: true, conceptId: avl._id },
        { questionIndex: 8, selectedOption: 0, isCorrect: true, conceptId: bigO._id },
        { questionIndex: 9, selectedOption: 1, isCorrect: true, conceptId: bigO._id },
      ],
    });

    // 8. Create Learning Goal Roadmap
    await LearningGoal.create({
      userId: user._id,
      title: 'Full Stack Systems & AI Architecture',
      targetRole: 'Full Stack AI Engineer',
      description: 'Master frontend state graphs, distributed APIs, database normalization, and neural layer integration.',
      category: 'Software Engineering',
      progressPercentage: 45,
      stages: [
        {
          stageNumber: 1,
          title: 'Core Asymptotics & Data Invariants',
          description: 'Big-O bounds, memory layouts, and pointer traversal.',
          prerequisites: ['Basic Discrete Math'],
          requiredConcepts: [
            { name: 'Big-O Asymptotic Notation', category: 'formula', isCompleted: true },
            { name: 'Binary Search Tree (BST)', category: 'main_topic', isCompleted: true },
          ],
          isCompleted: true,
        },
        {
          stageNumber: 2,
          title: 'Memory Virtualization & Concurrency Primitives',
          description: 'Kernel scheduling, page translation, and lock-free invariants.',
          prerequisites: ['Core Asymptotics & Data Invariants'],
          requiredConcepts: [
            { name: 'Virtual Memory & Paging', category: 'main_topic', isCompleted: true },
            { name: 'Deadlock & Coffman Conditions', category: 'definition', isCompleted: false },
          ],
          isCompleted: false,
        },
        {
          stageNumber: 3,
          title: 'Distributed Knowledge Graphs & Real-Time Sync',
          description: 'Canvas orchestration, graph databases, and web worker pipelines.',
          prerequisites: ['Memory Virtualization & Concurrency Primitives'],
          requiredConcepts: [
            { name: 'React Flow State Engine', category: 'advanced', isCompleted: false },
            { name: 'Vector Space Embeddings', category: 'advanced', isCompleted: false },
          ],
          isCompleted: false,
        },
      ],
    });

    // 9. Create Resources
    await Resource.create({
      userId: user._id,
      subjectId: dsaSubject._id,
      conceptId: avl._id,
      title: 'AVL Tree Rotation Proof & Balancing Invariants.md',
      type: 'note',
      contentText: `# AVL Tree Balancing Formal Invariants
      
An AVL tree is a strictly height-balanced Binary Search Tree.
Let $h(v)$ be the height of node $v$. The balance factor is defined as:
$$BF(v) = h(v.left) - h(v.right) \\in \\{-1, 0, 1\\}$$

When an insertion causes $|BF(v)| = 2$, we execute four canonical rotation types:
1. **Left-Left (LL)**: Single Right Rotation on $v$.
2. **Right-Right (RR)**: Single Left Rotation on $v$.
3. **Left-Right (LR)**: Double rotation: Left rotation on $v.left$, followed by Right rotation on $v$.
4. **Right-Left (RL)**: Double rotation: Right rotation on $v.right$, followed by Left rotation on $v$.

### Theorem
An AVL tree with $n$ nodes has height:
$$h < 1.44 \\log_2(n + 2) - 0.328 = O(\\log n)$$
`,
      tags: ['AVL', 'Trees', 'Rotations'],
    });

    // 10. Study Sessions
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      await StudySession.create({
        userId: user._id,
        subjectId: i % 2 === 0 ? dsaSubject._id : osSubject._id,
        durationMinutes: 30 + (i * 5),
        activityType: i % 3 === 0 ? 'graph_exploration' : i % 2 === 0 ? 'quiz' : 'revision',
        timestamp: d,
      });
    }

    // 11. Achievements
    const badges = [
      { badgeId: 'first_galaxy', title: 'First Galaxy', description: 'Created first interactive knowledge graph.', icon: 'Compass', target: 1, progress: 1, unlocked: true, unlockedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { badgeId: 'brain_builder', title: 'Brain Builder', description: 'Added 15 atomic concepts across your universe.', icon: 'Layers', target: 15, progress: 7, unlocked: false },
      { badgeId: 'consistency_streak', title: 'Cosmic Momentum', description: 'Maintained an active 7-day learning streak.', icon: 'Flame', target: 7, progress: 7, unlocked: true, unlockedAt: new Date() },
      { badgeId: 'quiz_whiz', title: 'Quiz Prodigy', description: 'Completed first knowledge assessment with 100% score.', icon: 'Sparkles', target: 1, progress: 1, unlocked: true, unlockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    ];

    for (const b of badges) {
      await Achievement.create({
        userId: user._id,
        ...b,
      });
    }

    // 12. Notifications
    await Notification.create({
      userId: user._id,
      title: '🌟 Welcome to MINDMAP AI!',
      message: 'Your personal knowledge universe has been materialized with B.Tech CSE coursework.',
      type: 'system',
      read: false,
    });
    await Notification.create({
      userId: user._id,
      title: '🔥 7-Day Cosmic Streak Unlocked!',
      message: 'You have maintained your learning momentum for 7 consecutive days.',
      type: 'streak',
      read: false,
    });
    await Notification.create({
      userId: user._id,
      title: '🧠 Spaced Revision Due',
      message: '2 concepts are scheduled for review today in your Revision Center.',
      type: 'revision',
      read: false,
    });

    console.log('🎉 [Seeder]: Academic Demo Universe Successfully Seeded!');
    console.log('---------------------------------------------------------');
    console.log('Login Email: demo@mindmap.ai');
    console.log('Password:    Mindmap@2026');
    console.log('---------------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('❌ [Seeder Error]:', err);
    process.exit(1);
  }
};

seedData();
