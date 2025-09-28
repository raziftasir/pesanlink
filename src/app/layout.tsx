import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Nav from '@/components/nav';

export const metadata = { title: 'PesanLink' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#121212] text-[#EAEAEA]">
        <ThemeProvider>
          <Nav />
          <main className="max-w-5xl mx-auto p-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
