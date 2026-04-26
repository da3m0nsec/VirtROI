const DEFAULT_INPUTS = {
  currentPlatform: 'VMware',
  targetPlatform: 'Morpheus VM Essentials',
  hosts: 10,
  socketsPerHost: 2,
  coresPerSocket: 24,
  currentPricePerCorePerYear: 200,
  targetPricePerSocketPerYear: 600,
  migrationCost: 40000,
  years: 3,
};

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function calculateRoi(inputs) {
  const hosts = toFiniteNumber(inputs.hosts);
  const socketsPerHost = toFiniteNumber(inputs.socketsPerHost);
  const coresPerSocket = toFiniteNumber(inputs.coresPerSocket);
  const currentPricePerCorePerYear = toFiniteNumber(inputs.currentPricePerCorePerYear);
  const targetPricePerSocketPerYear = toFiniteNumber(inputs.targetPricePerSocketPerYear);
  const migrationCost = toFiniteNumber(inputs.migrationCost);
  const years = toFiniteNumber(inputs.years, DEFAULT_INPUTS.years);

  const totalCores = hosts * socketsPerHost * coresPerSocket;
  const totalSockets = hosts * socketsPerHost;
  const currentAnnualCost = totalCores * currentPricePerCorePerYear;
  const targetAnnualCost = totalSockets * targetPricePerSocketPerYear;
  const annualSavings = currentAnnualCost - targetAnnualCost;
  const totalSavingsOverPeriod = annualSavings * years;
  const netSavingsAfterMigration = totalSavingsOverPeriod - migrationCost;
  const paybackYears = annualSavings > 0 ? migrationCost / annualSavings : null;
  const roiPercent = migrationCost > 0 ? roundTo((netSavingsAfterMigration / migrationCost) * 100, 2) : null;

  return {
    totalCores,
    totalSockets,
    currentAnnualCost,
    targetAnnualCost,
    annualSavings,
    totalSavingsOverPeriod,
    netSavingsAfterMigration,
    paybackYears,
    roiPercent,
  };
}

function getDecision(result) {
  if (result.annualSavings > 0 && result.paybackYears !== null && result.paybackYears <= 1) {
    return {
      label: 'Strong case',
      tone: 'strong',
      summary: 'The financial case is strong: annual savings recover migration costs in about a year or less.',
    };
  }

  if (result.annualSavings > 0 && result.paybackYears !== null && result.paybackYears <= 3) {
    return {
      label: 'Worth evaluating',
      tone: 'evaluate',
      summary: 'The switch may be financially attractive, but validate operational risk, support, and migration effort.',
    };
  }

  return {
    label: 'Weak financial case',
    tone: 'weak',
    summary: 'Savings are too low, negative, or take too long to recover the migration investment.',
  };
}

function formatCurrency(value) {
  const amount = toFiniteNumber(value);
  const absolute = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(absolute);
  return amount < 0 ? `-${formatted}` : formatted;
}

function formatYears(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'No payback';
  }
  const rounded = roundTo(value, 2);
  return `${rounded.toLocaleString('en-US')} ${rounded === 1 ? 'year' : 'years'}`;
}

function formatPercent(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'N/A';
  }
  return `${roundTo(value, 1).toLocaleString('en-US')}%`;
}

function getElement(id) {
  return document.getElementById(id);
}

function getInputs() {
  return {
    currentPlatform: getElement('currentPlatform').value.trim() || DEFAULT_INPUTS.currentPlatform,
    targetPlatform: getElement('targetPlatform').value.trim() || DEFAULT_INPUTS.targetPlatform,
    hosts: toFiniteNumber(getElement('hosts').value),
    socketsPerHost: toFiniteNumber(getElement('socketsPerHost').value),
    coresPerSocket: toFiniteNumber(getElement('coresPerSocket').value),
    currentPricePerCorePerYear: toFiniteNumber(getElement('currentPricePerCorePerYear').value),
    targetPricePerSocketPerYear: toFiniteNumber(getElement('targetPricePerSocketPerYear').value),
    migrationCost: toFiniteNumber(getElement('migrationCost').value),
    years: toFiniteNumber(getElement('years').value, DEFAULT_INPUTS.years),
  };
}

function setText(id, value) {
  const element = getElement(id);
  if (element) {
    element.textContent = value;
  }
}

function renderResults(result, inputs) {
  const decision = getDecision(result);
  const decisionCard = getElement('decisionCard');

  setText('currentPlatformLabel', inputs.currentPlatform);
  setText('targetPlatformLabel', inputs.targetPlatform);
  setText('totalCores', result.totalCores.toLocaleString('en-US'));
  setText('totalSockets', result.totalSockets.toLocaleString('en-US'));
  setText('currentAnnualCost', formatCurrency(result.currentAnnualCost));
  setText('targetAnnualCost', formatCurrency(result.targetAnnualCost));
  setText('annualSavings', formatCurrency(result.annualSavings));
  setText('paybackYears', formatYears(result.paybackYears));
  setText('netSavingsAfterMigration', formatCurrency(result.netSavingsAfterMigration));
  setText('roiPercent', formatPercent(result.roiPercent));
  setText('analysisPeriodLabel', `${inputs.years} ${inputs.years === 1 ? 'year' : 'years'}`);
  setText('decisionLabel', decision.label);
  setText('decisionSummary', decision.summary);

  if (decisionCard) {
    decisionCard.className = `decision-card ${decision.tone}`;
  }
}

function calculateAndRender() {
  const inputs = getInputs();
  const result = calculateRoi(inputs);
  renderResults(result, inputs);
}

function initializeApp() {
  document.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', calculateAndRender);
  });
  calculateAndRender();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeApp);
}

if (typeof module !== 'undefined') {
  module.exports = {
    DEFAULT_INPUTS,
    calculateRoi,
    getDecision,
    formatCurrency,
    formatYears,
    formatPercent,
  };
}
