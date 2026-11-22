import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const manifest = new URL("../package.json", import.meta.url);
const data = JSON.parse(await readFile(manifest, "utf8"));
const require = createRequire(manifest);
for (const name of [
  ...Object.keys(data.dependencies || {}),
  ...Object.keys(data.devDependencies || {}),
].sort()) {
  const installed = JSON.parse(
    await readFile(
      new URL(`node_modules/${name}/package.json`, manifest),
      "utf8",
    ),
  );
  assert.equal(installed.name, name);
  assert.ok(installed.version, `Missing installed version for ${name}`);
  if (data.dependencies?.[name]) require.resolve(name);
  console.log(`${name}@${installed.version}`);
}
