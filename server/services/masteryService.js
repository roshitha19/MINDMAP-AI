/**
 * Knowledge Mastery Algorithmic Calculator
 * 
 * Mastery Score = (QuizAccuracy * 0.50) + (RecencyScore * 0.30) + (PracticeVolume * 0.20)
 * 
 * - QuizAccuracy: (correct / attempts) * 100
 * - RecencyScore: 100 * exp(-daysSinceActivity / 14) (Ebbinghaus Forgetting Curve)
 * - PracticeVolume: min(100, (revisions + quizAttempts) * 15)
 */

const calculateMasteryScore = ({
  quizCorrectCount = 0,
  quizAttemptsCount = 0,
  revisionCount = 0,
  lastActivityDate = null,
}) => {
  // 1. Quiz Accuracy component (0 - 100)
  let quizAccuracy = 0;
  if (quizAttemptsCount > 0) {
    quizAccuracy = (quizCorrectCount / quizAttemptsCount) * 100;
  } else {
    // If no quizzes taken yet, default to baseline 40% if revisions exist, else 10%
    quizAccuracy = revisionCount > 0 ? 40 : 10;
  }

  // 2. Recency Component (Ebbinghaus decay over 14 day half-life)
  let recencyScore = 10;
  if (lastActivityDate) {
    const diffMs = Date.now() - new Date(lastActivityDate).getTime();
    const daysSince = Math.max(0, diffMs / (1000 * 60 * 60 * 24));
    recencyScore = 100 * Math.exp(-daysSince / 14);
  }

  // 3. Practice Volume component
  const totalEngagements = quizAttemptsCount + revisionCount;
  const practiceVolume = Math.min(100, totalEngagements * 15);

  // Weighted aggregate
  const rawMastery = (quizAccuracy * 0.50) + (recencyScore * 0.30) + (practiceVolume * 0.20);
  const masteryScore = Math.min(100, Math.max(0, Math.round(rawMastery)));

  let status = 'untested';
  if (quizAttemptsCount > 0 || revisionCount > 0) {
    if (masteryScore >= 80) {
      status = 'strong';
    } else if (masteryScore >= 50) {
      status = 'moderate';
    } else {
      status = 'weak';
    }
  }

  return {
    masteryScore,
    status,
    accuracyRate: Math.round(quizAccuracy),
  };
};

module.exports = {
  calculateMasteryScore,
};
