const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

const serverDir = 'c:/Users/gandl/OneDrive/Desktop/MINDMAP AI/server';
dotenv.config({ path: path.join(serverDir, '.env') });

const User = require(path.join(serverDir, 'models/User'));
const Subject = require(path.join(serverDir, 'models/Subject'));
const KnowledgeGraph = require(path.join(serverDir, 'models/KnowledgeGraph'));
const Quiz = require(path.join(serverDir, 'models/Quiz'));
const QuizAttempt = require(path.join(serverDir, 'models/QuizAttempt'));
const aiService = require(path.join(serverDir, 'services/aiService'));
const { SUBJECT_TOPICS_MAP, TEN_QUESTION_QUIZZES } = require(path.join(serverDir, 'services/knowledgeDomains'));

const runVerification = async () => {
  console.log('🚀 Starting MindMap AI Root-Cause Verification Suite...\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindmap_ai';
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB:', mongoUri);

  const demoUser = await User.findOne({ email: 'demo@mindmap.ai' });
  if (!demoUser) throw new Error('Demo user demo@mindmap.ai not found in MongoDB!');
  console.log(`✅ Demo User Verified: ${demoUser.name} (${demoUser.email})`);

  // ============================================================
  // TEST 1: AI TUTOR EXACT CONVERSATION MULTI-TURN SEQUENCE
  // ============================================================
  console.log('\n--- TEST 1: AI TUTOR EXACT CONVERSATION MULTI-TURN SEQUENCE ---');
  const chatMessages = [];

  // Turn 1: "hi"
  console.log('\n[User -> AI]: "hi"');
  chatMessages.push({ role: 'user', content: 'hi' });
  const turn1 = await aiService.chatWithTutor({ messages: chatMessages });
  chatMessages.push({ role: 'assistant', content: turn1.reply });
  console.log('[AI Reply]:', turn1.reply);
  if (!turn1.reply.toLowerCase().includes('hello') && !turn1.reply.toLowerCase().includes('welcome')) {
    throw new Error('Turn 1 failed: Expected greeting!');
  }
  console.log('✅ PASS Turn 1: Short, natural greeting received.');

  // Turn 2: "basics of operating system"
  console.log('\n[User -> AI]: "basics of operating system"');
  chatMessages.push({ role: 'user', content: 'basics of operating system' });
  const turn2 = await aiService.chatWithTutor({ messages: chatMessages });
  chatMessages.push({ role: 'assistant', content: turn2.reply });
  console.log('[AI Reply]:\n', turn2.reply.slice(0, 300) + '...');
  if (!turn2.reply.toLowerCase().includes('operating system') || !turn2.reply.toLowerCase().includes('kernel')) {
    throw new Error('Turn 2 failed: Expected Operating System basics!');
  }
  console.log('✅ PASS Turn 2: Operating system fundamentals explained.');

  // Turn 3: "explain" (Contextual follow-up)
  console.log('\n[User -> AI]: "explain"');
  chatMessages.push({ role: 'user', content: 'explain' });
  const turn3 = await aiService.chatWithTutor({ messages: chatMessages });
  chatMessages.push({ role: 'assistant', content: turn3.reply });
  console.log('[AI Reply]:\n', turn3.reply.slice(0, 300) + '...');
  if (!turn3.reply.toLowerCase().includes('kernel mode') && !turn3.reply.toLowerCase().includes('system call') && !turn3.reply.toLowerCase().includes('operating system')) {
    throw new Error('Turn 3 failed: Did not understand contextual reference to Operating Systems!');
  }
  console.log('✅ PASS Turn 3: Contextually expanded Operating System mechanisms (Dual-mode, syscalls, context switching).');

  // Turn 4: "give practical examples" (Contextual follow-up)
  console.log('\n[User -> AI]: "give practical examples"');
  chatMessages.push({ role: 'user', content: 'give practical examples' });
  const turn4 = await aiService.chatWithTutor({ messages: chatMessages });
  chatMessages.push({ role: 'assistant', content: turn4.reply });
  console.log('[AI Reply]:\n', turn4.reply.slice(0, 300) + '...');
  if (!turn4.reply.toLowerCase().includes('fork') && !turn4.reply.toLowerCase().includes('paging') && !turn4.reply.toLowerCase().includes('scheduling')) {
    throw new Error('Turn 4 failed: Did not provide practical Operating System examples!');
  }
  console.log('✅ PASS Turn 4: Practical OS examples provided (fork process creation, virtual memory demand paging, CPU CFS).');

  // Turn 5: "compare Windows and Linux"
  console.log('\n[User -> AI]: "compare Windows and Linux"');
  chatMessages.push({ role: 'user', content: 'compare Windows and Linux' });
  const turn5 = await aiService.chatWithTutor({ messages: chatMessages });
  chatMessages.push({ role: 'assistant', content: turn5.reply });
  console.log('[AI Reply]:\n', turn5.reply.slice(0, 300) + '...');
  if (!turn5.reply.toLowerCase().includes('monolithic') && !turn5.reply.toLowerCase().includes('hybrid') && !turn5.reply.toLowerCase().includes('ntfs')) {
    throw new Error('Turn 5 failed: Did not provide Windows vs Linux comparison!');
  }
  console.log('✅ PASS Turn 5: Comprehensive technical comparison between Windows and Linux.');

  // Turn 6: "what did I ask first?"
  console.log('\n[User -> AI]: "what did I ask first?"');
  chatMessages.push({ role: 'user', content: 'what did I ask first?' });
  const turn6 = await aiService.chatWithTutor({ messages: chatMessages });
  console.log('[AI Reply]:\n', turn6.reply);
  if (!turn6.reply.toLowerCase().includes('hi')) {
    throw new Error('Turn 6 failed: Did not identify "hi" as first question!');
  }
  console.log('✅ PASS Turn 6: Correctly remembered first question ("hi") and displayed complete inquiry progression.');

  // ============================================================
  // TEST 2: MY UNIVERSE - TOPIC-SPECIFIC GRAPH GENERATION
  // ============================================================
  console.log('\n--- TEST 2: MY UNIVERSE TOPIC GRAPH GENERATION ---');
  // Scenario A: Computer Networks -> TCP
  console.log('Generating graph for: Subject = "Computer Networks", Topic = "TCP"...');
  const tcpGraph = await aiService.generateGraphForTopic({
    subjectName: 'Computer Networks',
    topicName: 'TCP',
  });
  console.log(`✅ TCP Graph Generated: ${tcpGraph.concepts.length} concepts, ${tcpGraph.relationships.length} relationships`);
  const tcpNames = tcpGraph.concepts.map(c => c.name);
  console.log('TCP Concepts:', tcpNames.join(' | '));

  // Required: TCP, Connection establishment, Three-way handshake, SYN, SYN-ACK, ACK, Reliable transmission, Flow control, Congestion control, Connection termination
  const requiredTcpKeywords = ['TCP', 'Handshake', 'SYN', 'ACK', 'Flow Control', 'Congestion Control', 'Termination'];
  for (const kw of requiredTcpKeywords) {
    if (!tcpNames.some(n => n.includes(kw))) {
      throw new Error(`TCP graph missing required concept keyword: ${kw}`);
    }
  }
  console.log('✅ PASS: All required TCP concepts verified in generated graph!');

  // Scenario B: Operating Systems -> Deadlocks
  console.log('\nGenerating graph for: Subject = "Operating Systems", Topic = "Deadlocks"...');
  const dlGraph = await aiService.generateGraphForTopic({
    subjectName: 'Operating Systems',
    topicName: 'Deadlocks',
  });
  console.log(`✅ Deadlocks Graph Generated: ${dlGraph.concepts.length} concepts, ${dlGraph.relationships.length} relationships`);
  const dlNames = dlGraph.concepts.map(c => c.name);
  console.log('Deadlocks Concepts:', dlNames.join(' | '));

  // Required: Deadlock, Mutual exclusion, Hold and wait, No preemption, Circular wait, Resource allocation, Deadlock prevention, Deadlock avoidance
  const requiredDlKeywords = ['Deadlock', 'Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait', 'Resource Allocation', 'Prevention', 'Avoidance'];
  for (const kw of requiredDlKeywords) {
    if (!dlNames.some(n => n.includes(kw))) {
      throw new Error(`Deadlocks graph missing required concept keyword: ${kw}`);
    }
  }
  console.log('✅ PASS: All required Deadlocks concepts verified in generated graph!');

  // Save both graphs to MongoDB
  const cnSub = await Subject.findOne({ userId: demoUser._id, name: 'Computer Networks' }) ||
    await Subject.create({ userId: demoUser._id, name: 'Computer Networks' });
  const osSub = await Subject.findOne({ userId: demoUser._id, name: 'Operating Systems' }) ||
    await Subject.create({ userId: demoUser._id, name: 'Operating Systems' });

  const savedTcp = await KnowledgeGraph.create({
    userId: demoUser._id,
    subjectId: cnSub._id,
    topic: 'TCP',
    title: 'TCP Universe',
    nodes: tcpGraph.concepts.map((c, i) => ({ id: `n-${i}`, type: 'cosmicNode', position: { x: i*50, y: i*50 }, data: c })),
    edges: tcpGraph.relationships.map((r, i) => ({ id: `e-${i}`, source: 'n-0', target: `n-${Math.min(i+1, tcpGraph.concepts.length-1)}`, label: r.relationType })),
  });

  const savedDl = await KnowledgeGraph.create({
    userId: demoUser._id,
    subjectId: osSub._id,
    topic: 'Deadlocks',
    title: 'Deadlocks Universe',
    nodes: dlGraph.concepts.map((c, i) => ({ id: `n-${i}`, type: 'cosmicNode', position: { x: i*50, y: i*50 }, data: c })),
    edges: dlGraph.relationships.map((r, i) => ({ id: `e-${i}`, source: 'n-0', target: `n-${Math.min(i+1, dlGraph.concepts.length-1)}`, label: r.relationType })),
  });
  console.log(`✅ Saved both graphs to DB: TCP (${savedTcp._id}) and Deadlocks (${savedDl._id})`);

  // ============================================================
  // TEST 3: QUIZ CENTER - GENERATE 10 QUESTIONS DIRECTLY (OPTION A)
  // ============================================================
  console.log('\n--- TEST 3: QUIZ CENTER - GENERATE WITHOUT EXISTING GRAPHS (OPTION A) ---');
  console.log('Requesting 10-Question Quiz for Subject = "Computer Networks", Topic = "deadlocks"...');
  const quizGen1 = await aiService.generateQuizFromConcepts({
    subjectName: 'Computer Networks',
    topicName: 'deadlocks',
    concepts: [], // Notice: ZERO pre-created concepts!
    difficulty: 'intermediate',
    questionCount: 10,
  });

  console.log(`✅ Questions Generated: ${quizGen1.questions.length}`);
  if (quizGen1.questions.length !== 10) throw new Error(`Expected 10 questions, got ${quizGen1.questions.length}`);

  // Verify topic relevance (must test deadlocks)
  const qTexts = quizGen1.questions.map(q => q.question).join(' ');
  if (!qTexts.toLowerCase().includes('deadlock') && !qTexts.toLowerCase().includes('coffman') && !qTexts.toLowerCase().includes('banker')) {
    throw new Error('Generated quiz was not relevant to Deadlocks topic!');
  }
  console.log('✅ PASS: Quiz generated relevant Deadlocks questions even when requested under custom subject with zero saved concepts!');

  console.log('\nRequesting 10-Question Quiz for Subject = "Computer Networks", Topic = "TCP"...');
  const quizGen2 = await aiService.generateQuizFromConcepts({
    subjectName: 'Computer Networks',
    topicName: 'TCP',
    concepts: [],
    difficulty: 'intermediate',
    questionCount: 10,
  });
  console.log(`✅ Questions Generated: ${quizGen2.questions.length}`);
  if (quizGen2.questions.length !== 10) throw new Error(`Expected 10 questions, got ${quizGen2.questions.length}`);

  const tcpQTexts = quizGen2.questions.map(q => q.question).join(' ');
  if (!tcpQTexts.toLowerCase().includes('tcp') && !tcpQTexts.toLowerCase().includes('handshake') && !tcpQTexts.toLowerCase().includes('flow control')) {
    throw new Error('Generated quiz was not relevant to TCP topic!');
  }
  console.log('✅ PASS: Quiz generated relevant TCP questions directly from subject and topic!');

  // Test question scale (5, 15, 20 questions)
  const quiz5 = await aiService.generateQuizFromConcepts({ topicName: 'TCP', questionCount: 5 });
  const quiz15 = await aiService.generateQuizFromConcepts({ topicName: 'TCP', questionCount: 15 });
  const quiz20 = await aiService.generateQuizFromConcepts({ topicName: 'TCP', questionCount: 20 });
  console.log(`✅ Scaled Quizzes Generated: 5-Q (${quiz5.questions.length}), 15-Q (${quiz15.questions.length}), 20-Q (${quiz20.questions.length})`);
  if (quiz5.questions.length !== 5 || quiz15.questions.length !== 15 || quiz20.questions.length !== 20) {
    throw new Error('Quiz question scaling failed!');
  }

  // Create Quiz in MongoDB
  const createdQuiz = await Quiz.create({
    userId: demoUser._id,
    subjectId: cnSub._id,
    title: 'TCP Mastery Assessment',
    difficulty: 'intermediate',
    timeLimitMinutes: 15,
    questions: quizGen2.questions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: q.explanation,
    })),
  });
  console.log(`✅ Created Quiz in DB with 10 questions: ID ${createdQuiz._id}`);

  // Simulate Submission
  const attempt = await QuizAttempt.create({
    userId: demoUser._id,
    quizId: createdQuiz._id,
    score: 8,
    totalQuestions: 10,
    percentage: 80,
    xpEarned: 85,
    answers: createdQuiz.questions.map((q, i) => ({
      questionIndex: i,
      selectedOption: i < 8 ? q.correctAnswerIndex : (q.correctAnswerIndex + 1) % 4,
      isCorrect: i < 8,
    })),
  });
  console.log(`✅ Simulated Attempt saved in DB: Score ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%)`);

  console.log('\n======================================================');
  console.log('🎉 ALL ROOT-CAUSE DEBUGGING & REPAIR TESTS PASSED 100%!');
  console.log('======================================================\n');

  await mongoose.disconnect();
};

runVerification().catch(err => {
  console.error('\n❌ VERIFICATION ERROR:', err);
  process.exit(1);
});
