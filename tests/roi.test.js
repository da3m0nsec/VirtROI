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

test('calculateRoi computes the default VMware to Morpheus scenario', () => {
  const result = calculateRoi({
    inputMode: 'topology',
    hosts: 10,
    socketsPerHost: 2,
    coresPerSocket: 24,
    currentPricingMetric: 'core',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 200,
    targetUnitPricePerYear: 600,
    currentAdditionalAnnualCost: 0,
    targetAdditionalAnnualCost: 0,
    migrationCost: 40000,
    years: 3,
  });

  assert.deepEqual(result, {
    totalCores: 480,
    totalSockets: 20,
    currentLicenseAnnualCost: 96000,
    targetLicenseAnnualCost: 12000,
    currentAnnualCost: 96000,
    targetAnnualCost: 12000,
    annualSavings: 84000,
    totalSavingsOverPeriod: 252000,
    netSavingsAfterMigration: 212000,
    paybackYears: 0.47619047619047616,
    roiPercent: 530,
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
    currentUnitPricePerYear: 200,
    targetUnitPricePerYear: 600,
    currentAdditionalAnnualCost: 0,
    targetAdditionalAnnualCost: 0,
    migrationCost: 40000,
    years: 3,
  });

  assert.deepEqual(buildChartSeries(result, 3), [
    { year: 0, currentCost: 0, targetCost: 40000, netSavings: -40000 },
    { year: 1, currentCost: 96000, targetCost: 52000, netSavings: 44000 },
    { year: 2, currentCost: 192000, targetCost: 64000, netSavings: 128000 },
    { year: 3, currentCost: 288000, targetCost: 76000, netSavings: 212000 },
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
