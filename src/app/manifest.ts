import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RevendaPro | Gestão Avon & Natura',
    short_name: 'RevendaPro',
    description: 'Gestão profissional para consultoras e revendedoras.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F6F0F2',
    theme_color: '#C2185B',
    icons: [
      {
        src: 'https://picsum.photos/seed/revendapro/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/revendapro/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
