import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(appRoot, '..');
const outputPath = path.join(appRoot, 'src', 'app', 'data', 'imported-documents.ts');

const txtFiles = fs
  .readdirSync(workspaceRoot, { withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.txt'))
  .map(entry => entry.name)
  .sort((a, b) => a.localeCompare(b, 'th'));

function toStatus(fileName) {
  return /uat/i.test(fileName) ? 'Archived' : 'Published';
}

function toCategory() {
  return 'Imported / Text';
}

function q(value) {
  return JSON.stringify(value);
}

const docs = txtFiles.map((fileName, index) => {
  const filePath = path.join(workspaceRoot, fileName);
  const content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n').trim();
  const title = fileName.replace(/\.txt$/i, '');
  const dateCreated = fs.statSync(filePath).mtime.toISOString().slice(0, 10);

  return {
    id: index + 1,
    title,
    category: toCategory(fileName),
    content,
    dateCreated,
    status: toStatus(fileName),
    fileName
  };
});

const lines = [];
lines.push("import { Manuscript } from '../models/document.model';");
lines.push('');
lines.push('export const importedDocuments: Manuscript[] = [');
for (const doc of docs) {
  lines.push('  {');
  lines.push(`    id: ${doc.id},`);
  lines.push(`    title: ${q(doc.title)},`);
  lines.push(`    category: ${q(doc.category)},`);
  lines.push(`    content: ${q(doc.content)},`);
  lines.push(`    dateCreated: new Date(${q(doc.dateCreated)}),`);
  lines.push(`    status: ${q(doc.status)} as Manuscript['status'],`);
  lines.push(`    fileName: ${q(doc.fileName)}`);
  lines.push('  },');
}
lines.push('];');
lines.push('');

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');

console.log(`Imported ${docs.length} text files into ${outputPath}`);
