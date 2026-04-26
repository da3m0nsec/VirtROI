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

const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: '日本語' },
  { code: 'de', name: 'Deutsch' },
];

const TRANSLATIONS = {
  en: {
    'nav.calculator': 'Calculator',
    'nav.charts': 'Charts',
    'nav.formulas': 'Formulas',
    'nav.report': 'Report',
    'language.label': 'Language',
    'tabs.calculator': 'Calculator',
    'tabs.charts': 'Dynamic charts',
    'tabs.report': 'Report',
    'hero.eyebrow': 'Virtualization cost strategy',
    'hero.title': 'Calculate whether changing your virtualization stack is financially worth it.',
    'hero.copy': 'Compare products priced by core or by socket, include add-on costs such as HCI capacity, and visualize cumulative cost, savings, payback, and ROI over time.',
    'charts.eyebrow': 'Dynamic charts',
    'charts.title': 'Visualize the business case over time',
    'charts.copy': 'Charts update instantly and extend the selected period with two extra projected scenario years.',
    'charts.projectionNote': 'Projection includes two extra scenario years beyond the selected analysis period.',
    'report.eyebrow': 'Editable report',
    'report.title': 'Generate, edit, and export your business case',
    'report.copy': 'Create an editable report with the current figures and chart snapshots, then export it to PDF using the browser print dialog.',
    'report.generate': 'Generate report',
    'report.exportPdf': 'Export PDF',
    'report.placeholder': 'Generate a report to populate this editable area.',
    'report.generatedTitle': 'VirtROI report',
    'report.summaryHeading': 'Executive summary',
    'report.metricsHeading': 'Key metrics',
    'report.chartsHeading': 'Charts',
    'report.notesHeading': 'Manual notes',
    'report.notesPlaceholder': 'Edit this section with risks, assumptions, next steps, or stakeholder comments.',
    'decision.strong.label': 'Strong case',
    'decision.evaluate.label': 'Worth evaluating',
    'decision.weak.label': 'Weak financial case',
  },
  es: {
    'nav.calculator': 'Calculadora',
    'nav.charts': 'Gráficos',
    'nav.formulas': 'Fórmulas',
    'nav.report': 'Informe',
    'language.label': 'Idioma',
    'tabs.calculator': 'Calculadora',
    'tabs.charts': 'Gráficos dinámicos',
    'tabs.report': 'Informe',
    'hero.eyebrow': 'Estrategia de costes de virtualización',
    'hero.title': 'Calcula si cambiar tu stack de virtualización merece la pena financieramente.',
    'hero.copy': 'Compara productos con precio por core o por socket, incluye costes adicionales como capacidad HCI y visualiza coste acumulado, ahorros, payback y ROI.',
    'charts.eyebrow': 'Gráficos dinámicos',
    'charts.title': 'Visualiza el business case en el tiempo',
    'charts.copy': 'Los gráficos se actualizan al instante y añaden dos años proyectados al periodo seleccionado.',
    'charts.projectionNote': 'La proyección incluye dos años adicionales de escenario más allá del periodo seleccionado.',
    'report.eyebrow': 'Informe editable',
    'report.title': 'Genera, edita y exporta tu business case',
    'report.copy': 'Crea un informe editable con las cifras actuales e imágenes de los gráficos, y expórtalo a PDF desde el diálogo de impresión del navegador.',
    'report.generate': 'Generar informe',
    'report.exportPdf': 'Exportar PDF',
    'report.placeholder': 'Genera un informe para rellenar esta zona editable.',
    'report.generatedTitle': 'Informe VirtROI',
    'report.summaryHeading': 'Resumen ejecutivo',
    'report.metricsHeading': 'Métricas clave',
    'report.chartsHeading': 'Gráficos',
    'report.notesHeading': 'Notas manuales',
    'report.notesPlaceholder': 'Edita esta sección con riesgos, supuestos, próximos pasos o comentarios.',
    'decision.strong.label': 'Caso sólido',
    'decision.evaluate.label': 'Merece evaluación',
    'decision.weak.label': 'Caso financiero débil',
  },
  pt: {
    'nav.calculator': 'Calculadora',
    'nav.charts': 'Gráficos',
    'nav.formulas': 'Fórmulas',
    'nav.report': 'Relatório',
    'language.label': 'Idioma',
    'tabs.calculator': 'Calculadora',
    'tabs.charts': 'Gráficos dinâmicos',
    'tabs.report': 'Relatório',
    'hero.eyebrow': 'Estratégia de custos de virtualização',
    'hero.title': 'Calcule se mudar seu stack de virtualização compensa financeiramente.',
    'hero.copy': 'Compare produtos precificados por core ou socket, inclua custos adicionais como capacidade HCI e visualize custo acumulado, economia, payback e ROI.',
    'charts.eyebrow': 'Gráficos dinâmicos',
    'charts.title': 'Visualize o business case ao longo do tempo',
    'charts.copy': 'Os gráficos atualizam instantaneamente e estendem o período selecionado com dois anos projetados.',
    'charts.projectionNote': 'A projeção inclui dois anos adicionais de cenário além do período selecionado.',
    'report.eyebrow': 'Relatório editável',
    'report.title': 'Gere, edite e exporte seu business case',
    'report.copy': 'Crie um relatório editável com os números atuais e snapshots dos gráficos, depois exporte para PDF pelo navegador.',
    'report.generate': 'Gerar relatório',
    'report.exportPdf': 'Exportar PDF',
    'report.placeholder': 'Gere um relatório para preencher esta área editável.',
  },
  it: {
    'nav.calculator': 'Calcolatore',
    'nav.charts': 'Grafici',
    'nav.formulas': 'Formule',
    'nav.report': 'Report',
    'language.label': 'Lingua',
    'tabs.calculator': 'Calcolatore',
    'tabs.charts': 'Grafici dinamici',
    'tabs.report': 'Report',
    'hero.eyebrow': 'Strategia dei costi di virtualizzazione',
    'hero.title': 'Calcola se cambiare stack di virtualizzazione conviene finanziariamente.',
    'hero.copy': 'Confronta prodotti prezzati per core o socket, includi costi aggiuntivi come capacità HCI e visualizza costi cumulativi, risparmi, payback e ROI.',
    'charts.eyebrow': 'Grafici dinamici',
    'charts.title': 'Visualizza il business case nel tempo',
    'charts.copy': 'I grafici si aggiornano subito ed estendono il periodo selezionato con due anni proiettati.',
    'charts.projectionNote': 'La proiezione include due anni di scenario aggiuntivi oltre il periodo selezionato.',
    'report.eyebrow': 'Report modificabile',
    'report.title': 'Genera, modifica ed esporta il business case',
    'report.copy': 'Crea un report modificabile con i dati correnti e snapshot dei grafici, poi esportalo in PDF dal browser.',
    'report.generate': 'Genera report',
    'report.exportPdf': 'Esporta PDF',
    'report.placeholder': 'Genera un report per popolare questa area modificabile.',
  },
  ja: {
    'nav.calculator': '計算機',
    'nav.charts': 'チャート',
    'nav.formulas': '数式',
    'nav.report': 'レポート',
    'language.label': '言語',
    'tabs.calculator': '計算機',
    'tabs.charts': '動的チャート',
    'tabs.report': 'レポート',
    'hero.eyebrow': '仮想化コスト戦略',
    'hero.title': '仮想化スタックの変更が財務的に妥当かを計算します。',
    'hero.copy': 'コア単位またはソケット単位の価格を比較し、HCI 容量などの追加コストを含め、累積コスト、削減額、回収期間、ROI を可視化します。',
    'charts.eyebrow': '動的チャート',
    'charts.title': 'ビジネスケースを時系列で可視化',
    'charts.copy': 'チャートは即時更新され、選択した期間に2年間の予測シナリオを追加します。',
    'charts.projectionNote': '選択した分析期間の先に、追加で2年間のシナリオ予測を含みます。',
    'report.eyebrow': '編集可能なレポート',
    'report.title': 'ビジネスケースを生成・編集・PDF出力',
    'report.copy': '現在の数値とチャート画像を含む編集可能なレポートを作成し、ブラウザの印刷機能でPDFに出力します。',
    'report.generate': 'レポート生成',
    'report.exportPdf': 'PDF出力',
    'report.placeholder': 'レポートを生成すると、この編集エリアに内容が入ります。',
  },
  de: {
    'nav.calculator': 'Rechner',
    'nav.charts': 'Diagramme',
    'nav.formulas': 'Formeln',
    'nav.report': 'Report',
    'language.label': 'Sprache',
    'tabs.calculator': 'Rechner',
    'tabs.charts': 'Dynamische Diagramme',
    'tabs.report': 'Report',
    'hero.eyebrow': 'Kostenstrategie für Virtualisierung',
    'hero.title': 'Berechne, ob sich der Wechsel deines Virtualisierungs-Stacks finanziell lohnt.',
    'hero.copy': 'Vergleiche Produkte mit Core- oder Socket-Preisen, berücksichtige Zusatzkosten wie HCI-Kapazität und visualisiere kumulative Kosten, Einsparungen, Payback und ROI.',
    'charts.eyebrow': 'Dynamische Diagramme',
    'charts.title': 'Visualisiere den Business Case über die Zeit',
    'charts.copy': 'Diagramme aktualisieren sich sofort und erweitern den gewählten Zeitraum um zwei prognostizierte Szenariojahre.',
    'charts.projectionNote': 'Die Projektion enthält zwei zusätzliche Szenariojahre nach dem gewählten Analysezeitraum.',
    'report.eyebrow': 'Editierbarer Report',
    'report.title': 'Business Case erstellen, bearbeiten und exportieren',
    'report.copy': 'Erstelle einen editierbaren Report mit aktuellen Zahlen und Diagramm-Snapshots und exportiere ihn per Browser-Druckdialog als PDF.',
    'report.generate': 'Report erstellen',
    'report.exportPdf': 'PDF exportieren',
    'report.placeholder': 'Erstelle einen Report, um diesen editierbaren Bereich zu füllen.',
    'decision.strong.label': 'Starker Case',
  },
};

function getLanguageOptions() {
  return LANGUAGE_OPTIONS.map((option) => ({ ...option }));
}

function translate(language, key) {
  return (TRANSLATIONS[language] && TRANSLATIONS[language][key]) || TRANSLATIONS.en[key] || key;
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

function buildChartSeries(result, years, extraProjectionYears = 2) {
  const analysisHorizon = Math.max(1, Math.round(toFiniteNumber(years, DEFAULT_INPUTS.years)));
  const projectionYears = Math.max(0, Math.round(toFiniteNumber(extraProjectionYears, 2)));
  const horizon = analysisHorizon + projectionYears;
  const points = [];

  for (let year = 0; year <= horizon; year += 1) {
    const currentCost = result.currentAnnualCost * year;
    const targetCost = result.targetAnnualCost * year + toFiniteNumber(result.migrationCost);
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

function buildReportModel(inputs, result, language = 'en') {
  const currentPlatform = inputs.currentPlatform || DEFAULT_INPUTS.currentPlatform;
  const targetPlatform = inputs.targetPlatform || DEFAULT_INPUTS.targetPlatform;
  const years = toFiniteNumber(inputs.years, DEFAULT_INPUTS.years);

  return {
    title: translate(language, 'report.generatedTitle'),
    summary: `${currentPlatform} to ${targetPlatform}: ${formatCurrency(result.annualSavings)} annual savings, ${formatYears(result.paybackYears)} payback, and ${formatCurrency(result.netSavingsAfterMigration)} net savings over ${years} ${years === 1 ? 'year' : 'years'}.`,
    metrics: [
      { label: `${currentPlatform} annual cost`, value: formatCurrency(result.currentAnnualCost) },
      { label: `${targetPlatform} annual cost`, value: formatCurrency(result.targetAnnualCost) },
      { label: 'Annual savings', value: formatCurrency(result.annualSavings) },
      { label: 'One-time costs', value: formatCurrency(result.oneTimeCosts) },
      { label: 'Payback period', value: formatYears(result.paybackYears) },
      { label: 'Net savings', value: formatCurrency(result.netSavingsAfterMigration) },
      { label: 'ROI', value: formatPercent(result.roiPercent) },
      { label: 'Capacity', value: `${result.totalCores.toLocaleString('en-US')} cores / ${result.totalSockets.toLocaleString('en-US')} sockets` },
    ],
    chartSlots: ['costChart', 'savingsChart'],
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

function getCurrentLanguage() {
  return getValue('languageSelect', 'en') || 'en';
}

function applyTranslations(language = getCurrentLanguage()) {
  if (typeof document === 'undefined') return;

  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = translate(language, element.dataset.i18n);
  });
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
  const report = buildReportModel(inputs, result, language);
  const costChart = getChartImage('costChart');
  const savingsChart = getChartImage('savingsChart');
  const chartImages = [costChart, savingsChart].filter(Boolean);

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
        <h2>${escapeHtml(translate(language, 'report.chartsHeading'))}</h2>
        <div class="report-chart-grid">
          ${chartImages.map((image) => `<img src="${image}" alt="VirtROI chart snapshot" />`).join('')}
        </div>
      </section>
      <section>
        <h2>${escapeHtml(translate(language, 'report.notesHeading'))}</h2>
        <p>${escapeHtml(translate(language, 'report.notesPlaceholder'))}</p>
      </section>
    </article>`;
}

function exportReportToPdf() {
  const reportBody = getElement('reportBody');
  if (reportBody && !reportBody.textContent.trim()) {
    generateReport();
  }
  if (typeof window !== 'undefined' && typeof window.print === 'function') {
    window.print();
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
  setText('decisionLabel', translate(getCurrentLanguage(), `decision.${decision.tone}.label`));
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
    context.fillStyle = point.projected ? '#8a5a12' : '#5b6475';
    context.fillText(`Y${point.year}${point.projected ? '*' : ''}`, x - 8, height - 14);
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
  initializeLanguageSelector();
  initializeTabs();

  const generateReportButton = getElement('generateReport');
  if (generateReportButton) {
    generateReportButton.addEventListener('click', generateReport);
  }

  const exportPdfButton = getElement('exportPdf');
  if (exportPdfButton) {
    exportPdfButton.addEventListener('click', exportReportToPdf);
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
    getDecision,
    formatCurrency,
    formatYears,
    formatPercent,
    getLanguageOptions,
    translate,
    buildReportModel,
  };
}
