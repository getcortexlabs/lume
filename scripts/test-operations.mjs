import { build } from "esbuild";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
const dir = await mkdtemp(join(tmpdir(), "lume-operations-"));
try {
  const output = join(dir, "operations.mjs");
  await build({
    stdin: {
      contents: `export {createDemoServices} from './src/app/create-services'; export {createMockCaseRepository} from './src/modules/cases/data/mock-case-repository'; export {createMockNetworkRepository} from './src/modules/network/data/mock-network-repository'; export {createMockSourcesRepository} from './src/modules/sources/data/mock-sources-repository'; export {createMockTipsRepository} from './src/modules/tips/data/mock-tips-repository'; export {createMockHttpTransport} from './src/app/http/mock-http-transport'; export {withSimulation} from './src/modules/simulation/data/simulated-case-repository'; export {withdrawalChannels} from './src/modules/network/domain/withdrawal'; export {mergeDraftConflict,conflictRows} from './src/modules/intake/domain/draft-conflict'; export {emptyDraft} from './src/modules/intake/domain/draft';`,
      resolveDir: process.cwd(),
    },
    outfile: output,
    platform: "node",
    format: "esm",
    bundle: true,
    logLevel: "silent",
  });
  const m = await import(pathToFileURL(output).href),
    app = m.createDemoServices();
  const input = {
    ...m.emptyDraft(),
    name: "Pessoa fictícia",
    age: "45",
    city: "São Paulo",
    neighborhood: "Centro",
    missingSince: "2026-10-20",
    description: "Exemplo fictício",
    clothing: "Não informado",
    source: "Fonte fictícia",
    evidence: "Documento reservado",
    authorized: true,
  };
  const draft = await app.cases.saveDraft(null, input);
  const copy = await app.cases.duplicateDraft(draft.id, draft.revision, {
    idempotencyKey: "duplicate",
  });
  assert.notEqual(copy.id, draft.id);
  assert.equal(copy.input.authorized, false);
  assert.deepEqual(
    await app.cases.duplicateDraft(draft.id, draft.revision, {
      idempotencyKey: "duplicate",
    }),
    copy,
  );
  await assert.rejects(
    app.cases.deleteDraft(draft.id, 99),
    (e) => e.code === "conflict",
  );
  await app.cases.deleteDraft(draft.id, draft.revision, {
    idempotencyKey: "delete",
  });
  await app.cases.deleteDraft(draft.id, draft.revision, {
    idempotencyKey: "delete",
  });
  assert.equal(await app.cases.getDraft(draft.id), null);
  const conflict = {
    base: input,
    local: { ...input, name: "Edição local" },
    remote: {
      ...copy,
      input: {
        ...input,
        name: "Edição remota",
        clothing: "Atualizado na outra aba",
      },
    },
  };
  assert.ok(m.conflictRows(conflict).find((r) => r.key === "name").needsChoice);
  assert.throws(() => m.mergeDraftConflict(conflict, {}), /Escolha/);
  assert.equal(
    m.mergeDraftConflict(conflict, { name: "local" }).name,
    "Edição local",
  );
  assert.equal(
    m.mergeDraftConflict(conflict, { name: "local" }).clothing,
    "Atualizado na outra aba",
  );
  assert.throws(
    () => m.mergeDraftConflict({ ...conflict, remote: null }, {}),
    /removido/,
  );
  let sources = await app.sources.listSources(),
    regional = sources.find((s) => s.id === "regional");
  await app.sources.checkSource("regional");
  assert.equal(
    (await app.sources.listSources()).find((s) => s.id === "regional")
      .updatedAt,
    regional.updatedAt,
  );
  await assert.rejects(
    app.sources.checkSource("partner"),
    (e) => e.code === "unavailable",
  );
  await app.sources.simulateSourceUpdate("partner");
  assert.equal(
    (await app.sources.listSources()).find((s) => s.id === "partner").state,
    "available",
  );
  const source = await app.sources.saveSource(null, {
    name: "Fonte exemplo",
    url: "https://example.com/new",
    owner: "Equipe fictícia",
    frequencyHours: 12,
    enabled: true,
  });
  await assert.rejects(
    app.sources.saveSource(
      source.id,
      { ...source, frequencyHours: 0 },
      source.revision,
    ),
    (e) => e.code === "validation",
  );
  await assert.rejects(
    app.sources.saveSource(source.id, source, 99),
    (e) => e.code === "conflict",
  );
  let partners = await app.network.listPartners();
  await app.network.setConnection("library", "offline");
  await app.cases.decide(
    "ana-lucia",
    "withdrawn",
    "Retirada de demonstração",
    1,
  );
  let record = (await app.cases.listReview()).find((c) => c.id === "ana-lucia");
  partners = await app.network.listPartners();
  assert.equal(m.withdrawalChannels(record, partners)[0].state, "pending");
  await app.network.expire("library");
  assert.equal(
    m.withdrawalChannels(record, await app.network.listPartners())[0].state,
    "expired",
  );
  await app.network.setConnection("library", "connected");
  assert.equal(
    m.withdrawalChannels(record, await app.network.listPartners())[0].state,
    "confirmed",
  );
  assert.equal(
    (await app.cases.getPublicDetail("ana-lucia")).state,
    "withdrawn",
  );
  const tip = await app.tips.receiveExample("marcos-oliveira", {
    idempotencyKey: "receive",
  });
  assert.deepEqual(
    await app.tips.receiveExample("marcos-oliveira", {
      idempotencyKey: "receive",
    }),
    tip,
  );
  await assert.rejects(
    app.tips.advance(tip.id, "confirmed", "Pular etapa", null, 1),
    (e) => e.code === "validation",
  );
  await app.tips.advance(tip.id, "reviewed", "Dúvidas preservadas", null, 1);
  await assert.rejects(
    app.tips.advance(
      tip.id,
      "forwarded",
      "Destino inexistente",
      "real-person",
      2,
    ),
    (e) => e.code === "validation",
  );
  await app.tips.advance(
    tip.id,
    "forwarded",
    "Encaminhamento fictício",
    "search-team",
    2,
  );
  assert.equal(
    (await app.tips.listTips()).find((t) => t.id === tip.id).status,
    "forwarded",
  );
  await app.tips.advance(
    tip.id,
    "confirmed",
    "Confirmação simulada",
    "search-team",
    3,
    { idempotencyKey: "ack" },
  );
  await app.tips.advance(
    tip.id,
    "confirmed",
    "Confirmação simulada",
    "search-team",
    3,
    { idempotencyKey: "ack" },
  );
  const confirmed = (await app.tips.listTips()).find((t) => t.id === tip.id);
  assert.equal(confirmed.original, tip.original);
  assert.equal(confirmed.history.length, 4);
  assert.ok(
    !JSON.stringify(await app.cases.listPublic()).includes(
      "testemunha@example.com",
    ),
  );
  app.simulation.configure({ role: "viewer" });
  for (const operation of [
    () => app.sources.listSources(),
    () => app.tips.listTips(),
    () => app.cases.listDrafts(),
    () => app.network.listPartners(),
  ])
    await assert.rejects(operation(), (e) => e.code === "forbidden");
  assert.ok((await app.cases.searchPublic({ pageSize: 2 })).items.length === 2);
  app.simulation.configure({ role: "reviewer", unavailable: true });
  await assert.rejects(
    app.sources.listSources(),
    (e) => e.code === "unavailable",
  );
  app.simulation.configure({ unavailable: false });
  // Raw Request/Response coverage, including malformed bodies and replay permissions.
  const cases = m.createMockCaseRepository(),
    { simulation } = m.withSimulation(cases);
  const { transport } = m.createMockHttpTransport({
    cases,
    simulation,
    network: m.createMockNetworkRepository(cases),
    sources: m.createMockSourcesRepository(() => {}),
    tips: m.createMockTipsRepository(cases, () => {}),
  });
  const call = (path, method = "GET", body, key = "command") =>
    transport(
      new Request(`https://lume.invalid${path}`, {
        method,
        headers: { "Idempotency-Key": key, "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    );
  let response = await call("/v1/public/cases?search=Marcos&pageSize=2");
  assert.equal(response.status, 200);
  assert.equal((await response.json()).total, 1);
  assert.equal((await call("/v1/public/cases?page=0")).status, 422);
  assert.equal(
    (await call("/v1/review/drafts", "POST", { input: null })).status,
    422,
  );
  response = await call("/v1/review/drafts", "POST", input, "valid-create");
  assert.equal(response.status, 200);
  const created = await response.json();
  assert.deepEqual(
    await (
      await call("/v1/review/drafts", "POST", input, "valid-create")
    ).json(),
    created,
  );
  assert.equal(
    (
      await call(
        "/v1/review/drafts",
        "POST",
        { ...input, name: "Another" },
        "valid-create",
      )
    ).status,
    409,
  );
  simulation.configure({ role: "viewer" });
  assert.equal(
    (await call("/v1/review/drafts", "POST", input, "valid-create")).status,
    403,
  );
  simulation.configure({ role: "reviewer", latencyMs: 20 });
  const started = Date.now();
  await call("/v1/public/cases");
  assert.ok(Date.now() - started >= 18);
  await cases.decide("ana-lucia", "withdrawn", "Retirada", 1);
  response = await call("/v1/public/cases/ana-lucia");
  assert.equal(response.status, 410);
  assert.deepEqual(await response.json(), { state: "withdrawn" });
  response = await call("/v1/public/cases/no-such-case");
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { state: "unavailable" });
  assert.equal(
    (await transport(new Request("https://example.com/v1/public/cases")))
      .status,
    422,
  );
  // No bodies/search terms in diagnostics, and no shared state in a new app.
  assert.ok(!JSON.stringify(app.http.list()).includes("Documento reservado"));
  assert.equal((await m.createDemoServices().cases.listDrafts()).length, 0);
  const spec = JSON.parse(
    await readFile("contracts/lume-api.openapi.json", "utf8"),
  );
  function check(schema, value, path = "response") {
    if (schema.$ref) {
      let resolved = spec;
      for (const part of schema.$ref.slice(2).split("/"))
        resolved = resolved[part];
      return check(resolved, value, path);
    }
    if (schema.oneOf) {
      assert.equal(
        schema.oneOf.filter((candidate) => {
          try {
            check(candidate, value, path);
            return true;
          } catch {
            return false;
          }
        }).length,
        1,
        path,
      );
      return;
    }
    if (schema.enum) assert.ok(schema.enum.includes(value), path);
    const kinds = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (schema.type === "null") assert.equal(value, null, path);
    if (value === null) {
      assert.ok(kinds.includes("null"), path);
      return;
    }
    if (kinds.includes("object")) {
      assert.ok(
        value && typeof value === "object" && !Array.isArray(value),
        path,
      );
      for (const key of schema.required ?? [])
        assert.ok(Object.hasOwn(value, key), `${path}.${key}`);
      for (const [key, item] of Object.entries(value)) {
        if (schema.additionalProperties === false)
          assert.ok(Object.hasOwn(schema.properties, key), `${path}.${key}`);
        if (schema.properties?.[key])
          check(schema.properties[key], item, `${path}.${key}`);
      }
    } else if (kinds.includes("array")) {
      assert.ok(Array.isArray(value), path);
      value.forEach((item, i) => check(schema.items, item, `${path}[${i}]`));
    } else if (kinds.includes("integer"))
      assert.ok(Number.isInteger(value), path);
    else if (kinds.includes("string"))
      assert.equal(typeof value, "string", path);
    else if (kinds.includes("boolean"))
      assert.equal(typeof value, "boolean", path);
    if (schema.minimum !== undefined) assert.ok(value >= schema.minimum, path);
    if (schema.maximum !== undefined) assert.ok(value <= schema.maximum, path);
    if (schema.format === "date-time")
      assert.ok(Number.isFinite(Date.parse(value)), path);
  }
  for (const [schemaName, payloads] of [
    ["PublicCasePage", [await app.cases.searchPublic({ pageSize: 2 })]],
    ["PublicCase", await app.cases.listPublic()],
    ["ReviewCase", await app.cases.listReview()],
    ["Draft", await app.cases.listDrafts()],
    ["ManagedSource", await app.sources.listSources()],
    ["Tip", await app.tips.listTips()],
    ["Partner", await app.network.listPartners()],
  ])
    for (const payload of payloads)
      check(spec.components.schemas[schemaName], payload, schemaName);
  console.log(
    "PASS: HTTP DTOs match the declared OpenAPI response shapes, including private-only versions and tip records.",
  );
  console.log(
    "PASS: source ownership/validation/health, draft duplication/deletion/merge, withdrawal acknowledgements vs expiration, private tip lifecycle, HTTP pagination/status/idempotency/permissions/isolation.",
  );
} finally {
  await rm(dir, { recursive: true, force: true });
}
