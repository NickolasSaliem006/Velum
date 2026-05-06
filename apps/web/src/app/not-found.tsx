import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 text-center">
      <p className="text-8xl font-black text-bone/10 mb-4 select-none">404</p>
      <h1 className="text-2xl font-bold text-bone mb-3">Page not found</h1>
      <p className="text-bone/50 text-sm max-w-sm mb-8">
        This route doesn&apos;t exist. The on-chain audit trail has no record of it either.
      </p>
      <Link
        href="/"
        className="bg-accent hover:bg-accent/80 text-bone rounded-lg px-6 py-3 font-semibold transition-colors"
      >
        Back to Velum
      </Link>
    </main>
  )
}
