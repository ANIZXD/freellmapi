// Generate the OpenCode V2 provider config for FreeLLMAPI from the live /v1/models catalog.
const fs = require("fs");
const path = require("path");
const os = require("os");

const BASE = "http://127.0.0.1:3001";
const keyFile = path.join(os.homedir(), ".config", "opencode", "freellmapi.key");
const key = fs.readFileSync(keyFile, "utf8").trim();

(async () => {
  const res = await fetch(BASE + "/v1/models", { headers: { Authorization: "Bearer " + key } });
  if (!res.ok) throw new Error("models fetch " + res.status);
  const { data } = await res.json();

  const models = {};
  for (const m of data) {
    const ctx = m.context_window || m.context_length || 200000;
    const entry = {
      name: m.name || m.id,
      limit: { context: ctx, output: m.id === "auto" || m.id === "fusion" ? 65536 : 32768 },
    };
    if (m.context_window == null && m.context_length == null) delete entry.limit.context;
    models[m.id] = entry;
  }

  const config = {
    $schema: "https://opencode.ai/config.json",
    model: "freellmapi/auto",
    providers: {
      freellmapi: {
        name: "FreeLLMAPI (local)",
        package: "@opencode/ai/providers/openai-compatible",
        settings: {
          baseURL: BASE + "/v1",
          apiKey: "{file:~/.config/opencode/freellmapi.key}",
        },
        models,
      },
    },
  };

  const out = path.join(os.homedir(), ".config", "opencode", "opencode.jsonc");
  fs.writeFileSync(out, JSON.stringify(config, null, 2) + "\n");
  console.log("wrote " + out + " with " + Object.keys(models).length + " models");
})();
