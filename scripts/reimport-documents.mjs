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

function sanitizeText(input) {
  const withGenericHost = input.replace(/https?:\/\/[^\s`"'<>]+/gi, url => {
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//internal.example.com${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return url;
    }
  });

  const withGenericDomain = withGenericHost
    .replace(/\b(?:[a-z0-9-]+\.){2,}[a-z]{2,}(?::\d+)?\b/gi, 'internal.example.com');

  const withCompanyAlias = withGenericDomain
    .replace(/\bthai\s*bev\b/gi, 'Company');

  const withRedactedEmail = withCompanyAlias
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '<REDACTED_EMAIL>');

  const withRedactedAddress = withRedactedEmail
    .replace(/("?[A-Za-z0-9_]*Address"?\s*:\s*)"[^"]*"/g, '$1"<REDACTED_ADDRESS>"');

  const withRedactedNames = withRedactedAddress
    .replace(/("?(?:saleEmployeeName|customerName|shipToName|privilegeName|promotionName)"?\s*:\s*)"[^"]*"/gi, '$1"<REDACTED_TEXT>"');

  const withRedactedPhones = withRedactedNames
    .replace(/\b0(?:[689]\d{8}|[1-9]\d{7})\b/g, '<REDACTED_PHONE>');

  const withRedactedQuotedIds = withRedactedPhones
    .replace(/'(?=[^']*\d)[A-Za-z0-9-]{6,}'/g, '\'<REDACTED_ID>\'');

  const withRedactedLongIds = withRedactedQuotedIds
    .replace(/\bOS-T\d{5}-\d{10}\b/g, '<REDACTED_ID>')
    .replace(/\b(?=[A-Z0-9-]*\d)[A-Z0-9-]{8,}\b/g, '<REDACTED_ID>')
    .replace(/\b\d{8,}\b/g, '<REDACTED_ID>');

  return withRedactedLongIds;
}

function q(value) {
  return JSON.stringify(value);
}

const docs = txtFiles.map((fileName, index) => {
  const filePath = path.join(workspaceRoot, fileName);
  const content = sanitizeText(
    fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n').trim()
  );
  const title = sanitizeText(fileName.replace(/\.txt$/i, ''));
  const dateCreated = fs.statSync(filePath).mtime.toISOString().slice(0, 10);

  return {
    id: index + 1,
    title,
    category: toCategory(fileName),
    content,
    dateCreated,
    status: toStatus(fileName),
    fileName: sanitizeText(fileName)
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
