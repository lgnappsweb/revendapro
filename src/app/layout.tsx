
import type {Metadata} from 'next';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';
import {SidebarProvider} from '@/components/ui/sidebar';
import {FirebaseClientProvider} from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'RevendaPro | Gestão Avon & Natura',
  description: 'Aplicativo profissional para revendedoras Avon e Natura.',
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
