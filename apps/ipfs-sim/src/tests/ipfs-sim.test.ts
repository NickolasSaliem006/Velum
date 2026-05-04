import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../index'

describe('IPFS sim — happy path', () => {
  it('uploads content and returns a 64-char SHA-256 CID', async () => {
    const res = await request(app).post('/upload').send({ content: 'hello world' })
    expect(res.status).toBe(200)
    expect(res.body.cid).toHaveLength(64)
    expect(res.body.size).toBe(11)
  })

  it('retrieves content by CID with integrity verification', async () => {
    const up = await request(app).post('/upload').send({ content: 'velum-test-content' })
    const { cid } = up.body
    const get = await request(app).get(`/retrieve/${cid}`)
    expect(get.status).toBe(200)
    expect(get.body.content).toBe('velum-test-content')
    expect(get.body.cid).toBe(cid)
  })

  it('HEAD returns 200 for existing CID', async () => {
    const up = await request(app).post('/upload').send({ content: 'head-test' })
    const head = await request(app).head(`/retrieve/${up.body.cid}`)
    expect(head.status).toBe(200)
  })

  it('is content-addressed: same content produces the same CID', async () => {
    const a = await request(app).post('/upload').send({ content: 'deduplicated' })
    const b = await request(app).post('/upload').send({ content: 'deduplicated' })
    expect(a.body.cid).toBe(b.body.cid)
  })
})

describe('IPFS sim — negative tests', () => {
  it('returns 404 for unknown CID', async () => {
    const res = await request(app).get('/retrieve/' + '0'.repeat(64))
    expect(res.status).toBe(404)
  })

  it('HEAD returns 404 for unknown CID', async () => {
    const res = await request(app).head('/retrieve/' + 'a'.repeat(64))
    expect(res.status).toBe(404)
  })

  it('rejects empty content with 400', async () => {
    const res = await request(app).post('/upload').send({ content: '' })
    expect(res.status).toBe(400)
  })

  it('rejects missing content field with 400', async () => {
    const res = await request(app).post('/upload').send({})
    expect(res.status).toBe(400)
  })

  it('health endpoint returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
