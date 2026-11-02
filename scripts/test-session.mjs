import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
const dir = await mkdtemp(join(tmpdir(), "lume-session-"));
try {
  const output = join(dir, "session.mjs");
  await build({
    entryPoints: ["src/modules/session/domain/session.ts"],
    outfile: output,
    bundle: true,
    platform: "node",
    format: "esm",
    logLevel: "silent",
  });
  const { sessionReturnPath, isOrganizationPath } = await import(
    pathToFileURL(output).href
  );
  for (const invalid of [
    undefined,
    ["/organization"],
    "https://example.com",
    "//example.com/organization",
    "/\\example.com",
    "/organization/../cases",
    "/organization-other",
    "/organization\n",
    "javascript:alert(1)",
    "/sign-in?returnTo=/organization",
  ])
    assert.equal(sessionReturnPath(invalid), "/organization");
  assert.equal(
    sessionReturnPath("/organization?case=beatriz-santos&status=in_review"),
    "/organization?case=beatriz-santos&status=in_review",
  );
  assert.equal(
    sessionReturnPath("/organization/drafts/draft-123"),
    "/organization/drafts/draft-123",
  );
  assert.equal(isOrganizationPath("/organization-other"), false);
  console.log(
    "PASS: session return paths reject external, recursive, malformed, and non-organization destinations.",
  );
} finally {
  await rm(dir, { recursive: true, force: true });
}
