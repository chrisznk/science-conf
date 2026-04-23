import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Science & Vie Conférence',
  description: 'Expérience interactive — Astrophysique, Physique Quantique, Conquête Spatiale',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="grain min-h-full">
        {children}
      </body>
    </html>
  )
}
