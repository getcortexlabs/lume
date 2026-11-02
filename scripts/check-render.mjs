import { spawn } from "node:child_process";
import { once } from "node:events";
import { access } from "node:fs/promises";
import assert from "node:assert/strict";
await access(".output/server/index.mjs");
const child = spawn(process.execPath, [".output/server/index.mjs"], {
  env: { ...process.env, PORT: "0", HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"],
});
let log = "";
const ready = new Promise((resolve, reject) => {
  const timeout = setTimeout(
    () => reject(new Error(`Nuxt did not start: ${log}`)),
    20000,
  );
  child.stdout.on("data", (chunk) => {
    log += chunk;
    const match = log.match(/http:\/\/127\.0\.0\.1:\d+/);
    if (match) {
      clearTimeout(timeout);
      resolve(match[0]);
    }
  });
  child.stderr.on("data", (chunk) => {
    log += chunk;
  });
  child.once("exit", (code) => {
    clearTimeout(timeout);
    reject(new Error(`Nuxt exited ${code}: ${log}`));
  });
});
try {
  const base = await ready;
  for (const [path, content, status] of [
    ["/", "Toda busca", 200],
    ["/cases", "Ana Lúcia Ferreira", 200],
    ["/cases?city=Suzano", "Marcos Oliveira", 200],
    ["/cases/ana-lucia", "Ana Lúcia Ferreira", 200],
    ["/cases/ana-lucia/poster", "NÃO É UMA BUSCA REAL", 200],
    ["/cases/unknown/poster", "Este cartaz não está disponível.", 404],
    ["/guidance", "Você não precisa", 200],
    ["/network", "Seu espaço", 200],
    ["/cases/unknown", "Este aviso não está disponível.", 404],
    ["/unknown-route", "Esse caminho ainda não existe.", 404],
  ]) {
    const response = await fetch(base + path);
    const html = await response.text();
    assert.equal(response.status, status, path);
    assert.ok(html.includes(content), `${path}: missing ${content}`);
    assert.ok(
      !html.includes("REGISTRO FICTÍCIO"),
      `${path}: private evidence leaked`,
    );
    console.log(`PASS: Nuxt HTTP ${status} with rendered content ${path}`);
  }
  for (const path of [
    "/organization",
    "/organization/cases/new",
    "/organization/drafts",
    "/organization/drafts/unknown",
    "/organization/network",
    "/organization/simulation",
    "/organization/tasks",
    "/organization/sources",
    "/organization/tips",
    "/organization/withdrawals",
    "/organization/settings",
    "/organization/notifications",
    "/organization/displays",
    "/organization/guide",
    "/embed",
    "/screen?organization=aurora",
  ]) {
    const response = await fetch(base + path),
      html = await response.text();
    assert.equal(response.status, 200, path);
    assert.ok(!html.includes("REGISTRO FICTÍCIO"));
    assert.ok(!html.includes("Beatriz Santos"));
    assert.ok(!html.includes("testemunha@example.com"));
    assert.ok(response.headers.get("cache-control")?.includes("no-store"));
    console.log(
      `PASS: client-only mock operation with no reserved payload ${path}`,
    );
  }
} finally {
  child.kill("SIGTERM");
  if (child.exitCode === null) await once(child, "exit");
}
