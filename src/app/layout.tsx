import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const viewport: Viewport = {
  themeColor: '#C2185B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'RevendaPro | Gestão Avon & Natura',
  description: 'Aplicativo profissional para revendedoras Avon e Natura.',
  manifest: '/manifest.json',
  icons: {
    icon: 'https://picsum.photos/seed/revendapro-brand/32/32',
    apple: 'https://picsum.photos/seed/revendapro-brand/180/180',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RevendaPro',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-body antialiased bg-background">
        <FirebaseClientProvider>
          <SidebarProvider defaultOpen={true}>
            {children}
            <Toaster />
          </SidebarProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
