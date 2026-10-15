import './globals.css';
import type { Metadata, Viewport } from 'next';
import BottomNav from '../components/BottomNav';
import DoveChatBubble from '../components/DoveChatBubble';
import Footer from '../components/Footer';
import Toast from '../components/Toast';

const cormorant = { variable: 'font-serif' };
const inter = { variable: 'font-sans' };

export const viewport: Viewport = {
  themeColor: '#C85A32',
  width: 'device-width',
  initialScale: 1,
};

const SITE_URL = 'https://www.fadrodzak.my.id';
const SITE_NAME = 'Fadrodzak';
const DEFAULT_TITLE = 'Fadrodzak â€” Ruang Sastra & Komunitas Aksara';
const DEFAULT_DESCRIPTION =
  'Fadrodzak adalah ruang sastra dan komunitas aksara untuk menulis, membaca, belajar, menemukan buku, dan bertumbuh bersama pecinta literasi.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: '%s | Fadrodzak',
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: 'Komunitas Aksara Fadrodzak', url: SITE_URL }],
  generator: 'Next.js',
  keywords: [
    'Fadrodzak',
    'komunitas sastra Indonesia',
    'komunitas penulis Indonesia',
    'tempat menulis puisi online',
    'tempat publikasi cerpen',
    'belajar menulis puisi',
    'belajar menulis cerpen',
    'karya sastra Indonesia',
    'komunitas pembaca Indonesia',
    'rekomendasi buku sastra',
    'platform literasi Indonesia',
    'sastra Nusantara',
    'bedah karya sastra',
  ],
  creator: 'Fadrodzak',
  publisher: 'Fadrodzak',
  alternates: {
    canonical: SITE_URL,
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE_NAME,
  },
  icons: {
    icon: [
      { url: '/fadrodzak-logo.svg', type: 'image/svg+xml' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/fadrodzak-logo.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/pwa-512x512.png',
        width: 512,
        height: 512,
        alt: 'Logo Fadrodzak â€” Ruang Sastra & Komunitas Aksara',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ['/pwa-512x512.png'],
    creator: '@fadrodzak_el_fa',
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
  verification: {
    google: 'OiNGLZr5-O0FZj437aNovYuw2_j76dL-IQk4nnJqcm4',
  },
};

const jsonLdGlobal = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/pwa-512x512.png`,
        caption: 'Logo Fadrodzak',
      },
      description: DEFAULT_DESCRIPTION,
      sameAs: ['https://www.instagram.com/fadrodzak_el_fa'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: 'Fadrodzak Literasi',
      description: DEFAULT_DESCRIPTION,
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      inLanguage: 'id-ID',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <meta
          name="google-site-verification"
          content="OiNGLZr5-O0FZj437aNovYuw2_j76dL-IQk4nnJqcm4"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGlobal) }}
        />
      </head>
      <body className="antialiased bg-[#F5EFEB] text-[#2C2A29] font-sans selection:bg-[#C85A32]/20 selection:text-[#2C2A29]">
        {children}
        {/* Footer Minimalis */}
        <Footer />
        {/* Tombol Merpati Gelembung untuk Pesan (Floating Dove Chat) */}
        <DoveChatBubble />
        {/* Navigasi Bawah */}
        <BottomNav />
        {/* Notifikasi Toast Elegan */}
        <Toast />
      </body>
    </html>
  );
}
