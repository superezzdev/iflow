import type { Metadata } from 'next';
import '../styles/globals.css';
import { APP_NAME, APP_DESCRIPTION } from '@mindpost/shared';

export const metadata: Metadata = {
  title: `${APP_NAME} | Dashboard`,
  description: APP_DESCRIPTION
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
