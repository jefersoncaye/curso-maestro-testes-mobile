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
  console.error(`Nenhum commands-*.json encontrado dentro de "${rootDir}".`);
  process.exit(1);
}

// usa so a run mais recente, ignora runs antigas na mesma pasta
const byRunDir = {};
for (const f of allCommandFiles) {
  const dir = path.dirname(f);
  (byRunDir[dir] = byRunDir[dir] || []).push(f);
}
const runDirs = Object.keys(byRunDir);
let latestDir = runDirs[0];
let latestMtime = -Infinity;
for (const d of runDirs) {
  const mtime = Math.max(...byRunDir[d].map((f) => fs.statSync(f).mtimeMs));
  if (mtime > latestMtime) {
    latestMtime = mtime;
    latestDir = d;
  }
}
const commandFiles = byRunDir[latestDir];
const ignoredRuns = runDirs.filter((d) => d !== latestDir);

console.log(`${commandFiles.length} flow(s) em ${path.basename(latestDir)}`);
if (ignoredRuns.length) {
  console.log(`${ignoredRuns.length} run(s) anterior(es) ignorada(s)`);
}

const screenshotFiles = allFiles.filter((f) => /\.(png|jpe?g)$/i.test(f) && path.dirname(f) === latestDir);

// maestro.log fica em .maestro/tests/<run>/, casa pelo nome da run
const latestRunName = path.basename(latestDir);
const logFile = allFiles.find((f) => path.basename(f) === 'maestro.log' && path.dirname(f).endsWith(latestRunName));
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

  const baseName = path.basename(file).replace(/\.json$/i, '');
  const flowName = (baseName.match(/^commands-\((.+)\)$/) || baseName.match(/^commands-(.+)$/) || [null, baseName])[1];

  const localShots = screenshotFiles.filter((f) => f.includes(`(${flowName})`));

  const steps = json
    .map((step) => {
      const type = Object.keys(step.command)[0];
      const body = step.command[type];
      const status = step.metadata?.status || 'UNKNOWN';
      const isFail = statusClass(status) === 'fail';
      let shot = null;
      if (isFail && localShots.length) {
        const target = step.metadata?.timestamp ?? 0;
        shot = [...localShots].sort(
          (a, b) => Math.abs((screenshotTimestamp(a) ?? 0) - target) - Math.abs((screenshotTimestamp(b) ?? 0) - target)
        )[0];
      }
      return {
        sequenceNumber: step.metadata?.sequenceNumber ?? 0,
        status,
        label: humanLabel(type, body),
        duration: step.metadata?.duration ?? null,
        timestamp: step.metadata?.timestamp ?? 0,
        error: extractError(step),
        screenshot: shot ? path.relative(path.dirname(outPath), shot).split(path.sep).join('/') : null,
      };
    })
    .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  const counts = steps.reduce(
    (acc, s) => {
      acc[statusClass(s.status)]++;
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

const totalFlows = flows.length;
const failedFlows = flows.filter((f) => f.counts.fail > 0);
const okFlows = totalFlows - failedFlows.length;
const totalDuration = flows.reduce((a, f) => a + f.duration, 0);

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

const flowBlocks = flows
  .map((flow, fi) => {
    const hasFail = flow.counts.fail > 0;
    const state = hasFail ? 'ERROR' : 'PASSED';
    const stateClass = hasFail ? 'fail' : 'ok';

    const shotsForFlow = [];
    const stepsHtml = flow.steps
      .map((s) => {
        const cls = statusClass(s.status);
        if (s.screenshot) {
          shotsForFlow.push({ src: encodeURI(s.screenshot), caption: s.label });
        }
        const errHtml = s.error ? `<div class="err">${esc(s.error)}</div>` : '';
        return `
        <div class="step ${cls}">
          <span class="icon">${statusIcon(s.status)}</span>
          <span class="label">${esc(s.label)}</span>
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