import type { NextConfig } from "next";

const config: NextConfig = {
  // Only explicitly public route files are built for the early-access launch.
  pageExtensions: ["public.tsx", "public.ts"],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/waitlist",
          destination: `${process.env.API_ORIGIN || "http://127.0.0.1:4100"}/api/waitlist`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default config;
