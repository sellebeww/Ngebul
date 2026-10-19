import type { NextConfig } from 'next';
const config: NextConfig = { webpack: (config) => { config.cache = false; return config; }, poweredByHeader: false };
export default config;
