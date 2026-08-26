import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Old Romanian route slugs kept working after the rename to English routes.
    return [
      { source: "/despre", destination: "/about", permanent: true },
      { source: "/date-legale", destination: "/legal-data", permanent: true },
      { source: "/formular-retragere", destination: "/withdrawal-form", permanent: true },
    ];
  },
};

export default nextConfig;
