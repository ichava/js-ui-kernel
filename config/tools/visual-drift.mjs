#!/usr/bin/env node
/**
 * Prints a markdown table of how far each changed visual baseline moved.
 *
 *   node scripts/visual-drift.mjs <playwright-json-report> <changed snapshot path>...
 *
 * The report comes from a compare run (`--reporter=json`) taken before the baselines were
 * regenerated, so its failures say how many pixels each one differs by. Used by
 * visual-baselines.yml for its pull request comment and by `npm run visual:linux` locally,
 * so both describe a change the same way.
 */
import { readFileSync } from 'node:fs';

const [report, ...changed] = process.argv.slice(2);
if (!report) {
  console.error('usage: visual-drift.mjs <report.json> <changed snapshot>...');
  process.exit(2);
}

/** "N pixels (ratio R ...)" and an optional size change, per snapshot name. */
function driftFrom(json) {
  const drift = {};
  const walk = (suite) => {
    for (const spec of suite.specs ?? [])
      for (const test of spec.tests ?? [])
        for (const result of test.results ?? [])
          for (const error of result.errors ?? []) {
            const msg = error.message ?? '';
            const m = /(\d+) pixels \(ratio ([\d.]+)[^)]*\)[\s\S]*?Snapshot: (\S+\.png)/.exec(msg);
            const size = /Expected an image (\d+px by \d+px), received (\d+px by \d+px)/.exec(msg);
            if (m) drift[m[3]] = `${Number(m[1]).toLocaleString('en')} px (${(Number(m[2]) * 100).toFixed(0)}%)` + (size ? `, size ${size[1]} to ${size[2]}` : '');
          }
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const suite of json.suites ?? []) walk(suite);
  return drift;
}

let drift = {};
try {
  drift = driftFrom(JSON.parse(readFileSync(report, 'utf8')));
} catch (e) {
  console.error(`visual-drift: no usable report (${e.message}); sizes are unmeasured`);
}

const rows = changed.map((file) => {
  const name = file.split('/').pop();
  const key = name.replace(/-chromium-linux\.png$/, '.png');
  return `| \`${name}\` | ${drift[key] ?? 'new or unmeasured'} |`;
});
console.log(['| Baseline | Pixels changed |', '|---|---|', ...rows].join('\n'));
