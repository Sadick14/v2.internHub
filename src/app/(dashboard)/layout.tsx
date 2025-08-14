
'use client';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { useRole } from '@/hooks/use-role';

export default function DashboardRedirectLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useRole();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      const publicPaths = ['/login', '/register', '/verify', '/forgot-password', '/'];
      if (!publicPaths.includes(pathname)) {
        router.push('/login');
      }
    }
  }, [user, loading, router, pathname]);

  if (!isMounted || loading) {
    return (
        <main className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-center h-full p-4 md:p-6">
                <div className="flex flex-col items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary animate-spin">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <p className="text-muted-foreground">Loading your dashboard...</p>
                </div>
            </div>
        </main>
    );
  }

  // For public pages, we don't want to render the dashboard layout.
  if (!user && !loading) {
    return <>{children}</>;
  }

  return <>{children}</>
}
