// tsc emits the React subpath's code but not the files beside it, so the build copies them:
// the Untitled UI stylesheet (exported as ./react/uui-theme.css) and Untitled UI's MIT licence,
// which has to travel with the components it covers.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = ['react/styles/uui-theme.css', 'react/LICENSE-untitledui'];
for (const file of FILES) {
  mkdirSync(dirname(join(root, 'dist', file)), { recursive: true });
  copyFileSync(join(root, 'src', file), join(root, 'dist', file));
}
console.log(`copy-react-assets: ${FILES.length} files -> dist/react`);
