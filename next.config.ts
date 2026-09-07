import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // GitHub Pages serves the built site as plain static files.
  output: 'export',
  trailingSlash: true,
};

export default nextConfig;
