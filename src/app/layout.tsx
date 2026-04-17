import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toaster } from '@/components/ui/toaster'
import { PWARegister } from '@/components/layout/PWARegister'

export const viewport: Viewport = {
  themeColor: '#407255',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Bulk Note — Gestão Alimentar',
  description: 'Sistema pessoal de planeamento alimentar para ganho de peso',
  appleWebApp: {
    capable: true,
    title: 'Bulk Note',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <div className="flex h-screen overflow-hidden bg-background safe-top">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="page-container animate-fade-in">
              {children}
            </div>
          </main>
        </div>
        <Toaster />
        <PWARegister />
      </body>
    </html>
  )
}
