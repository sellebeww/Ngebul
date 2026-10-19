import type { NextConfig } from 'next';
const dev = process.env.NODE_ENV !== 'production';
// Next.js App Router injects inline scripts, so script-src needs 'unsafe-inline' without nonces; connect-src 'self' enforces "no data leaves the device".
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');
const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
];
const config: NextConfig = {
  webpack: (config) => { config.cache = false; return config; },
  poweredByHeader: false,
  headers: async () => [{ source: '/:path*', headers: securityHeaders }],
};
export default config;
