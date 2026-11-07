const db = require("better-sqlite3")("data/freeapi.db", { readonly: true });
const tables = db.prepare("select name from sqlite_master where type='table' and name like '%model%'").all();
console.log("tables:", tables.map((t) => t.name).join(", "));
for (const t of tables) {
  try {
    const cols = db.prepare(`PRAGMA table_info(${t.name})`).all();
    console.log(t.name + " cols: " + cols.map((c) => c.name).join(","));
  } catch (e) { console.log(t.name + " err " + e.message); }
}
try {
  const row = db.prepare("select * from models limit 2").all();
  console.log("sample:", JSON.stringify(row, null, 1).slice(0, 1500));
} catch (e) { console.log("sample err " + e.message); }
