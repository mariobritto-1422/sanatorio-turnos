import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { PWARegister } from '@/components/PWARegister';

export const metadata: Metadata = {
  title: 'Sanatorio Turnos - Sistema de Gestión',
  description:
    'Sistema de gestión de turnos para sanatorio psiquiátrico con accesibilidad WCAG AAA',
  applicationName: 'Sanatorio Turnos',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sanatorio Turnos',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  keywords: ['turnos', 'sanatorio', 'salud', 'psiquiatría', 'gestión'],
  authors: [{ name: 'Sanatorio Turnos' }],
  creator: 'Sanatorio Turnos',
  publisher: 'Sanatorio Turnos',
  robots: 'index, follow',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#0EA5E9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sanatorio Turnos" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
      </head>
      <body className="no-scroll-x">
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
