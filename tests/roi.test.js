const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateRoi,
  buildChartSeries,
  getDecision,
  formatCurrency,
  formatYears,
  formatPercent,
} = require('../app.js');

test('calculateRoi computes the default Product 1 to Product 2 scenario', () => {
  const result = calculateRoi({
    inputMode: 'topology',
    hosts: 10,
    socketsPerHost: 2,
    coresPerSocket: 24,
    currentPricingMetric: 'core',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 400,
    targetUnitPricePerYear: 4500,
    currentAdditionalAnnualCost: 0,
    targetAdditionalAnnualCost: 0,
    migrationCost: 40000,
    years: 3,
  });

  assert.deepEqual(result, {
    totalCores: 480,
    totalSockets: 20,
    currentLicenseAnnualCost: 192000,
    targetLicenseAnnualCost: 90000,
    currentAnnualCost: 192000,
    targetAnnualCost: 90000,
    oneTimeCosts: 40000,
    annualSavings: 102000,
    totalSavingsOverPeriod: 306000,
    netSavingsAfterMigration: 266000,
    paybackYears: 0.39215686274509803,
    roiPercent: 665,
  });
});

test('calculateRoi supports pricing both products per socket with additional annual costs', () => {
  const result = calculateRoi({
    inputMode: 'topology',
    hosts: 5,
    socketsPerHost: 2,
    coresPerSocket: 16,
    currentPricingMetric: 'socket',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 1000,
    targetUnitPricePerYear: 600,
    currentAdditionalAnnualCost: 12000,
    targetAdditionalAnnualCost: 4000,
    migrationCost: 10000,
    years: 2,
  });

  assert.equal(result.totalSockets, 10);
  assert.equal(result.totalCores, 160);
  assert.equal(result.currentLicenseAnnualCost, 10000);
  assert.equal(result.targetLicenseAnnualCost, 6000);
  assert.equal(result.currentAnnualCost, 22000);
  assert.equal(result.targetAnnualCost, 10000);
  assert.equal(result.annualSavings, 12000);
  assert.equal(result.netSavingsAfterMigration, 14000);
});

test('calculateRoi supports absolute cores and sockets instead of host topology', () => {
  const result = calculateRoi({
    inputMode: 'absolute',
    totalSockets: 12,
    totalCores: 384,
    currentPricingMetric: 'core',
    targetPricingMetric: 'core',
    currentUnitPricePerYear: 200,
    targetUnitPricePerYear: 50,
    currentAdditionalAnnualCost: 0,
    targetAdditionalAnnualCost: 6000,
    migrationCost: 30000,
    years: 3,
  });

  assert.equal(result.totalSockets, 12);
  assert.equal(result.totalCores, 384);
  assert.equal(result.currentLicenseAnnualCost, 76800);
  assert.equal(result.targetLicenseAnnualCost, 19200);
  assert.equal(result.targetAnnualCost, 25200);
  assert.equal(result.annualSavings, 51600);
});

test('calculateRoi combines migration, hardware, and renewal one-time costs', () => {
  const result = calculateRoi({
    inputMode: 'topology',
    hosts: 2,
    socketsPerHost: 2,
    coresPerSocket: 10,
    currentPricingMetric: 'core',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 500,
    targetUnitPricePerYear: 1000,
    currentAdditionalAnnualCost: 0,
    targetAdditionalAnnualCost: 0,
    migrationCost: 10000,
    hardwareCost: 15000,
    renewalCost: 5000,
    years: 2,
  });

  assert.equal(result.oneTimeCosts, 30000);
  assert.equal(result.netSavingsAfterMigration, 2000);
  assert.equal(result.paybackYears, 1.875);
  assert.equal(result.roiPercent, 6.67);
});

test('calculateRoi does not produce a payback period when annual savings are not positive', () => {
  const result = calculateRoi({
    inputMode: 'topology',
    hosts: 1,
    socketsPerHost: 1,
    coresPerSocket: 8,
    currentPricingMetric: 'core',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 10,
    targetUnitPricePerYear: 1000,
    currentAdditionalAnnualCost: 0,
    targetAdditionalAnnualCost: 0,
    migrationCost: 5000,
    years: 3,
  });

  assert.equal(result.annualSavings, -920);
  assert.equal(result.paybackYears, null);
  assert.equal(result.roiPercent, -155.2);
});

test('buildChartSeries produces cumulative cost and savings points per year', () => {
  const result = calculateRoi({
    inputMode: 'topology',
    hosts: 10,
    socketsPerHost: 2,
    coresPerSocket: 24,
    currentPricingMetric: 'core',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 400,
    targetUnitPricePerYear: 4500,
    currentAdditionalAnnualCost: 0,
    targetAdditionalAnnualCost: 0,
    migrationCost: 40000,
    years: 3,
  });

  assert.deepEqual(buildChartSeries(result, 3), [
    { year: 0, currentCost: 0, targetCost: 40000, netSavings: -40000 },
    { year: 1, currentCost: 192000, targetCost: 130000, netSavings: 62000 },
    { year: 2, currentCost: 384000, targetCost: 220000, netSavings: 164000 },
    { year: 3, currentCost: 576000, targetCost: 310000, netSavings: 266000 },
  ]);
});

test('getDecision labels strong, evaluation, and weak cases', () => {
  assert.equal(getDecision({ annualSavings: 84000, paybackYears: 0.48 }).label, 'Strong case');
  assert.equal(getDecision({ annualSavings: 20000, paybackYears: 2.5 }).label, 'Worth evaluating');
  assert.equal(getDecision({ annualSavings: 1000, paybackYears: 4 }).label, 'Weak financial case');
  assert.equal(getDecision({ annualSavings: 0, paybackYears: null }).label, 'Weak financial case');
});

test('formatters produce buyer-friendly output', () => {
  assert.equal(formatCurrency(96000), '$96,000');
  assert.equal(formatCurrency(-920), '-$920');
  assert.equal(formatYears(0.476), '0.48 years');
  assert.equal(formatYears(null), 'No payback');
  assert.equal(formatPercent(530), '530%');
  assert.equal(formatPercent(-155.2), '-155.2%');
});
