
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { verifyInvite } from '@/services/invitesService';

export default function VerifyPage() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const invite = await verifyInvite(email, verificationCode);
      if (invite) {
        toast({
          title: "Verification Successful",
          description: "Please proceed to set up your account.",
        });
        // Pass invite data to the registration page via query params
        const params = new URLSearchParams({
          email: invite.email,
          firstName: invite.firstName,
          lastName: invite.lastName,
          inviteId: invite.id!,
        });
        router.push(`/register?${params.toString()}`);
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid email or verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
       toast({
          title: "Error",
          description: `An unexpected error occurred: ${error.message}`,
          variant: "destructive",
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md mx-auto p-4">
        <Card>
          <CardHeader>
            <div className="text-center mb-4">
                <h1 className="text-3xl font-bold font-headline mt-2">Verify Your Account</h1>
            </div>
            <CardDescription>
              Please enter your email and the verification code sent to you by your administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student.id@university.edu"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Enter your code"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify and Proceed'}
                </Button>
              </div>
            </form>
             <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline text-primary">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
