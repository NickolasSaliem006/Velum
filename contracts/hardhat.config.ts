import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-foundry'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

const PRIVATE_KEY = process.env['HARDHAT_PRIVATE_KEY'] ?? '0x' + '0'.repeat(64)
const POLYGONSCAN_API_KEY = process.env['POLYGONSCAN_API_KEY'] ?? ''

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
  etherscan: {
    apiKey: {
      polygonAmoy: POLYGONSCAN_API_KEY,
    },
    customChains: [
      {
        network: 'polygonAmoy',
        chainId: 80002,
        urls: {
          apiURL: 'https://api-amoy.polygonscan.com/api',
          browserURL: 'https://amoy.polygonscan.com',
        },
      },
    ],
  },
  paths: { sources: './src', tests: './test-hardhat', cache: './cache', artifacts: './artifacts' },
}

export default config
