import fs from "node:fs";
import path from "node:path";
import { parse } from "@vue/compiler-sfc";
import { baseParse } from "@vue/compiler-dom";

const counts = new Map();
const nativeControls = [];
let components = 0;
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(file);
      continue;
    }
    if (!file.endsWith(".vue")) continue;
    components++;
    const { descriptor } = parse(fs.readFileSync(file, "utf8"));
    if (!descriptor.template) continue;
    function visit(node) {
      if (/^M[A-Z]/.test(node.tag ?? ""))
        counts.set(node.tag, (counts.get(node.tag) ?? 0) + 1);
      if (
        ["button", "select", "input", "dialog", "textarea"].includes(node.tag)
      )
        nativeControls.push({ tag: node.tag, file });
      for (const child of node.children ?? []) visit(child);
    }
    visit(baseParse(descriptor.template.content));
  }
}
walk("src");
console.log(
  JSON.stringify(
    {
      note: "Static template occurrences, not rendered elements, percentage of code, or visual ownership.",
      vueComponents: components,
      mavisTypes: counts.size,
      mavisOccurrences: [...counts.values()].reduce(
        (sum, count) => sum + count,
        0,
      ),
      components: Object.fromEntries(
        [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)),
      ),
      nativeControls,
    },
    null,
    2,
  ),
);
if (
  nativeControls.some(
    (control) => !control.file.startsWith("src/shared/ui/Native"),
  )
)
  process.exitCode = 1;
