import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
const dir = await mkdtemp(join(tmpdir(), "lume-pilot-"));
try {
  const file = join(dir, "app.mjs");
  await build({
    stdin: {
      contents: `export {createDemoServices} from './src/app/create-services'; export {emptyDraft} from './src/modules/intake/domain/draft'; export {guideProgress} from './src/modules/guide/domain/guide'; export {evidenceParts} from './src/modules/review/presentation/evidence'; export {displaySettings,leaseValid} from './src/modules/display/domain/display';`,
      resolveDir: process.cwd(),
    },
    outfile: file,
    bundle: true,
    platform: "node",
    format: "esm",
    logLevel: "silent",
  });
  const m = await import(pathToFileURL(file).href),
    app = m.createDemoServices();
  const draft = await app.cases.saveDraft(null, {
    ...m.emptyDraft(),
    name: "Rascunho Horizonte",
  });
  await app.notifications.markAllRead();
  await app.sources.checkSource("regional");
  const count = (await app.notifications.list()).length;
  const sources = await app.sources.listSources();
  const before = await app.cases.listReview();
  app.workspace.switchTo("aurora");
  assert.equal((await app.cases.listDrafts()).length, 0);
  assert.equal(await app.cases.getPublic("ana-lucia"), null);
  assert.equal(
    (await app.cases.getPublic("aurora-ana-lucia")).name,
    "Lia Exemplo",
  );
  assert(
    (await app.sources.listSources()).every((s) =>
      s.imports.every((i) => i.caseId.startsWith("aurora-")),
    ),
  );
  assert(
    (await app.tips.listTips()).every((t) => t.caseId.startsWith("aurora-")),
  );
  assert.equal((await app.notifications.list()).length, 1);
  assert.equal((await app.sources.listSources())[0].revision, 1);
  const auroraDraft = await app.cases.saveDraft(null, {
    ...m.emptyDraft(),
    name: "Rascunho Aurora",
  });
  app.simulation.configure({ role: "viewer" });
  await assert.rejects(app.notifications.list(), (e) => e.code === "forbidden");
  await assert.rejects(app.cases.listReview(), (e) => e.code === "forbidden");
  app.workspace.switchTo("horizonte");
  assert.equal(app.simulation.getState().role, "reviewer");
  assert.equal((await app.notifications.list()).length, count);
  assert.equal(
    (await app.sources.listSources())[0].revision,
    sources[0].revision,
  );
  assert.equal((await app.cases.listDrafts())[0].id, draft.id);
  assert.deepEqual(await app.cases.listReview(), before);
  const id = "beatriz-santos";
  let c = (await app.cases.listReview()).find((c) => c.id === id);
  assert.equal(m.guideProgress(c, []).filter((s) => s.done).length, 1);
  const suggestion = c.suggestions[0];
  await app.cases.resolveSuggestion(
    id,
    suggestion.id,
    suggestion.value,
    suggestion.quote,
    "Conferido na fonte",
    c.revision,
  );
  c = (await app.cases.listReview()).find((c) => c.id === id);
  const ctx = { idempotencyKey: "publish-once" };
  await app.cases.decide(
    id,
    "published",
    "Revisão fictícia concluída",
    c.revision,
    ctx,
  );
  const notificationCount = (await app.notifications.list()).length;
  await app.cases.decide(
    id,
    "published",
    "Revisão fictícia concluída",
    c.revision,
    ctx,
  );
  assert.equal((await app.notifications.list()).length, notificationCount);
  await app.tips.receiveExample(id);
  c = (await app.cases.listReview()).find((c) => c.id === id);
  await app.cases.decide(id, "withdrawn", "Retirar demonstração", c.revision);
  c = (await app.cases.listReview()).find((c) => c.id === id);
  assert(m.guideProgress(c, await app.tips.listTips()).every((s) => s.done));
  assert((await app.notifications.list())[0].title.includes("Retirada"));
  app.workspace.reset();
  assert.equal((await app.cases.listDrafts())[0].id, draft.id);
  assert.equal((await app.notifications.list()).length, 1);
  assert.equal(
    (await app.cases.listReview()).find((c) => c.id === id).status,
    "in_review",
  );
  app.simulation.configure({ latencyMs: 60 });
  const pending = app.cases.saveDraft(
    draft.id,
    { ...draft.input, name: "Escrita antiga" },
    draft.revision,
  );
  const rejected = assert.rejects(pending, (e) => e.code === "conflict");
  app.workspace.reset(true);
  await rejected;
  assert.equal((await app.cases.listDrafts()).length, 0);
  app.workspace.switchTo("aurora");
  assert.equal(app.simulation.getState().role, "viewer");
  app.simulation.configure({ role: "reviewer" });
  assert.equal((await app.cases.listDrafts())[0].id, auroraDraft.id);
  app.simulation.configure({ latencyMs: 60 });
  const late = app.cases.listReview(),
    lateRejected = assert.rejects(late, (e) => e.code === "conflict");
  app.workspace.switchTo("horizonte");
  await lateRejected;
  assert.equal(m.leaseValid(100, 100), false);
  assert.equal(m.leaseValid(101, 100), true);
  assert.deepEqual(
    m.displaySettings({ city: "X", interval: "0", organization: "invalid" }),
    { city: "", interval: 12, organization: "horizonte" },
  );
  assert.deepEqual(
    m.evidenceParts("<script>X</script> Nome: Exemplo", "Nome: Exemplo"),
    [
      { text: "<script>X</script> ", highlight: false },
      { text: "Nome: Exemplo", highlight: true },
      { text: "", highlight: false },
    ],
  );
  assert.equal(
    m.evidenceParts("Documento", "inventado").some((p) => p.highlight),
    false,
  );
  console.log(
    "PASS: organization isolation (cases, sources, tips, drafts, permissions, notifications), idempotent events, guided cycle, reset preservation, late-response and stale-write protection, display leases and exact escaped evidence.",
  );
} finally {
  await rm(dir, { recursive: true, force: true });
}
