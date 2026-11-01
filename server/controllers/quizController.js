const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Concept = require('../models/Concept');
const Subject = require('../models/Subject');
const Mastery = require('../models/Mastery');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const aiService = require('../services/aiService');
const { calculateMasteryScore } = require('../services/masteryService');

// @desc    Generate and create AI Quiz with 10 questions by default
// @route   POST /api/quizzes/generate
// @access  Private
const generateQuiz = async (req, res, next) => {
  try {
    const {
      subjectId,
      subjectName,
      topicName,
      conceptIds,
      difficulty = 'intermediate',
      questionCount = 10,
      title,
      timeLimitMinutes = 15,
    } = req.body;

    // Validate that either Option A (Subject/Topic) or Option B (Concepts) is supplied
    if (!subjectName && !subjectId && !topicName && (!conceptIds || conceptIds.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a Subject and Topic (Option A) or select at least one Concept (Option B).',
      });
    }

    let targetSubject = null;
    let concepts = [];

    // Option B: concepts supplied directly
    if (conceptIds && conceptIds.length > 0) {
      concepts = await Concept.find({ _id: { $in: conceptIds } });
    }

    // Resolve or find Subject
    if (subjectId) {
      targetSubject = await Subject.findOne({ _id: subjectId, userId: req.user.id });
      if (!concepts.length) {
        concepts = await Concept.find({ subjectId, userId: req.user.id });
      }
    } else if (subjectName) {
      targetSubject = await Subject.findOne({ name: subjectName, userId: req.user.id });
      if (targetSubject && !concepts.length) {
        concepts = await Concept.find({ subjectId: targetSubject._id, userId: req.user.id });
      }
    }

    // Auto-create subject if it doesn't exist yet for Option A
    if (!targetSubject && subjectName) {
      targetSubject = await Subject.create({
        userId: req.user.id,
        name: subjectName,
        description: `Academic subject domain for ${subjectName}`,
      });
    }

    const resolvedSubjectName = targetSubject ? targetSubject.name : (subjectName || 'Computer Science');
    const resolvedTopicName = topicName || (concepts[0]?.name || 'Fundamentals');
    const targetCount = parseInt(questionCount) || 10;

    const aiQuiz = await aiService.generateQuizFromConcepts({
      subjectName: resolvedSubjectName,
      topicName: resolvedTopicName,
      concepts,
      difficulty,
      questionCount: targetCount,
    });

    if (!aiQuiz.questions || aiQuiz.questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: `Could not generate quiz questions for "${resolvedTopicName}". Please try again.`,
      });
    }

    // Map questions to concepts
    const formattedQuestions = aiQuiz.questions.map((q, idx) => {
      const matchedConcept = concepts.find(c => c.name.toLowerCase() === (q.conceptName || '').toLowerCase()) || (concepts.length > 0 ? concepts[idx % concepts.length] : null);
      return {
        question: q.question,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex ?? 0,
        explanation: q.explanation || '',
        conceptId: matchedConcept ? matchedConcept._id : null,
      };
    });

    const quiz = await Quiz.create({
      userId: req.user.id,
      subjectId: targetSubject ? targetSubject._id : null,
      conceptIds: concepts.map(c => c._id),
      title: title || `${resolvedTopicName} Assessment (${formattedQuestions.length} Questions)`,
      difficulty,
      timeLimitMinutes: parseInt(timeLimitMinutes) || 15,
      questions: formattedQuestions,
    });

    res.status(201).json({
      success: true,
      message: `Quiz generated with ${formattedQuestions.length} questions!`,
      data: quiz,
      aiProvider: aiQuiz.aiProvider,
      isDemoMode: aiQuiz.isDemoMode,
    });
  } catch (err) {
    console.error('[Quiz Generation Controller Error]:', err.message);
    res.status(500).json({
      success: false,
      message: `Quiz generation failed: ${err.message}`,
    });
  }
};

// @desc    Get all quizzes for user
// @route   GET /api/quizzes
// @access  Private
const getQuizzes = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    const filter = { userId: req.user.id };
    if (subjectId) filter.subjectId = subjectId;

    const quizzes = await Quiz.find(filter)
      .populate('subjectId', 'name color')
      .populate('conceptIds', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single quiz (includes questions and options)
// @route   GET /api/quizzes/:id
// @access  Private
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('subjectId', 'name color')
      .populate('conceptIds', 'name category');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit quiz attempt, compute score out of 10, update mastery and track weak concepts
// @route   POST /api/quizzes/:id/submit
// @access  Private
const submitQuizAttempt = async (req, res, next) => {
  try {
    const { userAnswers } = req.body; // Array of { questionIndex, selectedOption }
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let correctCount = 0;
    const evaluatedAnswers = [];
    const conceptsTested = new Map(); // conceptId -> { total, correct, name }
    const weakTopics = [];

    quiz.questions.forEach((q, index) => {
      const userSubmission = userAnswers.find(a => a.questionIndex === index);
      const selected = userSubmission ? userSubmission.selectedOption : -1;
      const isCorrect = selected === q.correctAnswerIndex;

      if (isCorrect) correctCount++;
      else {
        weakTopics.push({
          questionIndex: index + 1,
          question: q.question,
          conceptName: q.conceptName || 'Core Topic',
          correctAnswer: q.options[q.correctAnswerIndex],
        });
      }

      evaluatedAnswers.push({
        questionIndex: index,
        question: q.question,
        options: q.options,
        selectedOption: selected,
        correctAnswerIndex: q.correctAnswerIndex,
        isCorrect,
        explanation: q.explanation,
        conceptId: q.conceptId,
      });

      if (q.conceptId) {
        const idStr = q.conceptId.toString();
        if (!conceptsTested.has(idStr)) {
          conceptsTested.set(idStr, { total: 0, correct: 0 });
        }
        const record = conceptsTested.get(idStr);
        record.total += 1;
        if (isCorrect) record.correct += 1;
      }
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const xpEarned = 50 + (correctCount * 15);

    // Save Attempt in MongoDB
    const attempt = await QuizAttempt.create({
      userId: req.user.id,
      quizId: quiz._id,
      answers: evaluatedAnswers,
      score: correctCount,
      totalQuestions,
      percentage,
      xpEarned,
      completedAt: new Date(),
    });

    // Update Mastery Scores in MongoDB for each concept tested
    const masteryUpdates = [];
    for (const [conceptIdStr, stats] of conceptsTested.entries()) {
      let mastery = await Mastery.findOne({ userId: req.user.id, conceptId: conceptIdStr });
      if (!mastery) {
        mastery = new Mastery({
          userId: req.user.id,
          conceptId: conceptIdStr,
          subjectId: quiz.subjectId,
        });
      }

      mastery.quizAttemptsCount += stats.total;
      mastery.quizCorrectCount += stats.correct;
      mastery.lastQuizDate = new Date();

      const calculated = calculateMasteryScore({
        quizCorrectCount: mastery.quizCorrectCount,
        quizAttemptsCount: mastery.quizAttemptsCount,
        revisionCount: mastery.revisionCount,
        lastActivityDate: mastery.lastQuizDate,
      });

      mastery.masteryScore = calculated.masteryScore;
      mastery.status = calculated.status;
      mastery.accuracyRate = calculated.accuracyRate;
      await mastery.save();

      await Concept.findByIdAndUpdate(conceptIdStr, {
        masteryScore: calculated.masteryScore,
        lastReviewed: new Date(),
        $inc: { reviewCount: 1 },
      });

      masteryUpdates.push({
        conceptId: conceptIdStr,
        newScore: calculated.masteryScore,
        status: calculated.status,
      });
    }

    // Award XP and check level-up
    const user = await User.findById(req.user.id);
    user.xp = (user.xp || 100) + xpEarned;
    user.level = Math.floor(user.xp / 300) + 1;
    await user.save();

    // Check achievement unlock
    await checkQuizAchievements(user._id, percentage);

    res.status(200).json({
      success: true,
      message: `Assessment evaluated! Score: ${correctCount}/${totalQuestions} (${percentage}%)`,
      data: {
        attemptId: attempt._id,
        score: correctCount,
        totalQuestions,
        percentage,
        xpEarned,
        userLevel: user.level,
        userXp: user.xp,
        answers: evaluatedAnswers,
        weakTopics,
        masteryUpdates,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Check quiz related achievements
const checkQuizAchievements = async (userId, percentage) => {
  try {
    const totalAttempts = await QuizAttempt.countDocuments({ userId });

    let whizBadge = await Achievement.findOne({ userId, badgeId: 'quiz_whiz' });
    if (!whizBadge) {
      whizBadge = await Achievement.create({
        userId,
        badgeId: 'quiz_whiz',
        title: 'Quiz Prodigy',
        description: 'Complete your first knowledge assessment with flying colors.',
        icon: 'HelpCircle',
        target: 1,
      });
    }

    if (!whizBadge.unlocked && totalAttempts >= 1) {
      whizBadge.unlocked = true;
      whizBadge.unlockedAt = new Date();
      whizBadge.progress = 1;
      await whizBadge.save();
    }
  } catch (err) {
    console.warn('[Achievement Check Warning]:', err.message);
  }
};

// @desc    Get quiz attempts history
// @route   GET /api/quizzes/attempts/history
// @access  Private
const getQuizAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user.id })
      .populate({
        path: 'quizId',
        select: 'title difficulty subjectId',
        populate: { path: 'subjectId', select: 'name color' },
      })
      .sort({ completedAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      data: attempts,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateQuiz,
  getQuizzes,
  getQuizById,
  submitQuizAttempt,
  getQuizAttempts,
};
