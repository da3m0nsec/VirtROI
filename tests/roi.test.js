const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculateRoi,
  buildChartSeries,
  buildAnnualOutlaySeries,
  buildCostCompositionSeries,
  buildScenarioOverlay,
  getReportChartOptions,
  getDefaultReportChartIds,
  buildScenarioComparison,
  computeBreakEvenUnitPrices,
  encodeInputsToQuery,
  decodeInputsFromQuery,
  getDecision,
  formatCurrency,
  formatYears,
  formatPercent,
  getCurrencyOptions,
  getCostPeriodOptions,
  getPricingMetricLabelKey,
  getUnitPriceLabelKey,
  shouldUseDashedSegment,
  buildDashedLineSegments,
  getLanguageOptions,
  translate,
  buildReportModel,
  buildDownloadFilename,
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

test('buildChartSeries projects the selected period plus two extra scenario years', () => {
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
    { year: 0, currentCost: 0, targetCost: 40000, netSavings: -40000, projected: false },
    { year: 1, currentCost: 192000, targetCost: 130000, netSavings: 62000, projected: false },
    { year: 2, currentCost: 384000, targetCost: 220000, netSavings: 164000, projected: false },
    { year: 3, currentCost: 576000, targetCost: 310000, netSavings: 266000, projected: false },
    { year: 4, currentCost: 768000, targetCost: 400000, netSavings: 368000, projected: true },
    { year: 5, currentCost: 960000, targetCost: 490000, netSavings: 470000, projected: true },
  ]);
});

test('buildAnnualOutlaySeries reports per-year cash out with one-time costs loaded into year 1', () => {
  const result = calculateRoi({
    inputMode: 'topology',
    hosts: 10,
    socketsPerHost: 2,
    coresPerSocket: 24,
    currentPricingMetric: 'core',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 400,
    targetUnitPricePerYear: 4500,
    migrationCost: 40000,
    years: 3,
  });

  const series = buildAnnualOutlaySeries(result, 3);

  assert.deepEqual(series.map((point) => point.year), [1, 2, 3, 4, 5]);
  assert.deepEqual(series.map((point) => point.projected), [false, false, false, true, true]);
  assert.ok(series.every((point) => point.currentOutlay === 192000));
  // Year 1 carries the 40,000 one-time costs on top of the 90,000 annual cost.
  assert.equal(series[0].targetOutlay, 130000);
  assert.ok(series.slice(1).every((point) => point.targetOutlay === 90000));
});

test('buildCostCompositionSeries splits period totals into licenses, add-ons, and one-time costs', () => {
  const inputs = {
    currentPlatform: 'Product A',
    targetPlatform: 'Product B',
    inputMode: 'topology',
    hosts: 10,
    socketsPerHost: 2,
    coresPerSocket: 24,
    currentPricingMetric: 'core',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 400,
    targetUnitPricePerYear: 4500,
    currentAdditionalAnnualCost: 20000,
    targetAdditionalAnnualCost: 10000,
    migrationCost: 40000,
    hardwareCost: 15000,
    years: 3,
  };
  const series = buildCostCompositionSeries(calculateRoi(inputs), inputs);

  assert.deepEqual(series.map((point) => point.label), ['Product A', 'Product B']);
  // Current: 192,000 license + 20,000 add-ons per year over 3 years, no one-time costs.
  assert.deepEqual(series[0], { label: 'Product A', license: 576000, addons: 60000, oneTime: 0, total: 636000 });
  // Target: 90,000 license + 10,000 add-ons per year over 3 years, plus 55,000 one-time.
  assert.deepEqual(series[1], { label: 'Product B', license: 270000, addons: 30000, oneTime: 55000, total: 355000 });
  // Each bar's segments add up to its labelled total.
  series.forEach((point) => {
    assert.equal(point.license + point.addons + point.oneTime, point.total);
  });
});

test('report chart options default to the two cumulative charts only', () => {
  const options = getReportChartOptions();

  assert.deepEqual(options.map((option) => option.id), [
    'costChart',
    'savingsChart',
    'annualOutlayChart',
    'costCompositionChart',
    'scenarioOverlayChart',
  ]);
  assert.deepEqual(getDefaultReportChartIds(), ['costChart', 'savingsChart']);
});

test('buildScenarioOverlay lines up net savings per year for up to four scenarios', () => {
  const baseInputs = {
    inputMode: 'topology',
    hosts: 10,
    socketsPerHost: 2,
    coresPerSocket: 24,
    currentPricingMetric: 'core',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 400,
    targetUnitPricePerYear: 4500,
    migrationCost: 40000,
    years: 3,
  };
  const discounted = { ...baseInputs, targetUnitPricePerYear: 3600, years: 4 };

  const overlay = buildScenarioOverlay([
    { name: 'Current inputs', inputs: baseInputs },
    { name: 'Discounted quote', inputs: discounted },
    { name: 'Extra 1', inputs: baseInputs },
    { name: 'Extra 2', inputs: baseInputs },
    { name: 'Beyond the cap', inputs: baseInputs },
  ]);

  // Capped at four scenarios, horizon = longest analysis (4y) + 2 projected.
  assert.deepEqual(overlay.keys, ['s0', 's1', 's2', 's3']);
  assert.deepEqual(overlay.names, ['Current inputs', 'Discounted quote', 'Extra 1', 'Extra 2']);
  assert.equal(overlay.series.length, 7);
  assert.equal(overlay.series[0].s0, -40000);
  // Base: 102,000/yr − 40,000 one-time. Discounted: 120,000/yr − 40,000.
  assert.equal(overlay.series[3].s0, 102000 * 3 - 40000);
  assert.equal(overlay.series[3].s1, 120000 * 3 - 40000);
  assert.equal(overlay.series[4].projected, false);
  assert.equal(overlay.series[5].projected, true);
});

test('computeBreakEvenUnitPrices converts the break-even point into concrete unit prices', () => {
  const inputs = {
    inputMode: 'topology',
    hosts: 10,
    socketsPerHost: 2,
    coresPerSocket: 24,
    currentPricingMetric: 'core',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 400,
    targetUnitPricePerYear: 4500,
    migrationCost: 40000,
    years: 3,
  };
  const result = calculateRoi(inputs);
  const breakEven = computeBreakEvenUnitPrices(result, inputs);

  // Target: 20 sockets × price × 3y = 192,000 × 3 − 40,000 → $8,933.33/socket/yr.
  assert.equal(breakEven.targetUnitPrice, 8933.33);
  // Current: 480 cores × price × 3y = 90,000 × 3 + 40,000 → $215.28/core/yr.
  assert.equal(breakEven.currentUnitPrice, 215.28);
});

test('computeBreakEvenUnitPrices returns null when a side has no licensable quantity', () => {
  const inputs = {
    inputMode: 'absolute',
    totalSockets: 0,
    totalCores: 0,
    currentPricingMetric: 'core',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 400,
    targetUnitPricePerYear: 4500,
    migrationCost: 40000,
    years: 3,
  };
  const result = calculateRoi(inputs);
  const breakEven = computeBreakEvenUnitPrices(result, inputs);

  assert.equal(breakEven.targetUnitPrice, null);
  assert.equal(breakEven.currentUnitPrice, null);
});

test('scenario inputs survive an encode/decode round trip through a share URL query', () => {
  const inputs = {
    currentPlatform: 'Product A',
    targetPlatform: 'Product B & C',
    inputMode: 'absolute',
    totalSockets: 12,
    totalCores: 384,
    currentPricingMetric: 'core',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 350.5,
    targetUnitPricePerYear: 5000,
    currentAdditionalAnnualCost: 1200,
    targetAdditionalAnnualCost: 0,
    migrationCost: 25000,
    hardwareCost: 5000,
    renewalCost: 0,
    years: 4,
    currency: 'EUR',
    costInputPeriod: 'annual',
  };

  const query = encodeInputsToQuery(inputs);
  const decoded = decodeInputsFromQuery(query);

  assert.equal(decoded.targetPlatform, 'Product B & C');
  assert.equal(decoded.currentUnitPricePerYear, 350.5);
  assert.equal(decoded.years, 4);
  assert.equal(decoded.currency, 'EUR');
  assert.deepEqual(calculateRoi(decoded), calculateRoi(inputs));
});

test('decodeInputsFromQuery ignores unknown params and falls back on malformed numbers', () => {
  const decoded = decodeInputsFromQuery('years=abc&hosts=5&evil=<script>&currency=USD');

  assert.equal(decoded.years, 3);
  assert.equal(decoded.hosts, 5);
  assert.equal(decoded.currency, 'USD');
  assert.equal('evil' in decoded, false);
});

test('buildScenarioComparison computes comparable metrics and a decision tone per scenario', () => {
  const strongInputs = {
    inputMode: 'topology',
    hosts: 10,
    socketsPerHost: 2,
    coresPerSocket: 24,
    currentPricingMetric: 'core',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 400,
    targetUnitPricePerYear: 4500,
    migrationCost: 40000,
    years: 3,
  };
  const weakInputs = { ...strongInputs, targetUnitPricePerYear: 12000, migrationCost: 100000 };

  const rows = buildScenarioComparison([
    { name: 'Baseline', inputs: strongInputs },
    { name: 'Expensive target', inputs: weakInputs },
  ]);

  assert.equal(rows.length, 2);
  assert.equal(rows[0].name, 'Baseline');
  assert.equal(rows[0].annualSavings, 102000);
  assert.equal(rows[0].roiPercent, 665);
  assert.equal(rows[0].tone, 'strong');
  assert.ok(rows[1].annualSavings < rows[0].annualSavings);
  assert.equal(rows[1].tone, 'weak');
});

test('the calculator ships the scenario library and break-even card', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.ok(html.includes('id="scenarioName"'));
  assert.ok(html.includes('id="saveScenario"'));
  assert.ok(html.includes('id="shareScenario"'));
  assert.ok(html.includes('id="scenarioTable"'));
  assert.ok(html.includes('id="targetBreakEvenPrice"'));
  assert.ok(html.indexOf('id="scenarioTable"') < html.indexOf('id="charts-panel"'));
});

test('the charts tab ships cost, savings, outlay, and scenario overlay charts with fullscreen buttons', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.ok(html.includes('id="costChart"'));
  assert.ok(html.includes('id="savingsChart"'));
  assert.ok(html.includes('id="annualOutlayChart"'));
  assert.ok(html.includes('id="costCompositionChart"'));
  assert.ok(html.includes('id="scenarioOverlayChart"'));
  assert.ok(html.includes('id="scenarioOverlayLegend"'));
  assert.equal(html.includes('id="priceVarianceChart"'), false);
  assert.equal(html.includes('id="sizingVarianceChart"'), false);
  assert.equal((html.match(/class="chart-expand"/g) || []).length, 5);

  // The scenario comparison spans the full grid width, below the 2x2 charts.
  assert.ok(html.includes('class="chart-card chart-card-wide"'));
  assert.ok(html.indexOf('chart-card-wide') > html.indexOf('id="costCompositionChart"'));
});

test('the report tab exposes per-chart and per-scenario include selectors', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.ok(html.includes('id="reportChartOptions"'));
  assert.ok(html.includes('id="reportScenarioOptions"'));
  assert.ok(html.includes('data-i18n="report.chartsToInclude"'));
  assert.ok(html.includes('data-i18n="report.scenariosToInclude"'));
  assert.ok(html.indexOf('id="reportChartOptions"') < html.indexOf('id="reportBody"'));
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


test('language options include English, Spanish, Portuguese, Italian, Japanese, and German', () => {
  assert.deepEqual(getLanguageOptions().map((option) => option.code), ['en', 'es', 'pt', 'it', 'ja', 'de']);
  assert.equal(translate('es', 'nav.calculator'), 'Calculadora');
  assert.equal(translate('pt', 'tabs.report'), 'Relatório');
  assert.equal(translate('it', 'report.exportPdf'), 'Esporta PDF');
  assert.equal(translate('ja', 'nav.charts'), 'チャート');
  assert.equal(translate('de', 'decision.strong.label'), 'Starker Case');
  assert.equal(translate('unknown', 'nav.calculator'), 'Calculator');
});

test('buildReportModel creates editable report sections with chart image slots', () => {
  const inputs = {
    currentPlatform: 'Product A',
    targetPlatform: 'Product B',
    years: 3,
    migrationCost: 40000,
    hardwareCost: 10000,
    renewalCost: 5000,
  };
  const result = {
    currentAnnualCost: 192000,
    targetAnnualCost: 90000,
    oneTimeCosts: 55000,
    annualSavings: 102000,
    paybackYears: 0.54,
    netSavingsAfterMigration: 251000,
    roiPercent: 456.36,
    totalCores: 480,
    totalSockets: 20,
  };

  const report = buildReportModel(inputs, result, 'en');

  assert.equal(report.title, 'VirtROI report');
  assert.match(report.summary, /Product A to Product B/);
  assert.equal(report.metrics.length, 8);
  // Default report carries only the two cumulative charts.
  assert.deepEqual(report.chartSlots, [
    { id: 'costChart', title: 'Cumulative cost' },
    { id: 'savingsChart', title: 'Net savings' },
  ]);

  // An explicit selection is honoured, always in canonical order.
  const selected = buildReportModel(inputs, result, 'en', 'USD', {
    charts: ['scenarioOverlayChart', 'costCompositionChart', 'costChart', 'bogusChart'],
  });
  assert.deepEqual(selected.chartSlots, [
    { id: 'costChart', title: 'Cumulative cost' },
    { id: 'costCompositionChart', title: 'Cost composition' },
    { id: 'scenarioOverlayChart', title: 'Scenario comparison' },
  ]);

  // Selecting nothing drops the charts section entirely.
  assert.deepEqual(buildReportModel(inputs, result, 'en', 'USD', { charts: [] }).chartSlots, []);

  // Yearly rows cover year 0 through the analysis period plus two projected years.
  assert.equal(report.yearlyRows.length, 6);
  assert.deepEqual(report.yearlyRows[0], { year: 0, projected: false, currentCost: 0, targetCost: 55000, netSavings: -55000 });
  assert.equal(report.yearlyRows[3].year, 3);
  assert.equal(report.yearlyRows[3].projected, false);
  assert.equal(report.yearlyRows[3].netSavings, 251000);
  assert.equal(report.yearlyRows.at(-1).projected, true);

  // The target column header states that one-time costs are included.
  assert.match(translate('en', 'report.col.cumulativeTarget', { platform: 'Product B' }), /Product B.*one-time/);
});

test('report export controls include HTML and graph PNG downloads with stable filenames', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.ok(html.includes('id="downloadHtml"'));
  assert.ok(html.includes('id="downloadGraphs"'));
  assert.ok(html.indexOf('id="downloadHtml"') > html.indexOf('id="exportPdf"'));
  assert.equal(buildDownloadFilename('VirtROI Report!', '.html', new Date('2026-04-28T12:00:00Z')), 'virtroi-report-2026-04-28.html');
  assert.equal(buildDownloadFilename('Graphs', 'png', new Date('2026-04-28T12:00:00Z')), 'graphs-2026-04-28.png');
});


test('translations are stored as one locale file per supported language', () => {
  const localeDir = path.join(__dirname, '..', 'locales');
  const files = fs.readdirSync(localeDir).filter((file) => file.endsWith('.js')).sort();

  assert.deepEqual(files, ['de.js', 'en.js', 'es.js', 'it.js', 'ja.js', 'pt.js']);
  assert.equal(fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8').includes('const TRANSLATIONS = {'), false);
});

test('all locale files expose the same translation keys and cover every data-i18n key in the page', () => {
  const localeDir = path.join(__dirname, '..', 'locales');
  const locales = Object.fromEntries(
    getLanguageOptions().map((option) => [option.code, require(path.join(localeDir, `${option.code}.js`))]),
  );
  const englishKeys = Object.keys(locales.en).sort();

  for (const option of getLanguageOptions()) {
    assert.deepEqual(Object.keys(locales[option.code]).sort(), englishKeys, `${option.code} locale keys differ from en`);
    assert.equal(locales[option.code]['forms.currentPlatform'], translate(option.code, 'forms.currentPlatform'));
  }

  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const pageKeys = [
    ...html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g),
    ...html.matchAll(/data-i18n-attr="[^"]*?:([^";]+)(?:;[^"]*?:([^";]+))*"/g),
  ].flatMap((match) => match.slice(1).filter(Boolean));
  const missing = pageKeys.filter((key) => !englishKeys.includes(key));
  assert.deepEqual([...new Set(missing)], []);
  assert.ok(pageKeys.includes('forms.currentPlatform'));
  assert.ok(pageKeys.includes('formulas.roi.description'));
});


test('currency options include five sensible global currencies and format output by selected currency', () => {
  assert.deepEqual(getCurrencyOptions().map((option) => option.code), ['USD', 'EUR', 'GBP', 'JPY', 'BRL']);
  assert.equal(formatCurrency(96000, 'EUR'), '€96,000');
  assert.equal(formatCurrency(96000, 'GBP'), '£96,000');
  assert.equal(formatCurrency(96000, 'JPY'), '¥96,000');
  assert.equal(formatCurrency(96000, 'BRL'), 'R$96,000');
});

test('calculateRoi supports annualized and total cost input periods', () => {
  assert.deepEqual(getCostPeriodOptions().map((option) => option.code), ['annual', 'total']);

  const annualized = calculateRoi({
    inputMode: 'topology',
    hosts: 10,
    socketsPerHost: 2,
    coresPerSocket: 24,
    currentPricingMetric: 'core',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 400,
    targetUnitPricePerYear: 4500,
    currentAdditionalAnnualCost: 3000,
    targetAdditionalAnnualCost: 1500,
    migrationCost: 40000,
    years: 3,
    costInputPeriod: 'annual',
  });

  const totals = calculateRoi({
    inputMode: 'topology',
    hosts: 10,
    socketsPerHost: 2,
    coresPerSocket: 24,
    currentPricingMetric: 'core',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 1200,
    targetUnitPricePerYear: 13500,
    currentAdditionalAnnualCost: 9000,
    targetAdditionalAnnualCost: 4500,
    migrationCost: 40000,
    years: 3,
    costInputPeriod: 'total',
  });

  assert.equal(totals.currentAnnualCost, annualized.currentAnnualCost);
  assert.equal(totals.targetAnnualCost, annualized.targetAnnualCost);
  assert.equal(totals.annualSavings, annualized.annualSavings);
  assert.equal(totals.netSavingsAfterMigration, annualized.netSavingsAfterMigration);
});


test('cost period selector appears before product pricing fields', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.ok(html.indexOf('id="costInputPeriod"') < html.indexOf('data-i18n="forms.currentPricing"'));
  assert.ok(html.indexOf('id="costInputPeriod"') < html.indexOf('data-i18n="forms.targetPricing"'));
});

test('pricing metric and unit price labels change for annualized vs total cost periods', () => {
  assert.equal(getPricingMetricLabelKey('core', 'annual'), 'options.coreYear');
  assert.equal(getPricingMetricLabelKey('socket', 'annual'), 'options.socketYear');
  assert.equal(getPricingMetricLabelKey('core', 'total'), 'options.coreTotal');
  assert.equal(getPricingMetricLabelKey('socket', 'total'), 'options.socketTotal');
  assert.equal(getUnitPriceLabelKey('annual'), 'forms.unitPriceYear');
  assert.equal(getUnitPriceLabelKey('total'), 'forms.unitPriceTotal');
});

test('projected chart segments are dashed only for additional projected years', () => {
  assert.equal(shouldUseDashedSegment({ projected: false }, { projected: false }), false);
  assert.equal(shouldUseDashedSegment({ projected: false }, { projected: true }), true);
  assert.equal(shouldUseDashedSegment({ projected: true }, { projected: true }), true);
});


test('projected chart dashes are rendered as separate line segments with visible gaps', () => {
  const segments = buildDashedLineSegments({ x: 0, y: 0 }, { x: 100, y: 0 }, 12, 10);
  assert.ok(segments.length >= 4);
  assert.deepEqual(segments[0], { from: { x: 0, y: 0 }, to: { x: 12, y: 0 } });
  assert.ok(segments[1].from.x > segments[0].to.x, 'second dash starts after a gap');
  assert.ok(segments.at(-1).to.x <= 100);
});
