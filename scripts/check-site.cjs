const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const failures = [];

const requiredFiles = [
  'index.html',
  'styles.css',
  'app.js',
  'assets/favicon.svg',
  'assets/viarente-home.webp',
  'assets/viarente-navigator.webp',
  'assets/viarente-lead.webp',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing file: ${file}`);
}

const localRefs = [...html.matchAll(/(?:href|src)="([^"#]+)"/g)]
  .map((match) => match[1])
  .filter((ref) => !/^(?:https?:|mailto:|tel:)/.test(ref));

for (const ref of localRefs) {
  const cleanRef = ref.split('?')[0];
  if (!fs.existsSync(path.resolve(root, cleanRef))) failures.push(`Broken local reference: ${ref}`);
}

for (const id of ['main', 'services', 'work', 'process', 'brief', 'faq', 'top']) {
  if (!html.includes(`id="${id}"`)) failures.push(`Missing section id: ${id}`);
}

for (const phrase of ['гарантированно', 'быстро и дёшево', 'лучший разработчик', 'умею всё', 'AI-assisted', 'Codex']) {
  if (html.toLowerCase().includes(phrase.toLowerCase())) failures.push(`Risky public copy: ${phrase}`);
}

if (localRefs.some((ref) => ref.startsWith('../'))) failures.push('Standalone site must not link to parent directories');

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) failures.push(`Duplicate ids: ${[...new Set(duplicates)].join(', ')}`);

if ((html.match(/<h1\b/g) || []).length !== 1) failures.push('Page must contain exactly one h1');
if (!html.includes('name="viewport"')) failures.push('Missing viewport meta tag');
if (!css.includes('prefers-reduced-motion')) failures.push('Reduced motion support must be declared in CSS');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`OK: ${requiredFiles.length} required files, ${localRefs.length} local references and public copy verified`);
