import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/providers'

export const metadata: Metadata = {
  title: 'Velum — Trust Layer for Medical Records',
  description:
    'Zero-knowledge identity verification, on-chain audit trails, and patient-controlled access.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-obsidian text-bone antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
