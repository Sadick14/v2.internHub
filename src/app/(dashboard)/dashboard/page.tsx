

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

  // Return null or a minimal loader while redirecting
  // The main layout already shows a full-page loader
  return null;
}
