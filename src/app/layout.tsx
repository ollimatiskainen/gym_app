import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AuthContextProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SettingsProvider } from '@/context/SettingsContext';
import AuthGuard from '@/components/AuthGuard';
import ErrorBoundary from '@/components/ErrorBoundary';
import BottomNav from '@/components/BottomNav';
import PageTransition from '@/components/PageTransition';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'Gym Logger',
  description: 'A minimal, mobile-first gym logging PWA',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Gym Logger' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f1a' },
  ],
};

// Force dynamic rendering — Firebase requires client-side auth
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body>
        <AuthContextProvider>
          <ThemeProvider>
            <SettingsProvider>
              <AuthGuard>
                <ErrorBoundary>
                  <main
                    className="mx-auto max-w-lg px-4 pb-24"
                    style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
                  >
                    <PageTransition>{children}</PageTransition>
                  </main>
                  <BottomNav />
                </ErrorBoundary>
              </AuthGuard>
            </SettingsProvider>
          </ThemeProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
