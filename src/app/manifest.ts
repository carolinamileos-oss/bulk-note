import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bulk Note — Gestão Alimentar',
    short_name: 'Bulk Note',
    description: 'Sistema pessoal de planeamento alimentar para ganho de peso',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#faf9f5',
    theme_color: '#407255',
    lang: 'pt',
    categories: ['food', 'health', 'lifestyle'],
    icons: [
      {
        src: '/api/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/api/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
