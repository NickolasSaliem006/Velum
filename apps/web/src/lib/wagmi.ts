'use client'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { hardhat, polygonAmoy } from 'viem/chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'Velum Medical Records',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'demo',
  chains: [hardhat, polygonAmoy],
  ssr: true,
})
