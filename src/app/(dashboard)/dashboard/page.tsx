

'use client'
import { useRole } from '@/hooks/use-role'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'


export default function DashboardPage() {
  const { role, loading, user } = useRole()
  const router = useRouter()

  useEffect(() => {
    // This page is now a fallback. The main login logic redirects directly.
    // This will handle cases where the user lands here directly or if the direct redirect fails.
    if (!loading && role) {
      router.replace(`/${role}/dashboard`)
    }
     if (!loading && !user) {
      router.replace('/login');
    }
  }, [role, loading, router, user])

  // The layout already shows a spinner, so we can show a simple message here.
  return (
     <div className="flex items-center justify-center h-full p-4 md:p-6">
        <div className="flex flex-col items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary animate-spin">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
        <p className="text-muted-foreground">Preparing your dashboard...</p>
        </div>
    </div>
  );
}
