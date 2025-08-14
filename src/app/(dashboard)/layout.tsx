
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
    // If auth state is loaded and there is no user, redirect to login from any protected path.
    if (!loading && !user) {
      const publicPaths = ['/login', '/register', 'verify', '/forgot-password', '/'];
      // Allow access to root and auth-related pages. Redirect from all others.
      if (!publicPaths.includes(pathname) && pathname !== '/') {
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
  
  // At this point, loading is false. We can now decide what to render.
  if (user) {
    // If the user is logged in, show the requested page content (the dashboard or a specific role page).
    return <>{children}</>;
  }

  // If there's no user and they are on a public path, show that page's content.
  const publicPaths = ['/login', '/register', 'verify', '/forgot-password', '/'];
  if (!user && publicPaths.some(p => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  // Fallback for any other state (should not be reached often)
  // This can happen briefly during the transition between states.
  return null;
}
