import type {Metadata} from 'next';
import './globals.css';
import { Geist, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Providers } from '@/components/providers';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const spaceGrotesk = Space_Grotesk({subsets:['latin'],variable:'--font-heading'});

export const metadata: Metadata = {
  title: {
    default: 'HostelHub - Student Accommodation Made Easy',
    template: '%s | HostelHub',
  },
  description: 'Find and book the best student accommodation near Catholic University of Ghana. Discover verified hostels, compare rooms, and secure your stay effortlessly.',
  keywords: ['student accommodation', 'hostel', 'CUG', 'Catholic University of Ghana', 'student housing', 'book hostel'],
  authors: [{ name: 'HostelHub Team' }],
  creator: 'HostelHub',
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: 'https://hostelhub-cug.com',
    title: 'HostelHub - Official Student Accommodation Portal',
    description: 'Find top-rated student hostels near Catholic University of Ghana. Verified listings, secure booking, and transparent pricing.',
    siteName: 'HostelHub',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HostelHub platform preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HostelHub - Student Accommodation',
    description: 'Find your perfect student home with HostelHub.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, spaceGrotesk.variable)}>
      <body className="min-h-screen flex flex-col antialiased bg-white text-slate-900" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
