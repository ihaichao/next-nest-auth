/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@next-nest-auth/shared'],
};

module.exports = nextConfig;
