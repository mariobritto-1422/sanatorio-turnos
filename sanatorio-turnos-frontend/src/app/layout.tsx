import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { PWARegister } from '@/components/PWARegister';

const NOMBRE_INSTITUCION = process.env.NEXT_PUBLIC_NOMBRE_INSTITUCION || 'Sanaturno';

export const metadata: Metadata = {
  title: `${NOMBRE_INSTITUCION} - Sistema de Gestión`,
  description:
    `Sistema de gestión de turnos médicos para ${NOMBRE_INSTITUCION} con accesibilidad WCAG AAA`,
  applicationName: NOMBRE_INSTITUCION,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: NOMBRE_INSTITUCION,
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  keywords: ['turnos', 'salud', 'gestión', 'médico', 'clínica'],
  authors: [{ name: NOMBRE_INSTITUCION }],
  creator: NOMBRE_INSTITUCION,
  publisher: NOMBRE_INSTITUCION,
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
        <meta name="apple-mobile-web-app-title" content={NOMBRE_INSTITUCION} />
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
