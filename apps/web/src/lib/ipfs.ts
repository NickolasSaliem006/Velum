/**
 * Client for the @velum/ipfs-sim Express service.
 *
 * SIMULATION: production replaces this with a real IPFS pinning service
 * (Pinata, web3.storage, or a self-hosted IPFS cluster). The interface here
 * is intentionally minimal — POST /upload returns a SHA-256 CID; GET
 * /retrieve/:cid returns the content with on-server integrity verification.
 */

const IPFS_URL = process.env.NEXT_PUBLIC_IPFS_URL ?? 'http://localhost:4001'

export interface UploadResult {
  cid: string
  size: number
}

export interface RetrieveResult {
  cid: string
  content: string
}

export class IpfsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IpfsError'
  }
}

/** Upload encrypted content (base64 string) and receive a content-addressed SHA-256 CID. */
export async function uploadToIpfs(content: string): Promise<UploadResult> {
  const res = await fetch(`${IPFS_URL}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  if (!res.ok) {
    throw new IpfsError(`Upload failed (${res.status})`)
  }
  return (await res.json()) as UploadResult
}

/** Retrieve content by CID. The sim re-hashes on retrieve and rejects tampered blobs. */
export async function retrieveFromIpfs(cid: string): Promise<string> {
  const res = await fetch(`${IPFS_URL}/retrieve/${cid}`)
  if (res.status === 404) {
    throw new IpfsError('Content not found at this CID')
  }
  if (!res.ok) {
    throw new IpfsError(`Retrieve failed (${res.status})`)
  }
  const data = (await res.json()) as RetrieveResult
  return data.content
}

/** Probe the sim health endpoint. */
export async function ipfsHealth(): Promise<{ ok: boolean; entries?: number }> {
  try {
    const res = await fetch(`${IPFS_URL}/health`)
    if (!res.ok) return { ok: false }
    const data = (await res.json()) as { status: string; entries: number }
    return { ok: data.status === 'ok', entries: data.entries }
  } catch {
    return { ok: false }
  }
}
