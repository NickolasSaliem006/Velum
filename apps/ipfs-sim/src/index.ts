/**
 * SIMULATION: Content-addressed storage backend — mirrors IPFS semantics.
 *
 * Production replaces this with an IPFS cluster pinned across multiple providers.
 * All semantics are identical: PUT produces a CID (SHA-256 of content), GET
 * retrieves by CID and verifies integrity on delivery.
 */

import express from 'express'
import cors from 'cors'
import { createHash } from 'crypto'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

/** In-memory content-addressed store. key = SHA-256 hex. */
const store = new Map<string, string>()

app.post('/upload', (req, res) => {
  const { content } = req.body as { content?: string }
  if (typeof content !== 'string' || content.length === 0) {
    res.status(400).json({ error: 'content must be a non-empty string' })
    return
  }
  const cid = createHash('sha256').update(content).digest('hex')
  store.set(cid, content)
  res.json({ cid, size: content.length })
})

app.get('/retrieve/:cid', (req, res) => {
  const content = store.get(req.params.cid)
  if (!content) {
    res.status(404).json({ error: 'not found' })
    return
  }
  const check = createHash('sha256').update(content).digest('hex')
  if (check !== req.params.cid) {
    res.status(500).json({ error: 'integrity check failed — content tampered' })
    return
  }
  res.json({ cid: req.params.cid, content })
})

app.head('/retrieve/:cid', (req, res) => {
  res.status(store.has(req.params.cid) ? 200 : 404).end()
})

app.get('/health', (_req, res) => res.json({ status: 'ok', entries: store.size }))

const PORT = parseInt(process.env['IPFS_SIM_PORT'] ?? '4001', 10)

if (require.main === module) {
  app.listen(PORT, () => {
    process.stdout.write(`[ipfs-sim] http://localhost:${PORT}\n`)
  })
}

export { app }
