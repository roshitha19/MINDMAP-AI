const Achievement = require('../models/Achievement');
const User = require('../models/User');
const KnowledgeGraph = require('../models/KnowledgeGraph');
const Concept = require('../models/Concept');
const Mastery = require('../models/Mastery');
const RevisionSchedule = require('../models/RevisionSchedule');

const DEFAULT_BADGES = [
  {
    badgeId: 'first_galaxy',
    title: 'First Galaxy',
    description: 'Create and launch your first interactive knowledge graph.',
    icon: 'Compass',
    target: 1,
    xpReward: 150,
  },
  {
    badgeId: 'brain_builder',
    title: 'Brain Builder',
    description: 'Structure 15 or more atomic concepts across your universe.',
    icon: 'Layers',
    target: 15,
    xpReward: 250,
  },
  {
    badgeId: 'consistency_streak',
    title: 'Cosmic Momentum',
    description: 'Maintain an active daily learning streak.',
    icon: 'Flame',
    target: 3,
    xpReward: 200,
  },
  {
    badgeId: 'master_explorer',
    title: 'Master Explorer',
    description: 'Achieve 80% or greater mastery on 3 concepts.',
    icon: 'Award',
    target: 3,
    xpReward: 300,
  },
  {
    badgeId: 'revision_champion',
    title: 'Spaced Memory Master',
    description: 'Complete 10 spaced repetition review cycles.',
    icon: 'Repeat',
    target: 10,
    xpReward: 200,
  },
  {
    badgeId: 'quiz_whiz',
    title: 'Quiz Prodigy',
    description: 'Complete your first knowledge assessment assessment.',
    icon: 'Sparkles',
    target: 1,
    xpReward: 150,
  },
];

// @desc    Get all achievements with user progression status
// @route   GET /api/gamification/achievements
// @access  Private
const getAchievements = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Compute live progress from DB
    const graphCount = await KnowledgeGraph.countDocuments({ userId });
    const conceptCount = await Concept.countDocuments({ userId });
    const strongConceptCount = await Mastery.countDocuments({ userId, masteryScore: { $gte: 80 } });

    const schedules = await RevisionSchedule.find({ userId });
    let totalRevisions = 0;
    schedules.forEach(s => {
      totalRevisions += (s.history ? s.history.length : 0);
    });

    const userBadges = [];

    for (const badgeDef of DEFAULT_BADGES) {
      let badge = await Achievement.findOne({ userId, badgeId: badgeDef.badgeId });
      if (!badge) {
        badge = new Achievement({
          userId,
          badgeId: badgeDef.badgeId,
          title: badgeDef.title,
          description: badgeDef.description,
          icon: badgeDef.icon,
          target: badgeDef.target,
          xpReward: badgeDef.xpReward,
        });
      }

      // Calculate progress
      let currentProgress = 0;
      if (badgeDef.badgeId === 'first_galaxy') currentProgress = graphCount;
      else if (badgeDef.badgeId === 'brain_builder') currentProgress = conceptCount;
      else if (badgeDef.badgeId === 'consistency_streak') currentProgress = user.streak || 1;
      else if (badgeDef.badgeId === 'master_explorer') currentProgress = strongConceptCount;
      else if (badgeDef.badgeId === 'revision_champion') currentProgress = totalRevisions;
      else if (badgeDef.badgeId === 'quiz_whiz') currentProgress = badge.unlocked ? 1 : 0;

      badge.progress = currentProgress;
      if (!badge.unlocked && currentProgress >= badgeDef.target) {
        badge.unlocked = true;
        badge.unlockedAt = new Date();
        user.xp += badgeDef.xpReward;
        user.level = Math.floor(user.xp / 300) + 1;
        await user.save();
      }

      await badge.save();
      userBadges.push(badge);
    }

    const currentXp = user.xp || 100;
    const currentLevel = user.level || 1;
    const nextLevelXp = currentLevel * 300;
    const levelProgress = Math.min(100, Math.round(((currentXp % 300) / 300) * 100));

    res.status(200).json({
      success: true,
      data: {
        xp: currentXp,
        level: currentLevel,
        streak: user.streak || 1,
        levelProgress,
        nextLevelXp,
        badges: userBadges,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAchievements,
};
