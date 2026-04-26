const DEFAULT_INPUTS = {
  currentPlatform: 'Virtualization Product 1',
  targetPlatform: 'Virtualization Product 2',
  inputMode: 'topology',
  hosts: 10,
  socketsPerHost: 2,
  coresPerSocket: 24,
  totalSockets: 20,
  totalCores: 480,
  currentPricingMetric: 'core',
  targetPricingMetric: 'socket',
  currentUnitPricePerYear: 400,
  targetUnitPricePerYear: 4500,
  currentAdditionalAnnualCost: 0,
  targetAdditionalAnnualCost: 0,
  migrationCost: 40000,
  hardwareCost: 0,
  renewalCost: 0,
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

function resolveCapacity(inputs) {
  if (inputs.inputMode === 'absolute') {
    return {
      totalSockets: toFiniteNumber(inputs.totalSockets),
      totalCores: toFiniteNumber(inputs.totalCores),
    };
  }

  const hosts = toFiniteNumber(inputs.hosts);
  const socketsPerHost = toFiniteNumber(inputs.socketsPerHost);
  const coresPerSocket = toFiniteNumber(inputs.coresPerSocket);

  return {
    totalSockets: hosts * socketsPerHost,
    totalCores: hosts * socketsPerHost * coresPerSocket,
  };
}

function calculateLicenseCost(metric, unitPrice, totalSockets, totalCores) {
  const quantity = metric === 'socket' ? totalSockets : totalCores;
  return quantity * toFiniteNumber(unitPrice);
}

function calculateRoi(inputs) {
  const { totalSockets, totalCores } = resolveCapacity(inputs);
  const currentPricingMetric = inputs.currentPricingMetric || DEFAULT_INPUTS.currentPricingMetric;
  const targetPricingMetric = inputs.targetPricingMetric || DEFAULT_INPUTS.targetPricingMetric;
  const currentUnitPricePerYear = inputs.currentUnitPricePerYear ?? inputs.currentPricePerCorePerYear ?? DEFAULT_INPUTS.currentUnitPricePerYear;
  const targetUnitPricePerYear = inputs.targetUnitPricePerYear ?? inputs.targetPricePerSocketPerYear ?? DEFAULT_INPUTS.targetUnitPricePerYear;
  const currentAdditionalAnnualCost = toFiniteNumber(inputs.currentAdditionalAnnualCost);
  const targetAdditionalAnnualCost = toFiniteNumber(inputs.targetAdditionalAnnualCost);
  const migrationCost = toFiniteNumber(inputs.migrationCost);
  const hardwareCost = toFiniteNumber(inputs.hardwareCost);
  const renewalCost = toFiniteNumber(inputs.renewalCost);
  const oneTimeCosts = migrationCost + hardwareCost + renewalCost;
  const years = toFiniteNumber(inputs.years, DEFAULT_INPUTS.years);

  const currentLicenseAnnualCost = calculateLicenseCost(currentPricingMetric, currentUnitPricePerYear, totalSockets, totalCores);
  const targetLicenseAnnualCost = calculateLicenseCost(targetPricingMetric, targetUnitPricePerYear, totalSockets, totalCores);
  const currentAnnualCost = currentLicenseAnnualCost + currentAdditionalAnnualCost;
  const targetAnnualCost = targetLicenseAnnualCost + targetAdditionalAnnualCost;
  const annualSavings = currentAnnualCost - targetAnnualCost;
  const totalSavingsOverPeriod = annualSavings * years;
  const netSavingsAfterMigration = totalSavingsOverPeriod - oneTimeCosts;
  const paybackYears = annualSavings > 0 ? oneTimeCosts / annualSavings : null;
  const roiPercent = oneTimeCosts > 0 ? roundTo((netSavingsAfterMigration / oneTimeCosts) * 100, 2) : null;

  const result = {
    totalCores,
    totalSockets,
    currentLicenseAnnualCost,
    targetLicenseAnnualCost,
    currentAnnualCost,
    targetAnnualCost,
    oneTimeCosts,
    annualSavings,
    totalSavingsOverPeriod,
    netSavingsAfterMigration,
    paybackYears,
    roiPercent,
  };

  Object.defineProperty(result, 'migrationCost', {
    value: oneTimeCosts,
    enumerable: false,
  });

  return result;
}

function buildChartSeries(result, years) {
  const horizon = Math.max(1, Math.round(toFiniteNumber(years, DEFAULT_INPUTS.years)));
  const points = [];

  for (let year = 0; year <= horizon; year += 1) {
    const currentCost = result.currentAnnualCost * year;
    const targetCost = result.targetAnnualCost * year + toFiniteNumber(result.migrationCost);
    points.push({
      year,
      currentCost,
      targetCost,
      netSavings: currentCost - targetCost,
    });
  }

  return points;
}

function getDecision(result) {
  if (result.annualSavings > 0 && result.paybackYears !== null && result.paybackYears <= 1) {
    return {
      label: 'Strong case',
      tone: 'strong',
      summary: 'The financial case is strong: annual savings recover one-time costs in about a year or less.',
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
    summary: 'Savings are too low, negative, or take too long to recover the one-time investment.',
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

function getValue(id, fallback = '') {
  const element = getElement(id);
  return element ? element.value : fallback;
}

function setText(id, value) {
  const element = getElement(id);
  if (element) {
    element.textContent = value;
  }
}

function getInputs() {
  return {
    currentPlatform: getValue('currentPlatform', DEFAULT_INPUTS.currentPlatform).trim() || DEFAULT_INPUTS.currentPlatform,
    targetPlatform: getValue('targetPlatform', DEFAULT_INPUTS.targetPlatform).trim() || DEFAULT_INPUTS.targetPlatform,
    inputMode: getValue('inputMode', DEFAULT_INPUTS.inputMode),
    hosts: toFiniteNumber(getValue('hosts', DEFAULT_INPUTS.hosts)),
    socketsPerHost: toFiniteNumber(getValue('socketsPerHost', DEFAULT_INPUTS.socketsPerHost)),
    coresPerSocket: toFiniteNumber(getValue('coresPerSocket', DEFAULT_INPUTS.coresPerSocket)),
    totalSockets: toFiniteNumber(getValue('absoluteSockets', DEFAULT_INPUTS.totalSockets)),
    totalCores: toFiniteNumber(getValue('absoluteCores', DEFAULT_INPUTS.totalCores)),
    currentPricingMetric: getValue('currentPricingMetric', DEFAULT_INPUTS.currentPricingMetric),
    targetPricingMetric: getValue('targetPricingMetric', DEFAULT_INPUTS.targetPricingMetric),
    currentUnitPricePerYear: toFiniteNumber(getValue('currentUnitPricePerYear', DEFAULT_INPUTS.currentUnitPricePerYear)),
    targetUnitPricePerYear: toFiniteNumber(getValue('targetUnitPricePerYear', DEFAULT_INPUTS.targetUnitPricePerYear)),
    currentAdditionalAnnualCost: toFiniteNumber(getValue('currentAdditionalAnnualCost', DEFAULT_INPUTS.currentAdditionalAnnualCost)),
    targetAdditionalAnnualCost: toFiniteNumber(getValue('targetAdditionalAnnualCost', DEFAULT_INPUTS.targetAdditionalAnnualCost)),
    migrationCost: toFiniteNumber(getValue('migrationCost', DEFAULT_INPUTS.migrationCost)),
    hardwareCost: toFiniteNumber(getValue('hardwareCost', DEFAULT_INPUTS.hardwareCost)),
    renewalCost: toFiniteNumber(getValue('renewalCost', DEFAULT_INPUTS.renewalCost)),
    years: toFiniteNumber(getValue('years', DEFAULT_INPUTS.years), DEFAULT_INPUTS.years),
  };
}

function toggleInputMode(inputMode) {
  const topologyFields = getElement('topologyFields');
  const absoluteFields = getElement('absoluteFields');

  if (topologyFields && absoluteFields) {
    const isAbsolute = inputMode === 'absolute';
    topologyFields.hidden = isAbsolute;
    absoluteFields.hidden = !isAbsolute;
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
  setText('currentLicenseAnnualCost', formatCurrency(result.currentLicenseAnnualCost));
  setText('targetLicenseAnnualCost', formatCurrency(result.targetLicenseAnnualCost));
  setText('currentAdditionalCostDisplay', formatCurrency(inputs.currentAdditionalAnnualCost));
  setText('targetAdditionalCostDisplay', formatCurrency(inputs.targetAdditionalAnnualCost));
  setText('migrationCostDisplay', formatCurrency(inputs.migrationCost));
  setText('hardwareCostDisplay', formatCurrency(inputs.hardwareCost));
  setText('renewalCostDisplay', formatCurrency(inputs.renewalCost));
  setText('oneTimeCosts', formatCurrency(result.oneTimeCosts));
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

function drawChart(canvas, series, keys, colors, formatter) {
  if (!canvas || typeof canvas.getContext !== 'function') {
    return;
  }

  const context = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, rect.width || canvas.clientWidth || 640);
  const height = 280;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  context.scale(dpr, dpr);
  context.clearRect(0, 0, width, height);

  const padding = { top: 18, right: 20, bottom: 42, left: 72 };
  const values = series.flatMap((point) => keys.map((key) => point[key]));
  const maxValue = Math.max(...values, 0);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const xFor = (index) => padding.left + (plotWidth * index) / (series.length - 1 || 1);
  const yFor = (value) => padding.top + plotHeight - ((value - minValue) / range) * plotHeight;

  context.strokeStyle = '#d9e1ef';
  context.lineWidth = 1;
  context.fillStyle = '#5b6475';
  context.font = '12px system-ui, sans-serif';

  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (plotHeight * i) / 4;
    const value = maxValue - (range * i) / 4;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.fillText(formatter(value), 8, y + 4);
  }

  series.forEach((point, index) => {
    const x = xFor(index);
    context.fillStyle = '#5b6475';
    context.fillText(`Y${point.year}`, x - 8, height - 14);
  });

  keys.forEach((key, keyIndex) => {
    context.strokeStyle = colors[keyIndex];
    context.lineWidth = 3;
    context.beginPath();
    series.forEach((point, index) => {
      const x = xFor(index);
      const y = yFor(point[key]);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();

    series.forEach((point, index) => {
      context.fillStyle = colors[keyIndex];
      context.beginPath();
      context.arc(xFor(index), yFor(point[key]), 4, 0, Math.PI * 2);
      context.fill();
    });
  });
}

function renderCharts(result, inputs) {
  const series = buildChartSeries(result, inputs.years);
  drawChart(
    getElement('costChart'),
    series,
    ['currentCost', 'targetCost'],
    ['#2155d6', '#0f8f5f'],
    formatCurrency,
  );
  drawChart(
    getElement('savingsChart'),
    series,
    ['netSavings'],
    ['#7c3aed'],
    formatCurrency,
  );
}

function calculateAndRender() {
  const inputs = getInputs();
  const result = calculateRoi(inputs);
  toggleInputMode(inputs.inputMode);
  renderResults(result, inputs);
  renderCharts(result, inputs);
}

function activateTab(target) {
  document.querySelectorAll('[data-tab-target]').forEach((tab) => {
    const isActive = tab.dataset.tabTarget === target;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  document.querySelectorAll('[data-tab-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.tabPanel !== target;
  });
  calculateAndRender();
}

function initializeTabs() {
  document.querySelectorAll('[data-tab-target]').forEach((button) => {
    button.addEventListener('click', () => {
      activateTab(button.dataset.tabTarget);
    });
  });

  document.querySelectorAll('[data-tab-link]').forEach((link) => {
    link.addEventListener('click', () => {
      activateTab(link.dataset.tabLink);
    });
  });
}

function initializeApp() {
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', (event) => event.preventDefault());
  }

  document.querySelectorAll('input, select').forEach((input) => {
    input.addEventListener('input', calculateAndRender);
    input.addEventListener('change', calculateAndRender);
  });
  initializeTabs();
  calculateAndRender();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeApp);
  window.addEventListener('resize', calculateAndRender);
}

if (typeof module !== 'undefined') {
  module.exports = {
    DEFAULT_INPUTS,
    calculateRoi,
    buildChartSeries,
    getDecision,
    formatCurrency,
    formatYears,
    formatPercent,
  };
}
