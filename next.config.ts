import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.canva.com" },
    ],
  },
}

module.exports = nextConfig

