import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias = { ...config.resolve.alias, xterm: "@xterm/xterm" };
    return config;
  },
  serverExternalPackages: ["@lancedb/lancedb"],
  images:{
    remotePatterns:[
      {
        protocol:"https",
        hostname:"*",
        port:'',
        pathname:"/**"
      }
    ]
  },
  async headers() {
    return [
      {
        // Required for WebContainers (in-browser Node): without these, preview can be blank in some browsers
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
  reactStrictMode:false
};

export default nextConfig;
