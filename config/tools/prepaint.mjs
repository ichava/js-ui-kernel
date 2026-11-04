// The static prepaint loader (src/boot/prepaint.html): one source, two outputs.
//
//   injectPrepaint()  inlines it as the first child of <body> in the standalone index.html,
//                     so the loader paints on the first HTML parse instead of after the bundle.
//   emitPrepaint()    ships it as dist/lib/prepaint.html for hosts (icon-browser's Blade
//                     layout, the demo) to inline the same way.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolved from the package root when this module's URL is not a usable file: URL, which is
// the case under vitest's jsdom environment. Every script here runs from that root.
function sourcePath() {
  try {
    return fileURLToPath(new URL('../src/boot/prepaint.html', import.meta.url).href);
  } catch {
    return join(process.cwd(), 'src/boot/prepaint.html');
  }
}

/** Where a surface's brand suffix goes ("Browser" in the app), after the brand name. */
export const SUFFIX_SLOT = '<!--ichava:suffix-->';

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/**
 * The fragment without its leading documentation comment, with the suffix slot filled: the
 * Bootsplash's `ichbs__suffix` span for a surface that has one, nothing otherwise.
 */
export function prepaintFragment({ suffix = '' } = {}) {
  const raw = readFileSync(sourcePath(), 'utf8').replace(/^\s*<!--[\s\S]*?-->\s*/, '').trim();
  if (!raw.includes(SUFFIX_SLOT)) throw new Error('prepaint: the fragment has no suffix slot');
  return raw.replace(SUFFIX_SLOT, suffix ? `<span class="ichbs__suffix">${escapeHtml(suffix)}</span>` : '');
}

/** Insert `fragment` straight after the opening <body> tag; throws when there is none. */
export function insertAfterBody(html, fragment) {
  // Comments are blanked to the same length first: index.html's header comment mentions
  // "<body>", and the first build injected the loader inside that comment, where it never
  // rendered.
  const masked = html.replace(/<!--[\s\S]*?-->/g, (c) => ' '.repeat(c.length));
  const m = /<body\b[^>]*>/i.exec(masked);
  if (!m) throw new Error('prepaint: no <body> tag to inject into');
  const at = m.index + m[0].length;
  return `${html.slice(0, at)}\n${fragment}\n${html.slice(at)}`;
}

/** Vite plugin: inline the prepaint into index.html (dev and build). */
export function injectPrepaint({ pages = ['index.html'], suffix = '' } = {}) {
  return {
    name: 'ichava:prepaint-inject',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const page = ctx.filename.split(/[\\/]/).pop();
        return pages.includes(page) ? insertAfterBody(html, prepaintFragment({ suffix })) : html;
      },
    },
  };
}

/** Vite plugin: emit the fragment as `prepaint.html` beside the library bundle. */
export function emitPrepaint({ suffix = '' } = {}) {
  return {
    name: 'ichava:prepaint-emit',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'prepaint.html', source: `${prepaintFragment({ suffix })}\n` });
    },
  };
}
