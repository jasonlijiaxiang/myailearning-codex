import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const modulesDirectory = path.resolve("app/i18n/en/modules");
const files = (await readdir(modulesDirectory)).filter((name) => name.endsWith(".mjs")).sort();
const modules = await Promise.all(files.map(async (file) => {
  const { englishModule } = await import(pathToFileURL(path.join(modulesDirectory, file)).href);
  return englishModule;
}));

function collectConflicts(field) {
  const valuesById = new Map();
  for (const localizedModule of modules) {
    for (const [id, value] of Object.entries(localizedModule[field] ?? {})) {
      const serialized = JSON.stringify(value);
      const entries = valuesById.get(id) ?? [];
      const existing = entries.find((entry) => entry.serialized === serialized);
      if (existing) existing.modules.push(localizedModule.slug);
      else entries.push({ modules: [localizedModule.slug], value, serialized });
      valuesById.set(id, entries);
    }
  }
  return Object.fromEntries([...valuesById.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([id, entries]) => [id, entries.map(({ modules: owners, value }) => ({ modules: owners, value }))]));
}

const report = {
  generatedAt: new Date().toISOString(),
  moduleCount: modules.length,
  terms: collectConflicts("terms"),
  sources: collectConflicts("sources"),
};

console.log(JSON.stringify(report, null, 2));
