#!/usr/bin/env node
// Cross-platform forge test runner.
// On CI (Linux), forge is in PATH via foundry-rs/foundry-toolchain action.
// On Windows locally, forge lives in %USERPROFILE%\.foundry\bin\forge.exe.
const { spawnSync } = require('child_process')
const path = require('path')
const os = require('os')

const candidates = [
  'forge',
  path.join(os.homedir(), '.foundry', 'bin', 'forge.exe'),
  path.join(os.homedir(), '.foundry', 'bin', 'forge'),
]

for (const candidate of candidates) {
  const result = spawnSync(candidate, ['test', '-vv'], { stdio: 'inherit', shell: false })
  if (result.error) continue // binary not found — try next
  process.exit(result.status ?? 0)
}

console.error('forge not found. Install Foundry: https://getfoundry.sh')
process.exit(1)
