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
  currency: 'USD',
  costInputPeriod: 'annual',
};

const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: '日本語' },
  { code: 'de', name: 'Deutsch' },
];

const CURRENCY_OPTIONS = [
  { code: 'USD', name: 'USD · US Dollar' },
  { code: 'EUR', name: 'EUR · Euro' },
  { code: 'GBP', name: 'GBP · Pound Sterling' },
  { code: 'JPY', name: 'JPY · Japanese Yen' },
  { code: 'BRL', name: 'BRL · Brazilian Real' },
];

const COST_PERIOD_OPTIONS = [
  { code: 'annual', labelKey: 'options.costPeriodAnnual' },
  { code: 'total', labelKey: 'options.costPeriodTotal' },
];

const SCENARIO_STORAGE_KEY = 'virtroi.scenarios';

const SHAREABLE_INPUT_KEYS = Object.keys(DEFAULT_INPUTS);

const NUMERIC_INPUT_KEYS = new Set([
  'hosts',
  'socketsPerHost',
  'coresPerSocket',
  'totalSockets',
  'totalCores',
  'currentUnitPricePerYear',
  'targetUnitPricePerYear',
  'currentAdditionalAnnualCost',
  'targetAdditionalAnnualCost',
  'migrationCost',
  'hardwareCost',
  'renewalCost',
  'years',
]);

let translationsCache = null;

function loadTranslations() {
  if (translationsCache) return translationsCache;

  if (typeof window !== 'undefined' && window.VirtROILocales) {
    translationsCache = window.VirtROILocales;
    return translationsCache;
  }

  if (typeof require !== 'undefined') {
    translationsCache = Object.fromEntries(LANGUAGE_OPTIONS.map((option) => [option.code, require(`./locales/${option.code}.js`)]));
    return translationsCache;
  }

  translationsCache = {};
  return translationsCache;
}

function getLanguageOptions() {
  return LANGUAGE_OPTIONS.map((option) => ({ ...option }));
}

function getCurrencyOptions() {
  return CURRENCY_OPTIONS.map((option) => ({ ...option }));
}

function getCostPeriodOptions() {
  return COST_PERIOD_OPTIONS.map((option) => ({ ...option }));
}

function getPricingMetricLabelKey(metric, costInputPeriod = DEFAULT_INPUTS.costInputPeriod) {
  if (costInputPeriod === 'total') {
    return metric === 'socket' ? 'options.socketTotal' : 'options.coreTotal';
  }
  return metric === 'socket' ? 'options.socketYear' : 'options.coreYear';
}

function getUnitPriceLabelKey(costInputPeriod = DEFAULT_INPUTS.costInputPeriod) {
  return costInputPeriod === 'total' ? 'forms.unitPriceTotal' : 'forms.unitPriceYear';
}

function shouldUseDashedSegment(previousPoint, currentPoint) {
  return Boolean((previousPoint && previousPoint.projected) || (currentPoint && currentPoint.projected));
}

function buildDashedLineSegments(from, to, dashLength = 12, gapLength = 10) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return [];

  const segments = [];
  const ux = dx / distance;
  const uy = dy / distance;
  let cursor = 0;

  while (cursor < distance) {
    const start = cursor;
    const end = Math.min(cursor + dashLength, distance);
    segments.push({
      from: {
        x: from.x + ux * start,
        y: from.y + uy * start,
      },
      to: {
        x: from.x + ux * end,
        y: from.y + uy * end,
      },
    });
    cursor += dashLength + gapLength;
  }

  return segments;
}

function translate(language, key, replacements = {}) {
  const translations = loadTranslations();
  const template = (translations[language] && translations[language][key]) || (translations.en && translations.en[key]) || key;
  return Object.entries(replacements).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), template);
}

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

function annualizeCost(value, costInputPeriod, years) {
  const amount = toFiniteNumber(value);
  return costInputPeriod === 'total' ? amount / Math.max(1, years) : amount;
}

function calculateRoi(inputs) {
  const { totalSockets, totalCores } = resolveCapacity(inputs);
  const currentPricingMetric = inputs.currentPricingMetric || DEFAULT_INPUTS.currentPricingMetric;
  const targetPricingMetric = inputs.targetPricingMetric || DEFAULT_INPUTS.targetPricingMetric;
  const years = toFiniteNumber(inputs.years, DEFAULT_INPUTS.years);
  const costInputPeriod = inputs.costInputPeriod || DEFAULT_INPUTS.costInputPeriod;
  const currentUnitPricePerYear = annualizeCost(inputs.currentUnitPricePerYear ?? inputs.currentPricePerCorePerYear ?? DEFAULT_INPUTS.currentUnitPricePerYear, costInputPeriod, years);
  const targetUnitPricePerYear = annualizeCost(inputs.targetUnitPricePerYear ?? inputs.targetPricePerSocketPerYear ?? DEFAULT_INPUTS.targetUnitPricePerYear, costInputPeriod, years);
  const currentAdditionalAnnualCost = annualizeCost(inputs.currentAdditionalAnnualCost, costInputPeriod, years);
  const targetAdditionalAnnualCost = annualizeCost(inputs.targetAdditionalAnnualCost, costInputPeriod, years);
  const migrationCost = toFiniteNumber(inputs.migrationCost);
  const hardwareCost = toFiniteNumber(inputs.hardwareCost);
  const renewalCost = toFiniteNumber(inputs.renewalCost);
  const oneTimeCosts = migrationCost + hardwareCost + renewalCost;

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

function buildChartSeries(result, years, extraProjectionYears = 2) {
  const analysisHorizon = Math.max(1, Math.round(toFiniteNumber(years, DEFAULT_INPUTS.years)));
  const projectionYears = Math.max(0, Math.round(toFiniteNumber(extraProjectionYears, 2)));
  const horizon = analysisHorizon + projectionYears;
  const points = [];

  for (let year = 0; year <= horizon; year += 1) {
    const currentCost = result.currentAnnualCost * year;
    const targetCost = result.targetAnnualCost * year + toFiniteNumber(result.oneTimeCosts ?? result.migrationCost);
    points.push({
      year,
      currentCost,
      targetCost,
      netSavings: currentCost - targetCost,
      projected: year > analysisHorizon,
    });
  }

  return points;
}

function computeBreakEvenUnitPrices(result, inputs) {
  const years = Math.max(1, Math.round(toFiniteNumber(inputs.years, DEFAULT_INPUTS.years)));
  const oneTimeCosts = toFiniteNumber(result.oneTimeCosts ?? result.migrationCost);
  const currentQuantity = (inputs.currentPricingMetric || DEFAULT_INPUTS.currentPricingMetric) === 'socket' ? result.totalSockets : result.totalCores;
  const targetQuantity = (inputs.targetPricingMetric || DEFAULT_INPUTS.targetPricingMetric) === 'socket' ? result.totalSockets : result.totalCores;
  const currentAdditionalAnnualCost = result.currentAnnualCost - result.currentLicenseAnnualCost;
  const targetAdditionalAnnualCost = result.targetAnnualCost - result.targetLicenseAnnualCost;

  const targetUnitPrice = targetQuantity > 0
    ? roundTo((result.currentAnnualCost * years - targetAdditionalAnnualCost * years - oneTimeCosts) / (targetQuantity * years), 2)
    : null;
  const currentUnitPrice = currentQuantity > 0
    ? roundTo((result.targetAnnualCost * years + oneTimeCosts - currentAdditionalAnnualCost * years) / (currentQuantity * years), 2)
    : null;

  return { currentUnitPrice, targetUnitPrice };
}

function encodeInputsToQuery(inputs) {
  const params = new URLSearchParams();
  SHAREABLE_INPUT_KEYS.forEach((key) => {
    if (inputs[key] !== undefined && inputs[key] !== null && inputs[key] !== '') {
      params.set(key, String(inputs[key]));
    }
  });
  return params.toString();
}

function decodeInputsFromQuery(search) {
  const params = new URLSearchParams(search || '');
  const inputs = {};
  SHAREABLE_INPUT_KEYS.forEach((key) => {
    if (!params.has(key)) return;
    const raw = params.get(key);
    inputs[key] = NUMERIC_INPUT_KEYS.has(key) ? toFiniteNumber(raw, DEFAULT_INPUTS[key]) : raw;
  });
  return inputs;
}

function buildScenarioComparison(scenarios) {
  return scenarios.map((scenario) => {
    const result = calculateRoi(scenario.inputs || {});
    const decision = getDecision(result);
    return {
      name: scenario.name || '',
      annualSavings: result.annualSavings,
      paybackYears: result.paybackYears,
      netSavingsAfterMigration: result.netSavingsAfterMigration,
      roiPercent: result.roiPercent,
      tone: decision.tone,
    };
  });
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

function formatCurrency(value, currency = DEFAULT_INPUTS.currency) {
  const amount = toFiniteNumber(value);
  const absolute = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(absolute);
  return amount < 0 ? `-${formatted}` : formatted;
}

function formatYears(value, language = 'en') {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return translate(language, 'format.noPayback');
  }
  const rounded = roundTo(value, 2);
  const yearLabel = translate(language, rounded === 1 ? 'format.year' : 'format.years');
  return `${rounded.toLocaleString('en-US')} ${yearLabel}`;
}

function formatPercent(value, language = 'en') {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return translate(language, 'format.notAvailable');
  }
  return `${roundTo(value, 1).toLocaleString('en-US')}%`;
}

function buildReportModel(inputs, result, language = 'en', currency = DEFAULT_INPUTS.currency) {
  const currentPlatform = inputs.currentPlatform || DEFAULT_INPUTS.currentPlatform;
  const targetPlatform = inputs.targetPlatform || DEFAULT_INPUTS.targetPlatform;
  const years = toFiniteNumber(inputs.years, DEFAULT_INPUTS.years);
  const yearLabel = translate(language, years === 1 ? 'format.year' : 'format.years');

  return {
    title: translate(language, 'report.generatedTitle'),
    summary: translate(language, 'report.summary', {
      currentPlatform,
      targetPlatform,
      annualSavings: formatCurrency(result.annualSavings, currency),
      payback: formatYears(result.paybackYears, language),
      netSavings: formatCurrency(result.netSavingsAfterMigration, currency),
      years,
      yearLabel,
    }),
    metrics: [
      { label: translate(language, 'report.metric.currentAnnualCost', { platform: currentPlatform }), value: formatCurrency(result.currentAnnualCost, currency) },
      { label: translate(language, 'report.metric.targetAnnualCost', { platform: targetPlatform }), value: formatCurrency(result.targetAnnualCost, currency) },
      { label: translate(language, 'report.metric.annualSavings'), value: formatCurrency(result.annualSavings, currency) },
      { label: translate(language, 'report.metric.oneTimeCosts'), value: formatCurrency(result.oneTimeCosts, currency) },
      { label: translate(language, 'report.metric.paybackPeriod'), value: formatYears(result.paybackYears, language) },
      { label: translate(language, 'report.metric.netSavings'), value: formatCurrency(result.netSavingsAfterMigration, currency) },
      { label: translate(language, 'report.metric.roi'), value: formatPercent(result.roiPercent, language) },
      {
        label: translate(language, 'report.metric.capacity'),
        value: translate(language, 'report.metric.capacityValue', {
          cores: result.totalCores.toLocaleString('en-US'),
          sockets: result.totalSockets.toLocaleString('en-US'),
        }),
      },
    ],
    chartSlots: [
      { id: 'costChart', title: translate(language, 'charts.costTitle') },
      { id: 'savingsChart', title: translate(language, 'charts.netSavingsTitle') },
    ],
    yearlyRows: buildChartSeries(result, years).map((point) => ({
      year: point.year,
      projected: point.projected,
      currentCost: point.currentCost,
      targetCost: point.targetCost,
      netSavings: point.netSavings,
    })),
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

function setHtml(id, value) {
  const element = getElement(id);
  if (element) {
    element.innerHTML = value;
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
    currency: getValue('currencySelect', DEFAULT_INPUTS.currency),
    costInputPeriod: getValue('costInputPeriod', DEFAULT_INPUTS.costInputPeriod),
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

function refreshPricingPeriodLabels(inputs = getInputs()) {
  const language = getCurrentLanguage();
  const period = inputs.costInputPeriod || DEFAULT_INPUTS.costInputPeriod;
  const unitPriceLabel = translate(language, getUnitPriceLabelKey(period));

  setText('currentUnitPriceLabel', unitPriceLabel);
  setText('targetUnitPriceLabel', unitPriceLabel);

  [
    { id: 'currentPricingMetric', metric: inputs.currentPricingMetric || DEFAULT_INPUTS.currentPricingMetric },
    { id: 'targetPricingMetric', metric: inputs.targetPricingMetric || DEFAULT_INPUTS.targetPricingMetric },
  ].forEach(({ id }) => {
    const select = getElement(id);
    if (!select) return;

    Array.from(select.options).forEach((option) => {
      option.textContent = translate(language, getPricingMetricLabelKey(option.value, period));
    });
  });
}

function getCurrentLanguage() {
  return getValue('languageSelect', 'en') || 'en';
}

function getCurrentCurrency() {
  return getValue('currencySelect', DEFAULT_INPUTS.currency) || DEFAULT_INPUTS.currency;
}

function applyTranslations(language = getCurrentLanguage()) {
  if (typeof document === 'undefined') return;

  document.documentElement.lang = language;
  document.title = translate(language, 'page.title');
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute('content', translate(language, 'page.description'));
  }

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = translate(language, element.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
    element.dataset.i18nAttr.split(';').forEach((mapping) => {
      const [attribute, key] = mapping.split(':');
      if (attribute && key) {
        element.setAttribute(attribute, translate(language, key));
      }
    });
  });
}

function initializeCurrencySelector() {
  const selector = getElement('currencySelect');
  if (!selector) return;

  selector.innerHTML = getCurrencyOptions()
    .map((option) => `<option value="${option.code}">${option.name}</option>`)
    .join('');
  selector.value = DEFAULT_INPUTS.currency;
  selector.addEventListener('change', calculateAndRender);
}

function initializeCostPeriodSelector() {
  const selector = getElement('costInputPeriod');
  if (!selector) return;

  const selectedValue = selector.value || DEFAULT_INPUTS.costInputPeriod;
  selector.innerHTML = getCostPeriodOptions()
    .map((option) => `<option value="${option.code}">${translate(getCurrentLanguage(), option.labelKey)}</option>`)
    .join('');
  selector.value = getCostPeriodOptions().some((option) => option.code === selectedValue) ? selectedValue : DEFAULT_INPUTS.costInputPeriod;
  if (!selector.dataset.initialized) {
    selector.addEventListener('change', calculateAndRender);
    selector.dataset.initialized = 'true';
  }
}

function initializeLanguageSelector() {
  const selector = getElement('languageSelect');
  if (!selector) return;

  selector.innerHTML = getLanguageOptions()
    .map((option) => `<option value="${option.code}">${option.name}</option>`)
    .join('');
  selector.value = 'en';
  selector.addEventListener('change', () => {
    applyTranslations(selector.value);
    initializeCostPeriodSelector();
    calculateAndRender();
  });
}

function getChartImage(id) {
  const canvas = getElement(id);
  if (!canvas || typeof canvas.toDataURL !== 'function') return '';

  try {
    return canvas.toDataURL('image/png');
  } catch (error) {
    return '';
  }
}

function generateReport() {
  const reportBody = getElement('reportBody');
  if (!reportBody) return;

  const inputs = getInputs();
  const result = calculateRoi(inputs);
  renderCharts(result, inputs);
  const language = getCurrentLanguage();
  const currency = inputs.currency || getCurrentCurrency();
  const report = buildReportModel(inputs, result, language, currency);
  const chartFigures = report.chartSlots
    .map((slot) => ({ title: slot.title, image: getChartImage(slot.id) }))
    .filter((figure) => figure.image);
  const hasProjectedRows = report.yearlyRows.some((row) => row.projected);

  reportBody.innerHTML = `
    <article class="generated-report">
      <h1>${escapeHtml(report.title)}</h1>
      <section>
        <h2>${escapeHtml(translate(language, 'report.summaryHeading'))}</h2>
        <p>${escapeHtml(report.summary)}</p>
      </section>
      <section>
        <h2>${escapeHtml(translate(language, 'report.metricsHeading'))}</h2>
        <dl class="report-metrics">
          ${report.metrics.map((metric) => `<div><dt>${escapeHtml(metric.label)}</dt><dd>${escapeHtml(metric.value)}</dd></div>`).join('')}
        </dl>
      </section>
      <section>
        <h2>${escapeHtml(translate(language, 'report.yearlyHeading'))}</h2>
        <div class="report-table-wrap">
          <table class="report-year-table">
            <thead>
              <tr>
                <th>${escapeHtml(translate(language, 'report.col.year'))}</th>
                <th>${escapeHtml(translate(language, 'report.col.cumulative', { platform: inputs.currentPlatform }))}</th>
                <th>${escapeHtml(translate(language, 'report.col.cumulative', { platform: inputs.targetPlatform }))}</th>
                <th>${escapeHtml(translate(language, 'report.col.netSavings'))}</th>
              </tr>
            </thead>
            <tbody>
              ${report.yearlyRows.map((row) => `<tr${row.projected ? ' class="projected"' : ''}>
                <td>Y${row.year}${row.projected ? '*' : ''}</td>
                <td>${escapeHtml(formatCurrency(row.currentCost, currency))}</td>
                <td>${escapeHtml(formatCurrency(row.targetCost, currency))}</td>
                <td>${escapeHtml(formatCurrency(row.netSavings, currency))}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        ${hasProjectedRows ? `<p class="report-note">${escapeHtml(translate(language, 'report.projectedNote'))}</p>` : ''}
      </section>
      <section>
        <h2>${escapeHtml(translate(language, 'report.chartsHeading'))}</h2>
        <div class="report-chart-grid">
          ${chartFigures.map((figure) => `<figure><figcaption>${escapeHtml(figure.title)}</figcaption><img src="${figure.image}" alt="${escapeHtml(figure.title)}" /></figure>`).join('')}
        </div>
      </section>
      <section>
        <h2>${escapeHtml(translate(language, 'report.notesHeading'))}</h2>
        <p>${escapeHtml(translate(language, 'report.notesPlaceholder'))}</p>
      </section>
    </article>`;
}

function ensureGeneratedReport() {
  const reportBody = getElement('reportBody');
  if (!reportBody) return null;
  if (!reportBody.querySelector('.generated-report')) {
    generateReport();
  }
  return reportBody;
}

function buildDownloadFilename(baseName, extension, date = new Date()) {
  const stamp = date.toISOString().slice(0, 10);
  const safeBaseName = String(baseName || 'virtroi-report')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'virtroi-report';
  const safeExtension = String(extension || '').replace(/^\.+/, '') || 'html';
  return `${safeBaseName}-${stamp}.${safeExtension}`;
}

function downloadBlob(blob, filename) {
  if (typeof document === 'undefined' || typeof URL === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadReportAsHtml() {
  const reportBody = ensureGeneratedReport();
  if (!reportBody || typeof Blob === 'undefined') return;
  const language = getCurrentLanguage();
  const title = translate(language, 'report.generatedTitle');
  const html = `<!DOCTYPE html>
<html lang="${escapeHtml(language)}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; padding: 32px; color: #111827; background: #f5f7fb; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .report-document { max-width: 980px; margin: 0 auto; border: 1px solid #d9e1ef; border-radius: 24px; padding: 32px; background: #fff; }
    h1 { margin-top: 0; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -0.055em; }
    h2 { margin-top: 28px; }
    .report-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .report-metrics div { border: 1px solid #d9e1ef; border-radius: 16px; padding: 14px; background: #fbfdff; }
    .report-metrics dt { color: #5b6475; font-size: 0.82rem; font-weight: 850; text-transform: uppercase; }
    .report-metrics dd { margin: 4px 0 0; font-size: 1.35rem; font-weight: 850; }
    .report-chart-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .report-chart-grid figure { margin: 0; }
    .report-chart-grid figcaption { margin-bottom: 6px; font-weight: 850; }
    .report-chart-grid img { width: 100%; border: 1px solid #d9e1ef; border-radius: 16px; }
    .report-table-wrap { overflow-x: auto; }
    .report-year-table { width: 100%; border-collapse: collapse; }
    .report-year-table th, .report-year-table td { border-bottom: 1px solid #d9e1ef; padding: 9px 12px; text-align: right; white-space: nowrap; }
    .report-year-table th:first-child, .report-year-table td:first-child { text-align: left; }
    .report-year-table th { color: #5b6475; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .report-year-table tr.projected td { color: #8a5a12; }
    .report-note { color: #8a5a12; font-size: 0.88rem; }
    @media (max-width: 720px) { body { padding: 16px; } .report-document, .report-metrics, .report-chart-grid { display: block; } .report-metrics div, .report-chart-grid img { margin-bottom: 12px; } }
  </style>
</head>
<body>
  <main class="report-document">
    ${reportBody.innerHTML}
  </main>
</body>
</html>`;
  downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), buildDownloadFilename('virtroi-report', 'html'));
}

function downloadCanvasAsPng(canvas, filename) {
  if (!canvas) return;
  if (typeof canvas.toBlob === 'function') {
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, filename);
    }, 'image/png');
    return;
  }
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function downloadGraphsAsPng() {
  const inputs = getInputs();
  const result = calculateRoi(inputs);
  renderCharts(result, inputs);

  const language = getCurrentLanguage();
  const charts = [
    { title: translate(language, 'charts.costTitle'), canvas: getElement('costChart') },
    { title: translate(language, 'charts.netSavingsTitle'), canvas: getElement('savingsChart') },
  ].filter((chart) => chart.canvas);
  if (!charts.length || typeof document === 'undefined') return;

  const gap = 28;
  const titleHeight = 36;
  const padding = 24;
  const width = Math.max(...charts.map((chart) => chart.canvas.width || 640)) + padding * 2;
  const height = charts.reduce((total, chart) => total + titleHeight + (chart.canvas.height || 280) + gap, padding * 2 - gap);
  const combined = document.createElement('canvas');
  combined.width = width;
  combined.height = height;
  const context = combined.getContext('2d');
  if (!context) return;

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#111827';
  context.font = '700 24px system-ui, sans-serif';
  context.fillText('VirtROI graphs', padding, padding + 8);

  let y = padding + titleHeight;
  charts.forEach((chart) => {
    context.fillStyle = '#111827';
    context.font = '700 18px system-ui, sans-serif';
    context.fillText(chart.title, padding, y);
    y += 12;
    context.drawImage(chart.canvas, padding, y);
    y += (chart.canvas.height || 280) + gap;
  });

  downloadCanvasAsPng(combined, buildDownloadFilename('virtroi-graphs', 'png'));
}

function exportReportToPdf() {
  ensureGeneratedReport();
  if (typeof window !== 'undefined' && typeof window.print === 'function') {
    window.print();
  }
}

function renderResults(result, inputs) {
  const language = getCurrentLanguage();
  const currency = inputs.currency || getCurrentCurrency();
  const decision = getDecision(result);
  const decisionCard = getElement('decisionCard');
  const periodLabel = `${inputs.years} ${translate(language, inputs.years === 1 ? 'format.year' : 'format.years')}`;
  const currentLicense = formatCurrency(result.currentLicenseAnnualCost, currency);
  const currentAddons = formatCurrency(inputs.currentAdditionalAnnualCost, currency);
  const targetLicense = formatCurrency(result.targetLicenseAnnualCost, currency);
  const targetAddons = formatCurrency(inputs.targetAdditionalAnnualCost, currency);
  const migrationCost = formatCurrency(inputs.migrationCost, currency);
  const hardwareCost = formatCurrency(inputs.hardwareCost, currency);
  const renewalCost = formatCurrency(inputs.renewalCost, currency);

  setHtml('currentAnnualCostLabel', `${escapeHtml(inputs.currentPlatform)} ${escapeHtml(translate(language, 'metrics.currentAnnualCost'))}`);
  setHtml('targetAnnualCostLabel', `${escapeHtml(inputs.targetPlatform)} ${escapeHtml(translate(language, 'metrics.targetAnnualCost'))}`);
  setText('totalCores', result.totalCores.toLocaleString('en-US'));
  setText('totalSockets', result.totalSockets.toLocaleString('en-US'));
  setText('currentAnnualCost', formatCurrency(result.currentAnnualCost, currency));
  setText('targetAnnualCost', formatCurrency(result.targetAnnualCost, currency));
  setHtml('currentAnnualCostBreakdown', `${escapeHtml(translate(language, 'metrics.license'))} <span id="currentLicenseAnnualCost">${escapeHtml(currentLicense)}</span> + ${escapeHtml(translate(language, 'metrics.addons'))} <span id="currentAdditionalCostDisplay">${escapeHtml(currentAddons)}</span>`);
  setHtml('targetAnnualCostBreakdown', `${escapeHtml(translate(language, 'metrics.license'))} <span id="targetLicenseAnnualCost">${escapeHtml(targetLicense)}</span> + ${escapeHtml(translate(language, 'metrics.addons'))} <span id="targetAdditionalCostDisplay">${escapeHtml(targetAddons)}</span>`);
  setText('oneTimeCosts', formatCurrency(result.oneTimeCosts, currency));
  setHtml('oneTimeCostsBreakdown', translate(language, 'metrics.oneTimeBreakdown', {
    migration: `<span id="migrationCostDisplay">${escapeHtml(migrationCost)}</span>`,
    hardware: `<span id="hardwareCostDisplay">${escapeHtml(hardwareCost)}</span>`,
    renewals: `<span id="renewalCostDisplay">${escapeHtml(renewalCost)}</span>`,
  }));
  setText('annualSavings', formatCurrency(result.annualSavings, currency));
  setText('paybackYears', formatYears(result.paybackYears, language));
  setText('netSavingsAfterMigration', formatCurrency(result.netSavingsAfterMigration, currency));
  setText('roiPercent', formatPercent(result.roiPercent, language));
  setHtml('analysisPeriodBreakdown', translate(language, 'metrics.overPeriod', {
    period: `<span id="analysisPeriodLabel">${escapeHtml(periodLabel)}</span>`,
  }));
  setText('decisionLabel', translate(language, `decision.${decision.tone}.label`));
  setText('decisionSummary', translate(language, `decision.${decision.tone}.summary`));

  const breakEven = computeBreakEvenUnitPrices(result, inputs);
  const targetUnitLabel = translate(language, getPricingMetricLabelKey(inputs.targetPricingMetric, 'annual'));
  const currentUnitLabel = translate(language, getPricingMetricLabelKey(inputs.currentPricingMetric, 'annual'));
  const notAvailable = translate(language, 'format.notAvailable');
  setText('targetBreakEvenPrice', breakEven.targetUnitPrice === null ? notAvailable : formatCurrency(breakEven.targetUnitPrice, currency));
  setText('breakEvenContext', translate(language, 'metrics.breakEvenDetail', {
    unit: targetUnitLabel.toLowerCase(),
    quote: formatCurrency(result.targetLicenseAnnualCost / Math.max(1, inputs.targetPricingMetric === 'socket' ? result.totalSockets : result.totalCores), currency),
    current: breakEven.currentUnitPrice === null ? notAvailable : formatCurrency(breakEven.currentUnitPrice, currency),
    currentUnit: currentUnitLabel.toLowerCase(),
  }));

  if (decisionCard) {
    decisionCard.className = `decision-card ${decision.tone}`;
  }
}

function drawChartSegment(context, from, to, dashed) {
  const segments = dashed ? buildDashedLineSegments(from, to, 12, 10) : [{ from, to }];
  segments.forEach((segment) => {
    context.beginPath();
    context.moveTo(segment.from.x, segment.from.y);
    context.lineTo(segment.to.x, segment.to.y);
    context.stroke();
  });
}

function formatYearAxisLabel(point) {
  return `Y${point.year}${point.projected ? '*' : ''}`;
}

function drawChart(canvas, series, keys, colors, formatter, options = {}) {
  if (!canvas || typeof canvas.getContext !== 'function') {
    return;
  }

  const axisLabel = options.axisLabel || formatYearAxisLabel;
  const isAccented = options.accent || ((point) => Boolean(point.projected));
  const accentColor = options.accentColor || '#8a5a12';

  const context = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, rect.width || canvas.clientWidth || 640);
  const height = Math.max(220, rect.height || canvas.clientHeight || 280);
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

  if (options.zeroBaseline && minValue < 0 && maxValue > 0) {
    const zeroY = yFor(0);
    context.strokeStyle = '#9aa5b8';
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(padding.left, zeroY);
    context.lineTo(width - padding.right, zeroY);
    context.stroke();
  }

  // Greedily pick axis labels that keep at least ~44px apart, accented points first.
  const pixelsPerIndex = plotWidth / Math.max(1, series.length - 1);
  const minIndexGap = Math.max(1, Math.ceil(44 / Math.max(1, pixelsPerIndex)));
  const labelIndexes = [];
  const tryLabel = (index) => {
    if (labelIndexes.every((other) => Math.abs(other - index) >= minIndexGap)) {
      labelIndexes.push(index);
    }
  };
  series.forEach((point, index) => {
    if (isAccented(point)) tryLabel(index);
  });
  tryLabel(0);
  tryLabel(series.length - 1);
  series.forEach((_, index) => tryLabel(index));

  context.textAlign = 'center';
  labelIndexes.forEach((index) => {
    const point = series[index];
    context.fillStyle = isAccented(point) ? accentColor : '#5b6475';
    context.fillText(axisLabel(point), xFor(index), height - 14);
  });
  context.textAlign = 'left';

  keys.forEach((key, keyIndex) => {
    context.strokeStyle = colors[keyIndex];
    context.lineWidth = 3;
    context.lineCap = 'round';
    series.slice(1).forEach((point, index) => {
      const previousPoint = series[index];
      drawChartSegment(
        context,
        { x: xFor(index), y: yFor(previousPoint[key]) },
        { x: xFor(index + 1), y: yFor(point[key]) },
        shouldUseDashedSegment(previousPoint, point),
      );
    });

    series.forEach((point, index) => {
      context.fillStyle = colors[keyIndex];
      context.beginPath();
      context.arc(xFor(index), yFor(point[key]), 4, 0, Math.PI * 2);
      context.fill();
    });
  });

  canvas.__chartMeta = {
    series,
    keys,
    colors,
    formatter,
    axisLabel,
    seriesLabels: options.seriesLabels || [],
    positions: series.map((_, index) => xFor(index)),
    width,
    height,
  };
}

function findNearestChartIndex(meta, offsetX) {
  let nearest = 0;
  let bestDistance = Infinity;
  meta.positions.forEach((x, index) => {
    const distance = Math.abs(x - offsetX);
    if (distance < bestDistance) {
      bestDistance = distance;
      nearest = index;
    }
  });
  return nearest;
}

function getChartTooltip(card) {
  let tooltip = card.querySelector('.chart-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.hidden = true;
    card.appendChild(tooltip);
  }
  return tooltip;
}

function attachChartHover(canvas) {
  if (!canvas || canvas.dataset.hoverAttached) return;
  canvas.dataset.hoverAttached = 'true';
  const card = canvas.closest('.chart-card');
  if (!card) return;

  const hideTooltip = () => {
    const tooltip = card.querySelector('.chart-tooltip');
    if (tooltip) tooltip.hidden = true;
  };

  canvas.addEventListener('pointermove', (event) => {
    const meta = canvas.__chartMeta;
    if (!meta) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = meta.width / (rect.width || meta.width);
    const index = findNearestChartIndex(meta, (event.clientX - rect.left) * scaleX);
    const point = meta.series[index];
    const tooltip = getChartTooltip(card);
    const rows = meta.keys
      .map((key, keyIndex) => {
        const label = meta.seriesLabels[keyIndex] || key;
        return `<span class="chart-tooltip-row"><i style="background:${meta.colors[keyIndex]}"></i>${escapeHtml(label)}: <strong>${escapeHtml(meta.formatter(point[key]))}</strong></span>`;
      })
      .join('');
    tooltip.innerHTML = `<span class="chart-tooltip-title">${escapeHtml(meta.axisLabel(point))}</span>${rows}`;
    tooltip.hidden = false;

    const cardRect = card.getBoundingClientRect();
    const pointX = meta.positions[index] / scaleX + (rect.left - cardRect.left);
    const clampedX = Math.min(Math.max(pointX, 8 + tooltip.offsetWidth / 2), cardRect.width - tooltip.offsetWidth / 2 - 8);
    tooltip.style.left = `${clampedX}px`;
    tooltip.style.top = `${rect.top - cardRect.top + 10}px`;
  });

  canvas.addEventListener('pointerleave', hideTooltip);
  canvas.addEventListener('pointercancel', hideTooltip);
}

function renderCharts(result, inputs) {
  const series = buildChartSeries(result, inputs.years);
  const language = getCurrentLanguage();
  const currency = inputs.currency || getCurrentCurrency();
  const formatValue = (value) => formatCurrency(value, currency);

  drawChart(getElement('costChart'), series, ['currentCost', 'targetCost'], ['#2155d6', '#0f8f5f'], formatValue, {
    seriesLabels: [
      inputs.currentPlatform || translate(language, 'charts.legendCurrent'),
      inputs.targetPlatform || translate(language, 'charts.legendTarget'),
    ],
  });
  drawChart(getElement('savingsChart'), series, ['netSavings'], ['#7c3aed'], formatValue, {
    seriesLabels: [translate(language, 'charts.legendSavings')],
  });
}

function calculateAndRender() {
  const inputs = getInputs();
  const result = calculateRoi(inputs);
  toggleInputMode(inputs.inputMode);
  refreshPricingPeriodLabels(inputs);
  renderResults(result, inputs);
  renderCharts(result, inputs);
  renderScenarioTable();
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

function loadStoredScenarios() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const list = JSON.parse(localStorage.getItem(SCENARIO_STORAGE_KEY) || '[]');
    return Array.isArray(list) ? list.filter((scenario) => scenario && typeof scenario === 'object' && scenario.inputs) : [];
  } catch (error) {
    return [];
  }
}

function persistScenarios(list) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    /* storage full or blocked; scenarios stay in memory for this session */
  }
}

const INPUT_ELEMENT_IDS = {
  totalSockets: 'absoluteSockets',
  totalCores: 'absoluteCores',
  currency: 'currencySelect',
};

function applyInputsToForm(inputs) {
  SHAREABLE_INPUT_KEYS.forEach((key) => {
    if (inputs[key] === undefined) return;
    const element = getElement(INPUT_ELEMENT_IDS[key] || key);
    if (element) {
      element.value = String(inputs[key]);
    }
  });
}

function renderScenarioTable() {
  const wrap = getElement('scenarioTable');
  if (!wrap) return;

  const language = getCurrentLanguage();
  const stored = loadStoredScenarios();
  const scenarios = [{ name: translate(language, 'scenarios.current'), inputs: getInputs(), live: true }, ...stored];
  const rows = buildScenarioComparison(scenarios);

  const cells = rows
    .map((row, index) => {
      const scenario = scenarios[index];
      const currency = (scenario.inputs && scenario.inputs.currency) || DEFAULT_INPUTS.currency;
      const actions = scenario.live
        ? ''
        : `<button type="button" class="table-action" data-action="load" data-index="${index - 1}">${escapeHtml(translate(language, 'scenarios.load'))}</button>
           <button type="button" class="table-action danger" data-action="delete" data-index="${index - 1}">${escapeHtml(translate(language, 'scenarios.delete'))}</button>`;
      return `<tr${scenario.live ? ' class="live"' : ''}>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(formatCurrency(row.annualSavings, currency))}</td>
        <td>${escapeHtml(formatYears(row.paybackYears, language))}</td>
        <td>${escapeHtml(formatCurrency(row.netSavingsAfterMigration, currency))}</td>
        <td>${escapeHtml(formatPercent(row.roiPercent, language))}</td>
        <td><span class="scenario-signal ${row.tone}">${escapeHtml(translate(language, `decision.${row.tone}.label`))}</span></td>
        <td class="scenario-actions-cell">${actions}</td>
      </tr>`;
    })
    .join('');

  wrap.innerHTML = `
    <div class="scenario-table-scroll">
      <table class="scenario-table">
        <thead>
          <tr>
            <th>${escapeHtml(translate(language, 'scenarios.col.scenario'))}</th>
            <th>${escapeHtml(translate(language, 'scenarios.col.annualSavings'))}</th>
            <th>${escapeHtml(translate(language, 'scenarios.col.payback'))}</th>
            <th>${escapeHtml(translate(language, 'scenarios.col.netSavings'))}</th>
            <th>${escapeHtml(translate(language, 'scenarios.col.roi'))}</th>
            <th>${escapeHtml(translate(language, 'scenarios.col.decision'))}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${cells}</tbody>
      </table>
    </div>
    ${stored.length ? '' : `<p class="scenario-empty">${escapeHtml(translate(language, 'scenarios.empty'))}</p>`}`;
}

function buildShareUrl() {
  const query = encodeInputsToQuery(getInputs());
  if (typeof window === 'undefined') return `?${query}`;
  return `${window.location.origin}${window.location.pathname}?${query}`;
}

function initializeScenarios() {
  const saveButton = getElement('saveScenario');
  const shareButton = getElement('shareScenario');
  const nameInput = getElement('scenarioName');
  const wrap = getElement('scenarioTable');

  if (typeof window !== 'undefined' && window.location.search.length > 1) {
    applyInputsToForm(decodeInputsFromQuery(window.location.search));
  }

  if (saveButton) {
    saveButton.addEventListener('click', () => {
      const stored = loadStoredScenarios();
      const fallbackName = translate(getCurrentLanguage(), 'scenarios.defaultName', { n: stored.length + 1 });
      const name = ((nameInput && nameInput.value) || '').trim() || fallbackName;
      stored.push({ name, inputs: getInputs(), savedAt: new Date().toISOString() });
      persistScenarios(stored);
      if (nameInput) nameInput.value = '';
      renderScenarioTable();
    });
  }

  if (shareButton) {
    shareButton.addEventListener('click', () => {
      const url = buildShareUrl();
      const confirmCopy = () => {
        shareButton.textContent = translate(getCurrentLanguage(), 'scenarios.shareCopied');
        setTimeout(() => {
          shareButton.textContent = translate(getCurrentLanguage(), 'scenarios.share');
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(confirmCopy, () => window.prompt('URL', url));
      } else {
        window.prompt('URL', url);
      }
    });
  }

  if (wrap) {
    wrap.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const stored = loadStoredScenarios();
      const index = Number(button.dataset.index);
      if (!Number.isInteger(index) || index < 0 || index >= stored.length) return;

      if (button.dataset.action === 'load') {
        applyInputsToForm(stored[index].inputs);
        calculateAndRender();
      } else if (button.dataset.action === 'delete') {
        stored.splice(index, 1);
        persistScenarios(stored);
        renderScenarioTable();
      }
    });
  }
}

function setChartFullscreen(card, active) {
  const language = getCurrentLanguage();
  card.classList.toggle('chart-fullscreen', active);
  document.body.classList.toggle('has-fullscreen-chart', active);

  const button = card.querySelector('.chart-expand');
  if (button) {
    const key = active ? 'charts.exitFullscreen' : 'charts.expand';
    button.dataset.i18n = key;
    button.textContent = translate(language, key);
    button.setAttribute('aria-expanded', active ? 'true' : 'false');
  }

  requestAnimationFrame(() => calculateAndRender());
}

function initializeChartFullscreen() {
  document.querySelectorAll('.chart-expand').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.chart-card');
      if (!card) return;
      const activating = !card.classList.contains('chart-fullscreen');
      document.querySelectorAll('.chart-card.chart-fullscreen').forEach((open) => {
        if (open !== card) setChartFullscreen(open, false);
      });
      setChartFullscreen(card, activating);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.chart-card.chart-fullscreen').forEach((card) => setChartFullscreen(card, false));
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
  initializeLanguageSelector();
  initializeCurrencySelector();
  initializeCostPeriodSelector();
  initializeTabs();
  initializeChartFullscreen();
  initializeScenarios();
  document.querySelectorAll('.chart-card canvas').forEach((canvas) => attachChartHover(canvas));

  const generateReportButton = getElement('generateReport');
  if (generateReportButton) {
    generateReportButton.addEventListener('click', generateReport);
  }

  const exportPdfButton = getElement('exportPdf');
  if (exportPdfButton) {
    exportPdfButton.addEventListener('click', exportReportToPdf);
  }

  const downloadHtmlButton = getElement('downloadHtml');
  if (downloadHtmlButton) {
    downloadHtmlButton.addEventListener('click', downloadReportAsHtml);
  }

  const downloadGraphsButton = getElement('downloadGraphs');
  if (downloadGraphsButton) {
    downloadGraphsButton.addEventListener('click', downloadGraphsAsPng);
  }

  applyTranslations();
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
    buildScenarioComparison,
    computeBreakEvenUnitPrices,
    encodeInputsToQuery,
    decodeInputsFromQuery,
    getDecision,
    formatCurrency,
    getCurrencyOptions,
    getCostPeriodOptions,
    getPricingMetricLabelKey,
    getUnitPriceLabelKey,
    shouldUseDashedSegment,
    buildDashedLineSegments,
    formatYears,
    formatPercent,
    getLanguageOptions,
    translate,
    buildReportModel,
    buildDownloadFilename,
  };
}
