import type { NextConfig } from "next";

// GhostMind is a fully static, client-side app — exported as plain HTML/JS for
// any static host (here: GitHub Pages). On CI the basePath is derived from the
// repository name so a project site served at /<repo>/ resolves its assets,
// while local builds (`npm run build`) keep an empty basePath.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isCI = process.env.GITHUB_ACTIONS === "true";
// A user/org site (<user>.github.io) is served at the root, so no basePath.
const basePath = isCI && repo && !repo.endsWith(".github.io") ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
