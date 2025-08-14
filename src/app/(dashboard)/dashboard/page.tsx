
'use client'
import { useRole } from '@/hooks/use-role'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'


export default function DashboardPage() {
  const { role, loading } = useRole()
  const router = useRouter()

  useEffect(() => {
    // Only redirect when loading is complete and we have a role.
    if (!loading && role) {
      router.replace(`/${role}/dashboard`)
    }
  }, [role, loading, router])

  // While loading, the layout will show a spinner. 
  // This component doesn't need to show anything until the redirect happens.
  return null;
}
