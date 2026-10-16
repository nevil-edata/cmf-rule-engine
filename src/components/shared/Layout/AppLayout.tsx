import { useAtomValue } from 'jotai';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { fullCanvasModeAtom } from '@/store/atoms/header';
import { EdataLogo } from '@/components/brand/BrandLogo';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isFullCanvas = useAtomValue(fullCanvasModeAtom);

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        {isFullCanvas ? (
          // Full canvas mode - no padding, fills available space
          <main className="flex-1 overflow-hidden">{children}</main>
        ) : (
          // Normal mode - with padding and max width
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full max-w-7xl flex-col p-8">
              <div className="flex-1">{children}</div>
              <footer className="mt-12 flex items-center justify-between border-t border-border pt-5 text-xs text-muted-foreground">
                <span>ClaimCPU &middot; Precision in Decision</span>
                <span className="flex items-center gap-3">
                  Powered by
                  <EdataLogo className="h-10" />
                </span>
              </footer>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
