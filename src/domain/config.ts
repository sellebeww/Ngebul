/** ASUMSI, GANTI DENGAN DATA NYATA. Nilai ini bukan hasil penelitian. */
export const CONFIG = {
  horizonDays: 84, simulations: 500, randomSeed: 4217,
  staleDays: 7, staleWidening: 0.25, calibrationWeeks: 4,
  defaultOrder: ['essential', 'penalty', 'nonNegotiable', 'priority'] as const,
  trialWeeks: 8, moneyRounding: 1000, bandQuantiles: [0.1, 0.9], probabilityStep: 10, riskBandLower: 70, comparisonDays: 28,
};
