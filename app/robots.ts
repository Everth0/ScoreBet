import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/perfil', '/mis-apuestas', '/api/'],
      },
    ],
    sitemap: 'https://www.scorebet.space/sitemap.xml',
  }
}
