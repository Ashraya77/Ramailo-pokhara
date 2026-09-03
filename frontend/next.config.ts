import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://example.com/**"),
      new URL(
        "/storage/**",
        process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000",
      ),
    ],
  },
};

export default nextConfig;
