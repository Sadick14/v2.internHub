
'use client'
import { useRole } from '@/hooks/use-role'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'


export default function DashboardPage() {
  const { role, loading, user } = useRole()
  const router = useRouter()

  useEffect(() => {
    console.log('[DashboardPage] useEffect triggered. Loading:', loading, 'Role:', role, 'User:', user);
    // Only redirect when loading is complete and we have a role.
    if (!loading && role) {
      console.log(`[DashboardPage] Redirecting to /${role}/dashboard`);
      router.replace(`/${role}/dashboard`)
    }
     if (!loading && !user) {
      console.log('[DashboardPage] No user found after loading, redirecting to /login');
      router.replace('/login');
    }
  }, [role, loading, router, user])

  // While loading, the layout will show a spinner. 
  // This component doesn't need to show anything until the redirect happens.
  return null;
}
