interface WeightParams {
  wrongCount: number;
  reciteLevel: number;
  clickCount: number;
  lastWrongAt?: Date;
}

export function computeWeight(params: WeightParams): number {
  const { wrongCount, reciteLevel, clickCount, lastWrongAt } = params;

  let daysSinceLastReview = 30;
  if (lastWrongAt) {
    daysSinceLastReview =
      (Date.now() - new Date(lastWrongAt).getTime()) / (1000 * 60 * 60 * 24);
  }

  let weight =
    1.0 +
    wrongCount * 3 +
    (3 - reciteLevel) * 2 -
    daysSinceLastReview * 0.5 +
    clickCount * 0.1;

  return Math.max(0.1, weight);
}
