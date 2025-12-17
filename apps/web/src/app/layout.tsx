import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TrpcProvider } from '@/lib/trpc-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next-Nest Auth',
  description: 'Full-stack authentication with Next.js, NestJS, and tRPC',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TrpcProvider>
          <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {children}
          </main>
        </TrpcProvider>
      </body>
    </html>
  );
}
