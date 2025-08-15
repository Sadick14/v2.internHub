

'use client'
import { GraduationCap } from 'lucide-react'
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
        <GraduationCap className="h-10 w-10 text-primary animate-spin"/>
        <p className="text-muted-foreground">Preparing your dashboard...</p>
        <svg width="200" height="40" viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg" className="text-primary/20">
            <circle cx="25" cy="20" r="4" >
                <animate attributeName="r" from="4" to="8" dur="0.8s" begin="0s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="1" to="0.5" dur="0.8s" begin="0s" repeatCount="indefinite" />
            </circle>
            <circle cx="75" cy="20" r="4">
                 <animate attributeName="r" from="4" to="8" dur="0.8s" begin="0.2s" repeatCount="indefinite" />
                 <animate attributeName="opacity" from="1" to="0.5" dur="0.8s" begin="0.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="125" cy="20" r="4">
                <animate attributeName="r" from="4" to="8" dur="0.8s" begin="0.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="1" to="0.5" dur="0.8s" begin="0.4s" repeatCount="indefinite" />
            </circle>
             <circle cx="175" cy="20" r="4">
                <animate attributeName="r" from="4" to="8" dur="0.8s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="1" to="0.5" dur="0.8s" begin="0.6s" repeatCount="indefinite" />
            </circle>
        </svg>
        </div>
    </div>
  );
}
