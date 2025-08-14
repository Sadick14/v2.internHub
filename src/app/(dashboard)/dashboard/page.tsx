
'use client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

  return (
      <Card>
          <CardHeader>
              <CardTitle className="font-headline">Welcome</CardTitle>
              <CardDescription>Redirecting you to your dashboard...</CardDescription>
          </CardHeader>
          <CardContent>
              <p>Please wait while we load your experience.</p>
          </CardContent>
      </Card>
  )
}
