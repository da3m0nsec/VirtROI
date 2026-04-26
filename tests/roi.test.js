const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateRoi,
  getDecision,
  formatCurrency,
  formatYears,
  formatPercent,
} = require('../app.js');

test('calculateRoi computes the default VMware to Morpheus scenario', () => {
  const result = calculateRoi({
    hosts: 10,
    socketsPerHost: 2,
    coresPerSocket: 24,
    currentPricePerCorePerYear: 200,
    targetPricePerSocketPerYear: 600,
    migrationCost: 40000,
    years: 3,
  });

  assert.deepEqual(result, {
    totalCores: 480,
    totalSockets: 20,
    currentAnnualCost: 96000,
    targetAnnualCost: 12000,
    annualSavings: 84000,
    totalSavingsOverPeriod: 252000,
    netSavingsAfterMigration: 212000,
    paybackYears: 0.47619047619047616,
    roiPercent: 530,
  });
});

test('calculateRoi does not produce a payback period when annual savings are not positive', () => {
  const result = calculateRoi({
    hosts: 1,
    socketsPerHost: 1,
    coresPerSocket: 8,
    currentPricePerCorePerYear: 10,
    targetPricePerSocketPerYear: 1000,
    migrationCost: 5000,
    years: 3,
  });

  assert.equal(result.annualSavings, -920);
  assert.equal(result.paybackYears, null);
  assert.equal(result.roiPercent, -155.2);
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
