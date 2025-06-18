'use client';

import { Geist, Geist_Mono } from "next/font/google";
import Providers from '../components/Providers';
import AuthCheck from '../components/AuthCheck';
import 'bootstrap/dist/css/bootstrap.min.css';

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          <AuthCheck />
          {children}
        </Providers>
      </body>
    </html>
  );
}
