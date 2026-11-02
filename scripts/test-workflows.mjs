import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
const dir = await mkdtemp(join(tmpdir(), "lume-workflows-"));
try {
  const output = join(dir, "workflows.mjs");
  await build({
    stdin: {
      contents: `export {createMockCaseRepository} from './src/modules/cases/data/mock-case-repository'; export {createMockNetworkRepository} from './src/modules/network/data/mock-network-repository'; export {withSimulation} from './src/modules/simulation/data/simulated-case-repository'; export {applyDelivery} from './src/modules/network/domain/network'; export {createBrowserDraftStore} from './src/modules/intake/data/browser-draft-store'; export {compareVersions} from './src/modules/review/domain/version-comparison'; export {buildFollowUpTasks} from './src/modules/operations/domain/operations'; export {createMockOperationsRepository} from './src/modules/operations/data/mock-operations-repository';`,
      resolveDir: process.cwd(),
    },
    outfile: output,
    platform: "node",
    format: "esm",
    bundle: true,
    logLevel: "silent",
  });
  const {
    createMockCaseRepository,
    createMockNetworkRepository,
    withSimulation,
    applyDelivery,
    createBrowserDraftStore,
    compareVersions,
    buildFollowUpTasks,
    createMockOperationsRepository,
  } = await import(pathToFileURL(output).href);
  const cases = createMockCaseRepository();
  assert.equal(
    (await cases.searchPublic({ from: "2026-10-28", to: "2026-10-29" })).total,
    2,
  );
  assert.equal(
    (
      await cases.searchPublic({
        from: "2026-10-28",
        to: "2026-10-29",
        dateField: "reviewed",
      })
    ).total,
    0,
  );
  const first = await cases.searchPublic({
    sort: "name",
    page: 1,
    pageSize: 2,
  });
  const second = await cases.searchPublic({
    sort: "name",
    page: 2,
    pageSize: 2,
  });
  assert.equal(first.total, 4);
  assert.equal(
    new Set([...first.items, ...second.items].map((c) => c.id)).size,
    4,
  );
  const input = {
    name: "Pessoa Exemplo",
    age: "39",
    city: "São Paulo",
    neighborhood: "Centro",
    missingSince: "2026-10-20",
    description: "Descrição autorizada fictícia.",
    clothing: "Não informado.",
    source: "Fonte de demonstração",
    evidence: "CONTEÚDO RESERVADO",
    authorized: false,
  };
  const draft = await cases.saveDraft(null, input, undefined, {
    idempotencyKey: "create",
  });
  assert.deepEqual(
    await cases.saveDraft(null, input, undefined, { idempotencyKey: "create" }),
    draft,
  );
  await assert.rejects(
    cases.saveDraft(null, { ...input, name: "Outro" }, undefined, {
      idempotencyKey: "create",
    }),
    (e) => e.code === "conflict",
  );
  await assert.rejects(
    cases.submitDraft(draft.id, draft.revision),
    /autorização/,
  );
  const saved = await cases.saveDraft(
    draft.id,
    { ...input, authorized: true },
    draft.revision,
  );
  await assert.rejects(
    cases.saveDraft(saved.id, input, 1),
    (e) => e.code === "conflict",
  );
  const id = await cases.submitDraft(saved.id, saved.revision, {
    idempotencyKey: "submit",
  });
  assert.equal(
    await cases.submitDraft(saved.id, saved.revision, {
      idempotencyKey: "submit",
    }),
    id,
  );
  assert.equal((await cases.listDrafts()).length, 0);
  assert.equal(await cases.getPublic(id), null);
  const network = createMockNetworkRepository(cases);
  await network.listPartners();
  await cases.decide(id, "published", "Conferido", 1, {
    idempotencyKey: "publish",
  });
  await cases.decide(id, "published", "Conferido", 1, {
    idempotencyKey: "publish",
  });
  const published = await cases.getPublic(id);
  for (const field of [
    "evidence",
    "history",
    "suggestions",
    "authorized",
    "versions",
  ])
    assert.equal(field in published, false);
  let library = (await network.listPartners()).find((p) => p.id === "library");
  assert.ok(library.deliveries.some((d) => d.caseId === id && d.snapshot));
  const stale = structuredClone(
    library.deliveries.find((d) => d.caseId === id),
  );
  await network.setConnection("library", "offline");
  await cases.decide(id, "withdrawn", "Retirada", 2);
  library = (await network.listPartners()).find((p) => p.id === "library");
  assert.ok(library.pending > 0);
  await network.expire("library");
  library = (await network.listPartners()).find((p) => p.id === "library");
  assert.ok(library.deliveries.every((d) => d.snapshot === null));
  await network.setConnection("library", "connected");
  library = (await network.listPartners()).find((p) => p.id === "library");
  assert.equal(
    library.deliveries.find((d) => d.caseId === id).kind,
    "withdraw",
  );
  assert.ok(
    library.deliveries.some((d) => d.caseId === "ana-lucia" && d.snapshot),
  );
  assert.equal(applyDelivery(library.deliveries, stale), false);
  assert.deepEqual(await cases.getPublicDetail(id), {
    state: "withdrawn",
    record: null,
  });
  assert.deepEqual(await cases.getPublicDetail("unknown"), {
    state: "unavailable",
    record: null,
  });
  await assert.rejects(
    cases.decide("antonio-lima", "published", "Conferido", 1),
    /divergências/,
  );
  await assert.rejects(
    cases.resolveSuggestion(
      "antonio-lima",
      "municipality",
      "Guarulhos",
      "trecho inventado",
      "Correção",
      1,
    ),
    /trecho/,
  );
  await cases.resolveSuggestion(
    "antonio-lima",
    "municipality",
    "Guarulhos",
    "Município: Guarulhos",
    "Registro original conferido",
    1,
  );
  await cases.decide("antonio-lima", "published", "Conferido", 2);
  assert.equal((await cases.getPublic("antonio-lima")).city, "Guarulhos");
  const demo = withSimulation(cases);
  demo.simulation.configure({ role: "viewer" });
  assert.ok((await demo.cases.listPublic()).length);
  await assert.rejects(demo.cases.listReview(), (e) => e.code === "forbidden");
  demo.simulation.configure({ role: "reviewer", unavailable: true });
  await assert.rejects(
    demo.cases.listPublic(),
    (e) => e.code === "unavailable",
  );
  demo.simulation.configure({ unavailable: false, conflictNextWrite: true });
  await assert.rejects(
    demo.cases.decide("beatriz-santos", "published", "Teste", 1),
    (e) => e.code === "conflict",
  );
  assert.equal(demo.simulation.getState().conflictNextWrite, false);
  assert.equal(
    (await cases.listReview()).find((c) => c.id === "beatriz-santos").revision,
    1,
  );
  assert.equal((await createMockCaseRepository().listDrafts()).length, 0);
  // Persistent adapter restores drafts only; private state never enters public snapshots.
  const local = new Map();
  let failWrite = false;
  const storage = {
    getItem: (key) => local.get(key) ?? null,
    setItem: (key, value) => {
      if (failWrite) throw new Error("quota");
      local.set(key, value);
    },
  };
  const store = createBrowserDraftStore(() => storage);
  const tabA = createMockCaseRepository(store),
    tabB = createMockCaseRepository(store);
  const localDraft = await tabA.saveDraft(null, input);
  assert.deepEqual(await tabB.getDraft(localDraft.id), localDraft);
  const nextDraft = await tabB.saveDraft(
    localDraft.id,
    { ...input, name: "Changed in another tab" },
    localDraft.revision,
  );
  await assert.rejects(
    tabA.saveDraft(localDraft.id, input, localDraft.revision),
    (e) => e.code === "conflict",
  );
  failWrite = true;
  await assert.rejects(
    tabB.saveDraft(localDraft.id, input, nextDraft.revision),
    /Não foi possível salvar/,
  );
  assert.deepEqual(await tabA.getDraft(localDraft.id), nextDraft);
  failWrite = false;
  const existingStorage = [...local.entries()];
  local.set("lume:demo-drafts:v1", "broken-json");
  await assert.rejects(tabA.saveDraft(null, input), /não foram substituídos/);
  assert.equal(local.get("lume:demo-drafts:v1"), "broken-json");
  local.clear();
  existingStorage.forEach(([k, v]) => local.set(k, v));
  const submitted = await tabA.saveDraft(
    localDraft.id,
    { ...input, authorized: true },
    nextDraft.revision,
  );
  await tabA.submitDraft(submitted.id, submitted.revision);
  assert.equal((await tabB.listDrafts()).length, 0);
  const versions = (await cases.listReview()).find((c) => c.id === id).versions;
  assert.deepEqual(
    versions.map((v) => v.revision),
    [1, 2, 3],
  );
  assert.equal(versions[0].status, "in_review");
  assert.equal(versions[1].status, "published");
  assert.equal(versions[2].status, "withdrawn");
  assert.ok(
    compareVersions(versions[1], versions[2]).some(
      (row) => row.label === "Situação da publicação" && row.changed,
    ),
  );
  versions[0].fields.name = "Mutated copy";
  assert.notEqual(
    (await cases.listReview()).find((c) => c.id === id).versions[0].fields.name,
    "Mutated copy",
  );
  const operations = createMockOperationsRepository(() => {});
  let tasks = buildFollowUpTasks(
    await cases.listReview(),
    await network.listPartners(),
    await operations.listSources(),
    Date.now(),
  );
  assert.ok(tasks.some((t) => t.id === "source:regional"));
  assert.ok(!tasks.some((t) => t.id === `review:${id}`));
  await operations.simulateSourceUpdate("regional");
  tasks = buildFollowUpTasks(
    await cases.listReview(),
    await network.listPartners(),
    await operations.listSources(),
    Date.now(),
  );
  assert.ok(!tasks.some((t) => t.id === "source:regional"));
  const denied = createMockOperationsRepository(() => {
    throw new Error("denied");
  });
  await assert.rejects(denied.listSources(), /denied/);
  await assert.rejects(denied.simulateSourceUpdate("regional"), /denied/);
  console.log(
    "PASS: local draft reload, cross-tab revisions, write failure atomicity, corrupted storage preservation, version snapshots and follow-up resolution.",
  );
  console.log(
    "PASS: periods, pagination, draft validation/resume/submission, idempotency, public projection, evidence correction, offline expiration, withdrawal revisions, stale-event rejection, permissions and failures.",
  );
} finally {
  await rm(dir, { recursive: true, force: true });
}
