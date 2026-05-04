import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-foundry'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const PRIVATE_KEY = process.env['HARDHAT_PRIVATE_KEY'] ?? '0x' + '0'.repeat(64)

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    hardhat: { chainId: 31337 },
    localhost: { url: 'http://127.0.0.1:8545', chainId: 31337 },
    amoy: {
      url: process.env['POLYGON_AMOY_RPC_URL'] ?? 'https://rpc-amoy.polygon.technology',
      chainId: 80002,
      accounts: [PRIVATE_KEY],
    },
  },
  paths: { sources: './src', tests: './test-hardhat', cache: './cache', artifacts: './artifacts' },
}

export default config
