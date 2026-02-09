import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ["@stacks/connect", "@stacks/transactions", "@stacks/auth", "@stacks/network", "@stacks/common"],
};

export default nextConfig;
