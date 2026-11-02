import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";

const directory = await mkdtemp(join(tmpdir(), "lume-domain-"));
try {
  const output = join(directory, "repository.mjs");
  await build({
    entryPoints: ["src/modules/cases/data/mock-case-repository.ts"],
    outfile: output,
    platform: "node",
    format: "esm",
    bundle: true,
    logLevel: "silent",
  });
  const { createMockCaseRepository } = await import(pathToFileURL(output).href);
  const repository = createMockCaseRepository();
  let changes = 0;
  const unsubscribe = repository.subscribe(() => changes++);
  const initial = await repository.listPublic();
  assert.equal(initial.length, 4);
  assert.equal(await repository.getPublic("beatriz-santos"), null);
  assert.equal(
    initial.some(
      (record) =>
        "evidence" in record || "history" in record || "status" in record,
    ),
    false,
  );
  assert.equal(
    (await repository.listPublic({ query: "ana lucia" }))[0].id,
    "ana-lucia",
  );
  assert.equal(
    (await repository.listPublic({ city: "Suzano", age: "60+" })).length,
    0,
  );
  assert.equal((await repository.listPublic({ age: "60+" })).length, 2);
  await assert.rejects(
    repository.decide("beatriz-santos", "published", "", 1),
    /motivo/,
  );
  await repository.decide(
    "beatriz-santos",
    "published",
    "Revisão de exemplo.",
    1,
  );
  assert.equal((await repository.listPublic()).length, 5);
  assert.equal((await repository.getPublic("beatriz-santos")).revision, 2);
  await assert.rejects(
    repository.decide("beatriz-santos", "withdrawn", "Versão antiga.", 1),
    /mudou/,
  );
  await repository.decide(
    "beatriz-santos",
    "withdrawn",
    "Pedido de retirada.",
    2,
  );
  assert.equal(await repository.getPublic("beatriz-santos"), null);
  assert.equal((await repository.listPublic({ city: "Suzano" })).length, 1);
  await assert.rejects(
    repository.decide("beatriz-santos", "published", "Não republicar.", 3),
    /nova autorização/,
  );
  assert.equal(changes, 2);
  unsubscribe();
  const reviews = await repository.listReview();
  reviews[0].name = "Mutação fora do repositório";
  assert.equal(
    (await repository.getPublic("ana-lucia")).name,
    "Ana Lúcia Ferreira",
  );
  initial[0].name = "Mutação da projeção pública";
  assert.equal(
    (await repository.getPublic("ana-lucia")).name,
    "Ana Lúcia Ferreira",
  );
  const fresh = createMockCaseRepository();
  assert.equal(
    (await fresh.listReview()).find((r) => r.id === "beatriz-santos").status,
    "in_review",
  );
  console.log(
    "PASS: public projection, accent-insensitive filters, publish/withdraw cycle, version conflicts, suppression, notifications, defensive copies, and per-app isolation.",
  );
} finally {
  await rm(directory, { recursive: true, force: true });
}
