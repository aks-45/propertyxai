import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable the Next.js dev indicator badge in the corner
  devIndicators: false,
  
  // Allow LAN/mobile device IP addresses to access Next.js dev scripts
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '172.20.10.2:3000',
    '172.20.10.2',
    '*.local',
  ],
};

export default nextConfig;
