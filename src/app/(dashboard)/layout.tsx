
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
    // We need to wait for the component to be mounted and for the auth state to be determined.
    if (!isMounted || loading) {
      return;
    }

    const publicPaths = ['/login', '/register', '/verify', '/forgot-password'];
    const isPublicPath = publicPaths.some(p => pathname.startsWith(p)) || pathname === '/';

    // If we're done loading and there's no user, and they are on a protected page, redirect to login.
    if (!user && !isPublicPath) {
      router.push('/login');
    }
  }, [user, loading, router, pathname, isMounted]);

  // While loading or before mounting, show a global loading spinner.
  if (loading || !isMounted) {
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
  
  // If we are done loading and there is a user, or if the path is public, we can render the children.
  // This prevents showing protected content to logged-out users.
  const publicPaths = ['/login', '/register', '/verify', '/forgot-password'];
  const isPublicPath = publicPaths.some(p => pathname.startsWith(p)) || pathname === '/';

  if (user || isPublicPath) {
    return <>{children}</>;
  }

  // If there's no user and it's not a public path, we've already started the redirect,
  // so we can return null to avoid flashing any content.
  return null;
}
