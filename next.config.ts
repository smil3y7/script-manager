import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Zagotovi, da Vercel v serverless bundle za run API vključi tudi
  // dejanske skripte in register - sicer jih runtime na produkciji ne najde.
  // scripts/**/* pokrije python/, js/ in docs/ podmape.
  outputFileTracingIncludes: {
    "/api/run/[slug]": ["./scripts/**/*", "./registry/**/*"],
    "/api/scripts": ["./registry/**/*"],
  },
};

export default nextConfig;
