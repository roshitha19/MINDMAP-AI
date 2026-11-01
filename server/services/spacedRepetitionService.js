/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 * 
 * Quality ratings (q):
 * - 'again': q = 0 (Complete blackout, reset repetitions)
 * - 'difficult': q = 3 (Correct response remembered with serious difficulty)
 * - 'good': q = 4 (Correct response after a hesitation)
 * - 'easy': q = 5 (Perfect response with no hesitation)
 */

const calculateNextReview = (rating, currentInterval = 1, currentRepetitions = 0, currentEaseFactor = 2.5) => {
  let quality;
  switch (rating) {
    case 'again':
      quality = 0;
      break;
    case 'difficult':
      quality = 3;
      break;
    case 'good':
      quality = 4;
      break;
    case 'easy':
      quality = 5;
      break;
    default:
      quality = 4;
  }

  // Calculate new Ease Factor (EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  let newEaseFactor = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  let newRepetitions = currentRepetitions;
  let newInterval = currentInterval;

  if (quality < 3) {
    // Failure to recall: reset repetitions back to 0, review again tomorrow
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Successful recall
    newRepetitions += 1;
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = quality === 5 ? 7 : 6;
    } else {
      newInterval = Math.round(currentInterval * newEaseFactor);
      if (quality === 5) {
        newInterval = Math.round(newInterval * 1.2); // Bonus for easy recall
      }
    }
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    nextReviewDate,
    intervalDays: newInterval,
    repetitions: newRepetitions,
    easeFactor: parseFloat(newEaseFactor.toFixed(2)),
  };
};

module.exports = {
  calculateNextReview,
};
