const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const catalogPath = path.join(__dirname, 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const p = catalog.products.find(x => x.handle === 'pomabrush-model-2-0');

const sqlPath = path.join(__dirname, 'update.sql');
const sql = `UPDATE product SET metadata = '${JSON.stringify(p.metadata).replace(/'/g, "''")}' WHERE handle = 'pomabrush-model-2-0';\n`;
fs.writeFileSync(sqlPath, sql, 'utf8');

try {
  execSync(`psql "postgres://postgres@localhost:5432/medusa_db" -f "${sqlPath}"`);
  console.log("✅ SUCCESSFULLY UPDATED MEDUSA METADATA IN POSTGRES DATABASE!");
} catch (e) {
  console.error("Error executing SQL file:", e.message);
}
