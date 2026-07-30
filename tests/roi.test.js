const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calculateRoi,
  buildChartSeries,
  buildPriceImpactSeries,
  computeBreakEvenThresholds,
  formatSignedPercent,
  formatVarianceAxisLabel,
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

test('buildPriceImpactSeries maps price changes from -50% to +50% onto ROI, one side at a time', () => {
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

  const series = buildPriceImpactSeries(result, 3);

  assert.deepEqual(series.map((point) => point.variancePercent), [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50]);
  assert.deepEqual(series.map((point) => point.baseline), series.map((point) => point.variancePercent === 0));

  const baselinePoint = series.find((point) => point.baseline);
  assert.equal(baselinePoint.currentPriceRoi, result.roiPercent);
  assert.equal(baselinePoint.targetPriceRoi, result.roiPercent);
  assert.equal(baselinePoint.currentPriceNetSavings, result.netSavingsAfterMigration);

  // Target license 90,000/year: +10% removes 9,000/year of savings over 3 years → 27,000 less net savings, 67.5 ROI points.
  const plusTen = series.find((point) => point.variancePercent === 10);
  assert.equal(plusTen.targetPriceNetSavings, 266000 - 9000 * 3);
  assert.equal(plusTen.targetPriceRoi, 665 - 67.5);
  // Current license 192,000/year: +10% adds 19,200/year of savings over 3 years.
  assert.equal(plusTen.currentPriceNetSavings, 266000 + 19200 * 3);
});

test('buildPriceImpactSeries reports no ROI when there are no one-time costs', () => {
  const result = calculateRoi({
    inputMode: 'topology',
    hosts: 10,
    socketsPerHost: 2,
    coresPerSocket: 24,
    currentPricingMetric: 'core',
    targetPricingMetric: 'socket',
    currentUnitPricePerYear: 400,
    targetUnitPricePerYear: 4500,
    migrationCost: 0,
    years: 3,
  });

  const series = buildPriceImpactSeries(result, 3);
  assert.ok(series.every((point) => point.currentPriceRoi === null && point.targetPriceRoi === null));
  assert.equal(series.find((point) => point.baseline).currentPriceNetSavings, result.netSavingsAfterMigration);
});

test('computeBreakEvenThresholds solves the price change that zeroes net savings for each side', () => {
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

  const thresholds = computeBreakEvenThresholds(result, 3);

  // Target side: 90,000 × f × 3 = 192,000 × 3 − 40,000 → f ≈ 1.985.
  assert.equal(thresholds.targetPricePercent, 98.5);
  // Current side: 192,000 × f × 3 = 90,000 × 3 + 40,000 → f ≈ 0.538.
  assert.equal(thresholds.currentPricePercent, -46.2);

  // A break-even priced scenario nets ~zero savings.
  const factor = 1 + thresholds.targetPricePercent / 100;
  const netAtBreakEven = (result.currentAnnualCost - result.targetLicenseAnnualCost * factor) * 3 - result.oneTimeCosts;
  assert.ok(Math.abs(netAtBreakEven) < 2000);
});

test('price impact axis labels and thresholds are signed percentages', () => {
  assert.equal(formatVarianceAxisLabel({ variancePercent: -30 }), '-30%');
  assert.equal(formatVarianceAxisLabel({ variancePercent: 0 }), '0%');
  assert.equal(formatVarianceAxisLabel({ variancePercent: 30 }), '+30%');
  assert.equal(formatSignedPercent(98.5), '+98.5%');
  assert.equal(formatSignedPercent(-46.2), '-46.2%');
  assert.equal(formatSignedPercent(null), 'N/A');
});

test('the price impact chart replaces the variance charts and ships break-even tiles and fullscreen buttons', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.ok(html.includes('id="priceImpactChart"'));
  assert.equal(html.includes('id="priceVarianceChart"'), false);
  assert.equal(html.includes('id="sizingVarianceChart"'), false);
  assert.ok(html.indexOf('id="priceImpactChart"') > html.indexOf('id="savingsChart"'));
  assert.ok(html.includes('data-i18n="charts.legendCurrentPrice"'));
  assert.ok(html.includes('data-i18n="charts.legendTargetPrice"'));
  assert.ok(html.includes('id="breakEvenTargetValue"'));
  assert.ok(html.includes('id="breakEvenCurrentValue"'));
  assert.ok((html.match(/class="chart-expand"/g) || []).length >= 3);
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
  assert.deepEqual(report.chartSlots, ['costChart', 'savingsChart', 'priceImpactChart']);
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
