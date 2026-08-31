import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const readJson = (...parts) => JSON.parse(readFileSync(join(root, ...parts), "utf8"));

test("running evidence registry is auditable and decision-oriented", () => {
  const registry = readJson("data", "running", "training-assets.json");
  const assets = Object.values(registry.categories).flat();

  assert.equal(registry.meta.last_verified, "2026-08-31");
  assert.ok(assets.length >= 16);
  assert.equal(new Set(assets.map((asset) => asset.id)).size, assets.length);

  for (const asset of assets) {
    assert.ok(asset.id);
    assert.ok(asset.title);
    assert.match(asset.url, /^https:\/\//);
    assert.ok(asset.year >= 1980 && asset.year <= 2026);
    assert.ok(asset.evidence_type);
    assert.ok(asset.decision_use.length >= 1);
    assert.ok(asset.limitations.length >= 1);
    assert.equal(asset.last_verified, "2026-08-31");
  }
});

test("running program contract exposes plan, readiness, and safety limits", () => {
  const program = readJson("data", "running", "training-program.json");
  const taxonomy = readJson("data", "running", "athlete-taxonomy.json");

  assert.deepEqual(program.plan_limits.weeks, { min: 8, max: 30 });
  assert.deepEqual(program.plan_limits.run_days, { min: 3, max: 7 });
  assert.deepEqual(Object.keys(program.phases), ["foundation", "build", "specific", "taper"]);
  assert.deepEqual(Object.keys(taxonomy.levels), ["beginner", "intermediate", "advanced", "competitive"]);
  assert.ok(program.readiness.red.stop_training);
  assert.ok(program.safety.red_flags.includes("chest pain"));
  assert.equal(program.calendar.default_start_time, "06:30");
});
