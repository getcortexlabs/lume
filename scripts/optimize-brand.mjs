import { execFileSync } from "node:child_process";
// Requires the cwebp executable. Keep the original artwork and social preview intact.
for (const [name, dimensions] of [
  ["lume-480", ["480", "320"]],
  ["lume-960", ["960", "640"]],
  ["lume-original", []],
]) {
  execFileSync(
    "cwebp",
    [
      "-lossless",
      "-exact",
      "-metadata",
      "icc",
      "-m",
      "6",
      ...(dimensions.length ? ["-resize", ...dimensions] : []),
      "public/brand/lume-original.png",
      "-o",
      `public/brand/${name}.webp`,
    ],
    { stdio: "inherit" },
  );
}
