import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md mx-auto p-4">
        <Card>
          <CardHeader>
            <div className="text-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto text-primary">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <h1 className="text-3xl font-bold font-headline mt-2">InternshipTrack</h1>
              <p className="text-muted-foreground">Student Monitoring & Engagement Platform</p>
            </div>
            <CardTitle className="text-2xl font-headline">Login</CardTitle>
            <CardDescription>
              Enter your school ID to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="school-id">School ID</Label>
                <Input
                  id="school-id"
                  type="text"
                  placeholder="20240001"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button asChild type="submit" className="w-full">
                <Link href="/dashboard">Login</Link>
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="#" className="underline text-primary">
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
