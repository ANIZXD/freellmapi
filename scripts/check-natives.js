// Find every *.node native binary under node_modules and test-load each one.
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name === ".git") continue;
      walk(p, out);
    } else if (e.name.endsWith(".node")) out.push(p);
  }
  return out;
}

const files = walk("node_modules");
console.log("found " + files.length + " native binaries");

async function check(f) {
  const code = `try { require(${JSON.stringify(path.resolve(f))}); console.log("OK"); }
catch (e) { console.log("BAD: " + String(e.message).split(String.fromCharCode(10))[0]); }`;
  return new Promise((res) => {
    execFile(process.execPath, ["-e", code], { cwd: process.cwd() }, (e, so, se) =>
      res(so && so.trim() ? so.trim() : "BAD: spawn: " + (e ? e.message : se))
    );
  });
}

(async () => {
  let bad = 0;
  for (const f of files) {
    const r = await check(f);
    if (!r.startsWith("OK")) {
      bad++;
      console.log("BROKEN " + f + " => " + r);
    }
  }
  console.log("done: " + (files.length - bad) + " ok, " + bad + " broken");
})();
