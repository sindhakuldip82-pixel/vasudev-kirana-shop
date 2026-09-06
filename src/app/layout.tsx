import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Vasudev Kirana Shop | Dhuvaran Home Delivery',
  description:
    'Order groceries online from Vasudev Kirana Shop in Dhuvaran. Easy home delivery, WhatsApp ordering and everyday grocery products.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#38953f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <LanguageProvider>
          <CartProvider>
            <AppShell>{children}</AppShell>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
