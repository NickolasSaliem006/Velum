import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@velum/shared-types', '@velum/crypto-lib'],
  eslint: { ignoreDuringBuilds: true },
}

export default config
