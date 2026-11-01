const RevisionSchedule = require('../models/RevisionSchedule');
const Concept = require('../models/Concept');
const Mastery = require('../models/Mastery');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const { calculateNextReview } = require('../services/spacedRepetitionService');
const { calculateMasteryScore } = require('../services/masteryService');

// @desc    Get daily revision queue (due and overdue concepts)
// @route   GET /api/revisions/queue
// @access  Private
const getRevisionQueue = async (req, res, next) => {
  try {
    const now = new Date();
    // End of today
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const dueSchedules = await RevisionSchedule.find({
      userId: req.user.id,
      nextReviewDate: { $lte: endOfToday },
    })
      .populate({
        path: 'conceptId',
        select: 'name category definition explanation formula examples masteryScore',
      })
      .populate('subjectId', 'name color')
      .sort({ nextReviewDate: 1 });

    // Also fetch weak concepts (< 50% mastery) for additional revision recommendations
    const weakMasteries = await Mastery.find({
      userId: req.user.id,
      status: 'weak',
    })
      .populate('conceptId', 'name category definition masteryScore')
      .populate('subjectId', 'name color')
      .limit(6);

    // Overdue count (nextReviewDate strictly before start of today)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const overdueCount = dueSchedules.filter(s => new Date(s.nextReviewDate) < startOfToday).length;

    res.status(200).json({
      success: true,
      dueCount: dueSchedules.length,
      overdueCount,
      queue: dueSchedules,
      weakConcepts: weakMasteries,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit revision response for a concept (Again, Difficult, Good, Easy)
// @route   POST /api/revisions/:conceptId/review
// @access  Private
const submitRevisionFeedback = async (req, res, next) => {
  try {
    const { rating } = req.body; // 'again', 'difficult', 'good', 'easy'
    const { conceptId } = req.params;

    if (!['again', 'difficult', 'good', 'easy'].includes(rating)) {
      return res.status(400).json({ success: false, message: 'Invalid rating. Choose again, difficult, good, or easy' });
    }

    let schedule = await RevisionSchedule.findOne({ userId: req.user.id, conceptId });
    if (!schedule) {
      const concept = await Concept.findById(conceptId);
      if (!concept) return res.status(404).json({ success: false, message: 'Concept not found' });

      schedule = new RevisionSchedule({
        userId: req.user.id,
        conceptId,
        subjectId: concept.subjectId,
        intervalDays: 1,
        repetitions: 0,
        easeFactor: 2.5,
      });
    }

    // Run SM-2 Calculation
    const { nextReviewDate, intervalDays, repetitions, easeFactor } = calculateNextReview(
      rating,
      schedule.intervalDays,
      schedule.repetitions,
      schedule.easeFactor
    );

    schedule.intervalDays = intervalDays;
    schedule.repetitions = repetitions;
    schedule.easeFactor = easeFactor;
    schedule.nextReviewDate = nextReviewDate;
    schedule.lastReviewDate = new Date();
    schedule.history.push({
      rating,
      reviewDate: new Date(),
      newInterval: intervalDays,
      newEaseFactor: easeFactor,
    });

    await schedule.save();

    // Update Mastery Record
    let mastery = await Mastery.findOne({ userId: req.user.id, conceptId });
    if (!mastery) {
      mastery = new Mastery({
        userId: req.user.id,
        conceptId,
        subjectId: schedule.subjectId,
      });
    }

    mastery.revisionCount = (mastery.revisionCount || 0) + 1;
    mastery.lastRevisionDate = new Date();

    const calculatedMastery = calculateMasteryScore({
      quizCorrectCount: mastery.quizCorrectCount,
      quizAttemptsCount: mastery.quizAttemptsCount,
      revisionCount: mastery.revisionCount,
      lastActivityDate: mastery.lastRevisionDate,
    });

    mastery.masteryScore = calculatedMastery.masteryScore;
    mastery.status = calculatedMastery.status;
    await mastery.save();

    // Update Concept
    await Concept.findByIdAndUpdate(conceptId, {
      masteryScore: calculatedMastery.masteryScore,
      lastReviewed: new Date(),
      $inc: { reviewCount: 1 },
    });

    // Reward XP
    const xpReward = rating === 'easy' ? 30 : rating === 'good' ? 25 : 15;
    const user = await User.findById(req.user.id);
    user.xp += xpReward;
    user.level = Math.floor(user.xp / 300) + 1;
    await user.save();

    // Check revision champion achievement
    await checkRevisionAchievements(user._id);

    res.status(200).json({
      success: true,
      message: `Revision logged! Next scheduled review in ${intervalDays} day(s).`,
      data: {
        nextReviewDate,
        intervalDays,
        repetitions,
        easeFactor,
        newMasteryScore: calculatedMastery.masteryScore,
        status: calculatedMastery.status,
        xpReward,
      },
    });
  } catch (err) {
    next(err);
  }
};

const checkRevisionAchievements = async (userId) => {
  try {
    const schedules = await RevisionSchedule.find({ userId });
    let totalReviews = 0;
    schedules.forEach(s => {
      totalReviews += (s.history ? s.history.length : 0);
    });

    let badge = await Achievement.findOne({ userId, badgeId: 'revision_champion' });
    if (!badge) {
      badge = await Achievement.create({
        userId,
        badgeId: 'revision_champion',
        title: 'Spaced Memory Master',
        description: 'Complete 10 spaced repetition reviews.',
        icon: 'Repeat',
        target: 10,
        progress: totalReviews,
      });
    }

    badge.progress = totalReviews;
    if (!badge.unlocked && totalReviews >= 10) {
      badge.unlocked = true;
      badge.unlockedAt = new Date();
    }
    await badge.save();
  } catch (err) {
    console.warn('[Revision Achievement Error]:', err.message);
  }
};

// @desc    Get revision statistics
// @route   GET /api/revisions/stats
// @access  Private
const getRevisionStats = async (req, res, next) => {
  try {
    const schedules = await RevisionSchedule.find({ userId: req.user.id });
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let reviewedToday = 0;
    let totalReviews = 0;

    schedules.forEach(s => {
      if (s.lastReviewDate && new Date(s.lastReviewDate) >= startOfToday) {
        reviewedToday++;
      }
      totalReviews += (s.history ? s.history.length : 0);
    });

    res.status(200).json({
      success: true,
      data: {
        totalScheduledCards: schedules.length,
        reviewedToday,
        totalReviewsAllTime: totalReviews,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRevisionQueue,
  submitRevisionFeedback,
  getRevisionStats,
};
