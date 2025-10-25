import './globals.css';
import { Providers } from '@/components/providers';

export const metadata = {
  title: 'Flow Grid - Festival Scheduling Made Simple',
  description: 'Transform your festival into a seamless experience with Flow Grid. Create schedules, manage bookings, and delight participants.',
  icons: {
    icon: '/flow-grid-logo.png',
    apple: '/flow-grid-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/flow-grid-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/flow-grid-logo.png" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}