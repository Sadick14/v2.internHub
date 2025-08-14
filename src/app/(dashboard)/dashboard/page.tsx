

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

  // Prevents flash of content before redirect
  if (loading || !role) {
     return (
        <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary animate-spin">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
        </div>
    )
  }

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
