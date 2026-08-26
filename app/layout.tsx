import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { CartProvider } from '@/components/cart/CartProvider'
import { restaurant, images } from '@/lib/restaurant'
import './globals.css'

const _inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const _playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const SITE_URL = 'https://manna-restaurant.vercel.app'

const description =
  'Manna Restaurant and Tandoori serves authentic Indian and Nepali food in Devchuli-13, Daldale, Nawalpur. Momo, jhol momo, tandoori, fried rice, chow mein and thukpa on Rampur Highway. Dine-in and home delivery.'

export const metadata: Metadata = {
  title: {
    default: 'Manna Restaurant and Tandoori | Momo & Tandoori in Devchuli',
    template: '%s | Manna Restaurant and Tandoori',
  },
  description,
  keywords: [
    'Manna Restaurant and Tandoori',
    'restaurant in Devchuli',
    'restaurant in Nawalpur',
    'momo and tandoori in Devchuli',
    'Rampur Highway restaurant',
    'jhol momo Devchuli',
    'Nepali restaurant Daldale',
    'home delivery Devchuli',
  ],
  authors: [{ name: 'Manna Restaurant and Tandoori' }],
  creator: 'Manna Restaurant and Tandoori',
  publisher: 'Manna Restaurant and Tandoori',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  category: 'Restaurant',
  openGraph: {
    title: 'Manna Restaurant and Tandoori | Momo & Tandoori in Devchuli',
    description,
    url: SITE_URL,
    siteName: 'Manna Restaurant and Tandoori',
    images: [
      {
        url: images.storefront,
        width: 1200,
        height: 630,
        alt: 'Manna Restaurant and Tandoori shopfront in Devchuli, Nawalpur',
      },
    ],
    locale: 'en_NP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manna Restaurant and Tandoori',
    description: 'Authentic Indian & Nepali taste in Devchuli-13, Daldale, Nawalpur.',
    images: [images.storefront],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#080808',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description,
    image: [`${SITE_URL}${images.storefront}`, `${SITE_URL}${images.jholMomo}`],
    servesCuisine: ['Nepali', 'Indian', 'Tandoori'],
    priceRange: 'Rs. 30 – Rs. 470',
    telephone: restaurant.phones.reception.number,
    url: SITE_URL,
    hasMap: restaurant.maps.shareUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address.line1,
      addressLocality: restaurant.address.city,
      addressRegion: restaurant.address.district,
      postalCode: restaurant.address.postalCode,
      addressCountry: 'NP',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: restaurant.maps.lat,
      longitude: restaurant.maps.lng,
    },
    sameAs: [restaurant.instagram.url, restaurant.maps.shareUrl],
  }

  return (
    <html lang="en" className="bg-background scroll-smooth" data-scroll-behavior="smooth">
      <body className={`antialiased font-sans`}>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Cart state is shared by the menu, the order page and reorder buttons. */}
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
