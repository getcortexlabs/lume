import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";

const directory = await mkdtemp(join(tmpdir(), "lume-preferences-"));
try {
  const output = join(directory, "preferences.mjs");
  await build({
    entryPoints: ["src/modules/preferences/domain/preferences.ts"],
    outfile: output,
    platform: "node",
    format: "esm",
    bundle: true,
    logLevel: "silent",
  });
  const { defaultPreferences, parsePreferences, publicSearchQuery } =
    await import(pathToFileURL(output).href);
  const first = defaultPreferences(),
    second = defaultPreferences();
  first.searches.push({ id: "first", name: "First", query: {} });
  assert.equal(second.searches.length, 0);
  for (const invalid of [null, [], "text", {}, { version: 2 }]) {
    assert.throws(() => parsePreferences(invalid));
  }
  assert.deepEqual(
    publicSearchQuery({
      city: "Suzano",
      sort: "name",
      page: "8",
      from: "2026-02-31",
      private: "discard",
      search: ["unexpected"],
    }),
    { city: "Suzano", sort: "name" },
  );
  assert.deepEqual(
    publicSearchQuery({
      city: "unknown",
      age: "unknown",
      search: "x".repeat(201),
      from: "2026-03-01",
      dateField: "reviewed",
    }),
    { dateField: "reviewed", from: "2026-03-01" },
  );
  const parsed = parsePreferences({
    ...second,
    region: "unknown",
    motion: "unsafe",
    contrast: "high",
    searches: [
      null,
      { id: "../bad", name: "Bad" },
      {
        id: "safe",
        name: " a ",
        query: { city: "Suzano", private: "discard" },
      },
      { id: "safe", name: "Duplicate" },
    ],
  });
  assert.equal(parsed.region, "");
  assert.equal(parsed.motion, "system");
  assert.equal(parsed.contrast, "high");
  assert.deepEqual(parsed.searches, [
    { id: "safe", name: "a", query: { city: "Suzano" } },
  ]);
  const many = parsePreferences({
    ...second,
    searches: Array.from({ length: 15 }, (_, i) => ({
      id: `search-${i}`,
      name: "x".repeat(80),
      query: {},
    })),
  });
  assert.equal(many.searches.length, 10);
  assert.ok(many.searches.every((entry) => entry.name.length === 60));
  console.log(
    "PASS: preference isolation, version validation, public query allowlist, valid dates, duplicate identifiers, and storage limits.",
  );
} finally {
  await rm(directory, { recursive: true, force: true });
}
