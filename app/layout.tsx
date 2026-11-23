import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gateway Studio: traffic into an owned model',
  description: 'Independent demo: analyze AI gateway traffic, find distillation candidates, and project savings from an owned small model. Fictional sample data; not affiliated with Experiential Labs.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className="min-h-screen font-sans antialiased">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-4">
          <Link href="/" className="text-base font-semibold text-ink">Gateway Studio <span className="font-normal text-mute">independent demo</span></Link>
          <nav className="flex gap-5 text-sm"><Link className="text-ink hover:text-accent" href="/">Studio</Link></nav>
        </header>
        {children}
        <footer className="mt-12 border-t border-line py-5 text-xs leading-relaxed text-mute">
          Demo built by Vinil Polepalli. The seeded traffic is fictional sample data; every savings figure is an estimate from the stated assumptions, not a quote. Rows you add, candidate states and assumptions are stored in this demo's database under an anonymous browser cookie and are visible only to this browser. Independent demo; not affiliated with or endorsed by Experiential Labs.
        </footer>
      </div>
    </body></html>
  );
}
