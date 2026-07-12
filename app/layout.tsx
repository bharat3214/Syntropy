import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s – Syntropy',
    default: 'Syntropy — Enterprise ESG Operating System',
  },
  description:
    'Measure, manage, and improve ESG performance through real-time insights, automated workflows, and employee engagement.',
  themeColor: '#0B0F0D',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // Syntropy is dark-mode only — suppress system preference hydration mismatch
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: 'dark' }}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ background: '#0B0F0D', color: '#F3F4F1' }}
      >
        {children}
      </body>
    </html>
  );
}
