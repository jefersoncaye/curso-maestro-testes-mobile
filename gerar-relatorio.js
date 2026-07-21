#!/usr/bin/env node
/**
 * Gera relatorio HTML a partir dos commands-*.json do Maestro.
 * Uso: node gerar-relatorio.js <pasta-debug-output> [saida.html]
 */

const fs = require('fs');
const path = require('path');

const rootDir = process.argv[2] || 'reports/debug';
const outPath = process.argv[3] || path.join(path.dirname(rootDir) || '.', 'relatorio-consolidado.html');

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const allFiles = walk(rootDir);
const allCommandFiles = allFiles.filter((f) => /commands.*\.json$/i.test(path.basename(f)));

if (allCommandFiles.length === 0) {
  console.log(`Nenhum commands-*.json encontrado dentro de "${rootDir}". Gerando pagina de aviso.`);
  const aviso = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Relatorio de Testes</title></head>
<body style="font-family:sans-serif;padding:40px;">
<h1>Sem resultados neste run</h1>
<p>A suite nao chegou a gerar arquivos de debug. Verifique os logs do workflow no GitHub Actions.</p>
</body>
</html>`;
  fs.mkdirSync(path.dirname(outPath) || '.', { recursive: true });
  fs.writeFileSync(outPath, aviso, 'utf-8');
  process.exit(0);
}

// Nome do flow, compativel com as duas estruturas de debug-output do Maestro:
// - versoes antigas: uma pasta por run, arquivos commands-(flow).json
// - versoes novas (CI): uma pasta por flow, arquivo commands.json sem nome
function flowNameOf(file) {
  const baseName = path.basename(file).replace(/\.json$/i, '');
  const m = baseName.match(/^commands-\((.+)\)$/) || baseName.match(/^commands-(.+)$/);
  if (m) return m[1];
  const parent = path.basename(path.dirname(file));
  // pasta de run com timestamp (2026-07-20_190013) nao identifica o flow
  return /^\d{4}-\d{2}-\d{2}_\d{6}$/.test(parent) ? baseName : parent;
}

// agrupa por FLOW (nao por pasta) e mantem so o arquivo mais recente de cada um
const byFlow = {};
for (const f of allCommandFiles) {
  const name = flowNameOf(f);
  const mtime = fs.statSync(f).mtimeMs;
  if (!byFlow[name] || mtime > byFlow[name].mtime) byFlow[name] = { file: f, mtime };
}
const commandFiles = Object.values(byFlow).map((e) => e.file);
const ignoredCount = allCommandFiles.length - commandFiles.length;

console.log(`${commandFiles.length} flow(s)`);
if (ignoredCount) {
  console.log(`${ignoredCount} arquivo(s) de runs anteriores ignorado(s)`);
}

const screenshotFiles = allFiles.filter((f) => /\.(png|jpe?g)$/i.test(f));

// maestro.log: usa o mais recente encontrado na arvore
const logFile = allFiles
  .filter((f) => path.basename(f) === 'maestro.log')
  .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
let envInfo = null;
if (logFile) {
  try {
    const log = fs.readFileSync(logFile, 'utf-8').slice(0, 20000);
    const grab = (re) => (log.match(re) || [])[1];
    const maestroVersion = grab(/Maestro Version:\s*(.+)/);
    const osName = grab(/OS Name:\s*(.+)/);
    const osVersion = grab(/OS Version:\s*(.+)/);
    const device = grab(/Selected device (\S+)/);
    const deviceInfo = log.match(/DeviceInfo\(platform=(\w+), widthPixels=(\d+), heightPixels=(\d+)/);
    envInfo = {
      maestroVersion,
      os: osName || null,
      device,
      platform: deviceInfo ? deviceInfo[1] : null,
      resolution: deviceInfo ? `${deviceInfo[2]}x${deviceInfo[3]}` : null,
    };
  } catch (e) {
    console.log(`Aviso: nao consegui ler o maestro.log (${e.message}).`);
  }
}

function statusIcon(status) {
  const s = (status || '').toLowerCase();
  if (/pass|success|ok|complete/.test(s)) return '\u2705';
  if (/fail|error/.test(s)) return '\u274C';
  if (/skip/.test(s)) return '\u23ED';
  return '\u2753';
}
function statusClass(status) {
  const s = (status || '').toLowerCase();
  if (/pass|success|ok|complete/.test(s)) return 'ok';
  if (/fail|error/.test(s)) return 'fail';
  if (/skip/.test(s)) return 'skipped';
  return 'unknown';
}
function fmtDuration(ms) {
  if (ms == null) return '';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function humanLabel(type, body) {
  const targetOf = (sel) => (sel?.idRegex ? `id: ${sel.idRegex}` : sel?.textRegex ? `"${sel.textRegex}"` : 'elemento');
  const condOf = (cond) => {
    if (!cond) return '';
    if (cond.visible) return ` — when visible ${targetOf(cond.visible)}`;
    if (cond.notVisible) return ` — when notVisible ${targetOf(cond.notVisible)}`;
    return '';
  };
  switch (type) {
    case 'launchAppCommand':
      return `Launch app "${body.appId}"${body.clearState ? ' with clear state' : ''}`;
    case 'tapOnElement':
      return `Tap on ${targetOf(body.selector)}`;
    case 'inputTextCommand':
      return `Input text ${body.text}`;
    case 'hideKeyboardCommand':
      return 'Hide Keyboard';
    case 'assertConditionCommand':
      if (body.condition?.visible) return `Assert that ${targetOf(body.condition.visible)} is visible`;
      if (body.condition?.notVisible) return `Assert that ${targetOf(body.condition.notVisible)} is not visible`;
      return 'Assert condition';
    case 'applyConfigurationCommand':
      return 'Apply configuration';
    case 'defineVariablesCommand':
      return 'Define variables';
    case 'runFlowCommand':
      return `Run flow ${body.sourceDescription ? `"${body.sourceDescription}"` : '(inline)'}${condOf(body.condition)}`;
    case 'repeatCommand':
      return `${body.times ? `Repeat ${body.times}x` : 'Repeat'}${condOf(body.condition)}`;
    case 'scrollCommand':
      return 'Scroll';
    case 'scrollUntilVisible':
      return `Scroll until ${targetOf(body.selector)} is visible`;
    default:
      return type.replace(/Command$/, '');
  }
}

function extractError(step) {
  const err = step.metadata?.error;
  if (!err) return null;
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err.message) return String(err.message);
  return null;
}

// screenshot-<emoji>-<timestamp>-(<flow>).png
function screenshotTimestamp(f) {
  const m = path.basename(f).match(/-(\d{10,})-/);
  return m ? parseInt(m[1], 10) : null;
}

const flows = [];

for (const file of commandFiles) {
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {
    console.error(`Nao consegui parsear ${file}: ${e.message}`);
    continue;
  }
  if (!Array.isArray(json) || !json.length || !json[0].command || !json[0].metadata) {
    console.log(`Aviso: ${path.basename(file)} nao bate com o schema esperado, pulando.`);
    continue;
  }

  const flowName = flowNameOf(file);

  // screenshots: pelo nome (estrutura antiga) ou pela mesma pasta do flow,
  // desde que o arquivo nao esteja marcado com o nome de outro flow
  const flowDir = path.dirname(file);

  const localShots = screenshotFiles.filter((f) => {
      const relative = path.relative(flowDir, f);

      return (
          !relative.startsWith("..") &&
          !path.isAbsolute(relative)
      );
  });

  // rastreia screenshots ja usados NESTE flow, pra nao anexar a mesma imagem
  // em dois passos diferentes (ex: runFlowCommand + o passo real que falhou)
  const usedShots = new Set();

  // janelas de tempo de wrappers (retryCommand, runFlowCommand) que no final
  // terminaram OK. Uma tentativa que falhou dentro dessas janelas foi
  // recuperada pelo proprio Maestro (ex: retry conseguiu na 2a tentativa) e
  // nao deve contar como falha real do flow.
  const successfulWrapperWindows = [];
  for (const step of json) {
    const wType = Object.keys(step.command)[0];
    if ((wType === 'retryCommand' || wType === 'runFlowCommand') && statusClass(step.metadata?.status) === 'ok') {
      const start = step.metadata?.timestamp ?? 0;
      const duration = step.metadata?.duration ?? 0;
      successfulWrapperWindows.push({ start, end: start + duration });
    }
  }
  function shadowedByRecovery(timestamp) {
    return successfulWrapperWindows.some((w) => timestamp >= w.start && timestamp <= w.end);
  }

  const steps = json
    .map((step) => {
      const type = Object.keys(step.command)[0];
      const body = step.command[type];
      const status = step.metadata?.status || 'UNKNOWN';
      const isFail = statusClass(status) === 'fail';
      // runFlowCommand e retryCommand so espelham o erro/estado do passo que
      // realmente falhou dentro deles, entao nao anexam screenshot nem repetem
      // a mensagem de erro aqui, senao duplica os dois no relatorio.
      const isWrapperCommand = type === 'runFlowCommand' || type === 'retryCommand';
      // uma tentativa que falhou mas foi recuperada por um retry bem sucedido
      // continua aparecendo como falha NESTE passo (e correto mostrar que essa
      // tentativa especifica falhou), mas nao conta pro resultado do flow
      const recovered = isFail && !isWrapperCommand && shadowedByRecovery(step.metadata?.timestamp ?? 0);
      let shot = null;
      if (isFail && !isWrapperCommand && !recovered && localShots.length) {
        const target = step.metadata?.timestamp ?? 0;
        // prioriza screenshot ainda nao usado por outro passo falho deste flow
        // (evita anexar a mesma imagem duas vezes quando duas asserções falham
        // em sequencia, ex: extendedWaitUntil seguido de assertVisible redundante)
        const disponiveis = localShots.filter((f) => !usedShots.has(f));
        const candidatos = disponiveis.length ? disponiveis : localShots;
        shot = [...candidatos].sort(
          (a, b) => Math.abs((screenshotTimestamp(a) ?? 0) - target) - Math.abs((screenshotTimestamp(b) ?? 0) - target)
        )[0];
        if (shot) usedShots.add(shot);
      }
      return {
        sequenceNumber: step.metadata?.sequenceNumber ?? 0,
        status,
        label: humanLabel(type, body),
        duration: step.metadata?.duration ?? null,
        timestamp: step.metadata?.timestamp ?? 0,
        // idem: nao repete o texto do erro no wrapper, nem numa tentativa
        // recuperada por retry (o passo real ja mostra a mensagem completa,
        // ou nem chega a ser um problema porque o retry deu certo depois)
        error: isWrapperCommand || recovered ? null : extractError(step),
        screenshot: shot ? path.relative(path.dirname(outPath), shot).split(path.sep).join('/') : null,
        // continua exibindo o icone de falha neste passo especifico (a
        // tentativa realmente falhou), mas nao conta pro resultado do flow
        recovered,
      };
    })
    .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  const counts = steps.reduce(
    (acc, s) => {
      // uma tentativa recuperada por retry nao deve contar como falha do
      // flow, mesmo que o icone do passo continue mostrando que ela falhou
      acc[s.recovered ? 'ok' : statusClass(s.status)]++;
      return acc;
    },
    { ok: 0, fail: 0, skipped: 0, unknown: 0 }
  );

  const withDuration = steps.filter((s) => s.duration != null);
  const start = withDuration.length ? Math.min(...withDuration.map((s) => s.timestamp)) : 0;
  const end = withDuration.length ? Math.max(...withDuration.map((s) => s.timestamp + s.duration)) : 0;
  const flowDuration = end - start;
  const firstError = steps.find((s) => s.error)?.error || null;

  flows.push({ name: flowName, steps, counts, duration: flowDuration, error: firstError });
}

flows.sort((a, b) => a.name.localeCompare(b.name));

const totalFlows = flows.length;
const failedFlows = flows.filter((f) => f.counts.fail > 0);
const okFlows = totalFlows - failedFlows.length;
const totalDuration = flows.reduce((a, f) => a + f.duration, 0);

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function encodePath(relPath) {
  // encodeURI nao escapa "?", "(" e outros caracteres que podem aparecer
  // no nome do arquivo (inclusive o "?" que o Java grava no lugar de emoji
  // quando o runner do CI nao tem locale UTF-8, ex: LANG vazio). Escapa
  // segmento por segmento pra nao mexer nas barras do caminho.
  return relPath.split('/').map(encodeURIComponent).join('/');
}

const flowBlocks = flows
  .map((flow, fi) => {
    const hasFail = flow.counts.fail > 0;
    const state = hasFail ? 'ERROR' : 'PASSED';
    const stateClass = hasFail ? 'fail' : 'ok';

    const shotsForFlow = [];
    const stepsHtml = flow.steps
      .map((s) => {
        const cls = s.recovered ? 'recovered' : statusClass(s.status);
        if (s.screenshot) {
          shotsForFlow.push({ src: encodePath(s.screenshot), caption: s.label });
        }
        const errHtml = s.error ? `<div class="err">${esc(s.error)}</div>` : '';
        const recoveredTag = s.recovered ? '<span class="tag-recovered">recuperado pelo retry</span>' : '';
        return `
        <div class="step ${cls}">
          <span class="icon">${statusIcon(s.status)}</span>
          <span class="label">${esc(s.label)}</span>
          ${recoveredTag}
          <span class="dur">${fmtDuration(s.duration)}</span>
        </div>${errHtml}`;
      })
      .join('');

    const shotsHtml = shotsForFlow.length
      ? `<div class="shots">${shotsForFlow
          .map(
            (s) =>
              `<a href="${esc(s.src)}" target="_blank" rel="noopener"><img src="${esc(s.src)}" alt="Screenshot"></a><div class="shot-caption">${esc(s.caption)}</div>`
          )
          .join('')}</div>`
      : '';

    return `
    <div class="flow ${stateClass}">
      <div class="flow-header" onclick="toggleFlow(${fi})">
        <span class="chevron" id="chev-${fi}">${hasFail ? '\u25BC' : '\u25B6'}</span>
        <span class="flow-name">${esc(flow.name)}</span>
        <span class="flow-state ${stateClass}">${state}</span>
        <span class="flow-dur">${fmtDuration(flow.duration)}</span>
      </div>
      <div class="flow-body${shotsForFlow.length ? ' with-shots' : ''}" id="body-${fi}" style="display:${hasFail ? 'grid' : 'none'};">
        <div class="flow-steps">
          ${flow.error ? `<div class="flow-error">${esc(flow.error)}</div>` : ''}
          ${stepsHtml}
        </div>
        ${shotsHtml}
      </div>
    </div>`;
  })
  .join('');

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatorio de Testes</title>
<style>
  :root { --ok:#1e8e3e; --fail:#d93025; --bg:#f5f6f8; --panel:#fff; --border:#e2e4e8; --ink:#1c1e21; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:-apple-system,Segoe UI,Roboto,sans-serif; background:var(--bg); color:var(--ink); }
  header { padding:16px 24px; background:#1a1a2e; color:#fff; }
  header h1 { margin:0 0 4px; font-size:18px; }
  header .summary { font-size:13px; color:#c9cdf5; }
  header .summary b.ok { color:#7CE38B; }
  header .summary b.fail { color:#ff8a80; }
  header .env { font-size:12px; color:#8a8fc4; margin-top:4px; }
  .layout { max-width:1600px; margin:0 auto; padding:24px clamp(16px, 4vw, 64px); }
  .flow { background:var(--panel); border:1px solid var(--border); border-left:4px solid var(--border); border-radius:8px; margin-bottom:12px; overflow:hidden; }
  .flow.fail { border-left-color:var(--fail); }
  .flow.ok { border-left-color:var(--ok); }
  .flow-header { display:flex; align-items:center; gap:10px; padding:12px 16px; cursor:pointer; user-select:none; }
  .flow-header:hover { background:#fafafa; }
  .chevron { font-size:11px; color:#888; width:12px; }
  .flow-name { font-weight:600; font-family:monospace; flex:1; }
  .flow-state { font-size:12px; padding:2px 8px; border-radius:10px; font-weight:600; }
  .flow-state.ok { background:#e6f4ea; color:var(--ok); }
  .flow-state.fail { background:#fce8e6; color:var(--fail); }
  .flow-dur { font-size:12px; color:#888; min-width:44px; text-align:right; }
  .flow-body { border-top:1px solid var(--border); padding:10px 16px 14px 40px; }
  .flow-body.with-shots { display:grid; grid-template-columns: minmax(0, 1fr) clamp(240px, 26vw, 420px); gap:20px; align-items:start; }
  .flow-error { background:#fde7e7; color:#7a0000; padding:8px 10px; border-radius:6px; font-family:monospace; font-size:12px; margin:10px 0; white-space:pre-wrap; }
  .step { display:flex; align-items:center; gap:8px; padding:5px 6px; border-radius:5px; font-size:13px; font-family:monospace; }
  .step .icon { width:18px; text-align:center; }
  .step .label { flex:1; }
  .step .dur { color:#999; font-size:11px; min-width:40px; text-align:right; }
  .step.fail .label { color:var(--fail); }
  .step.skipped .label { color:#888; }
  .step.recovered .label { color:#8a6d00; }
  .tag-recovered { font-size:10px; color:#8a6d00; background:#fff4d6; padding:1px 6px; border-radius:8px; }
  .err { margin:2px 0 6px 26px; padding:6px 8px; background:#fde7e7; color:#7a0000; border-radius:5px; font-family:monospace; font-size:11px; white-space:pre-wrap; }
  .shots { position:sticky; top:16px; }
  .shots a { display:block; }
  .shots img { width:100%; border-radius:6px; border:1px solid var(--border); margin-bottom:4px; cursor:zoom-in; transition:opacity .15s; }
  .shots img:hover { opacity:0.85; }
  .shot-caption { font-size:11px; color:#666; margin-bottom:12px; font-family:monospace; word-break:break-word; }
</style>
</head>
<body>
<header>
  <h1>Relatorio de Testes</h1>
  <div class="summary">${totalFlows} flow(s) — <b class="ok">${okFlows} ok</b> — <b class="fail">${failedFlows.length} falha(s)</b> — ${fmtDuration(totalDuration)}</div>
  ${
    envInfo
      ? `<div class="env">${[
          envInfo.maestroVersion ? `Maestro ${esc(envInfo.maestroVersion)}` : null,
          envInfo.os ? esc(envInfo.os) : null,
          envInfo.device ? esc(envInfo.device) : null,
          envInfo.platform ? esc(envInfo.platform) : null,
          envInfo.resolution ? esc(envInfo.resolution) : null,
        ]
          .filter(Boolean)
          .join(' · ')}</div>`
      : ''
  }
</header>
<div class="layout">
  ${flowBlocks}
</div>
<script>
  function toggleFlow(i) {
    const body = document.getElementById('body-' + i);
    const chev = document.getElementById('chev-' + i);
    const open = body.style.display !== 'none';
    body.style.display = open ? 'none' : (body.classList.contains('with-shots') ? 'grid' : 'block');
    chev.textContent = open ? '\u25B6' : '\u25BC';
  }
</script>
</body>
</html>`;

fs.mkdirSync(path.dirname(outPath) || '.', { recursive: true });
fs.writeFileSync(outPath, html, 'utf-8');
console.log(`Relatorio: ${outPath}`);