import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@velum/shared-types', '@velum/crypto-lib'],
  experimental: { typedRoutes: true },
}

export default config
