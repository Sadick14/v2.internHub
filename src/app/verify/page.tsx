
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { verifyInvite, sendVerificationEmail } from '@/services/invitesService';
import { Mail, KeyRound } from 'lucide-react';

export default function VerifyPage() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSendCode = async (e?: React.FormEvent) => {
      e?.preventDefault();
      const loadingSetter = emailConfirmed ? setIsResending : setIsLoading;
      loadingSetter(true);

      try {
          const { success, error } = await sendVerificationEmail(email);
          if (success) {
              toast({
                  title: "Verification Code Sent",
                  description: "A verification code has been sent to your email. Please check your inbox.",
              });
              if (!emailConfirmed) {
                setEmailConfirmed(true);
              }
          } else {
              toast({
                  title: "Error Sending Code",
                  description: error || "We couldn't find a pending invitation for this email address.",
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
          loadingSetter(false);
      }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
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
          code: invite.verificationCode!,
        });
        router.push(`/register?${params.toString()}`);
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any)       {
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
              {emailConfirmed 
                ? 'Please enter the verification code sent to your email.'
                : 'Please enter your institutional email to begin.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailConfirmed ? (
                 <form onSubmit={handleSendCode}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="student.id@university.edu"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Sending Code...' : 'Continue'}
                        </Button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleVerifyCode}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                        <Label htmlFor="verificationCode">Verification Code</Label>
                         <div className="relative">
                             <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="verificationCode"
                                type="text"
                                placeholder="Enter your 6-digit code"
                                required
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button type="submit" className="w-full" disabled={isLoading || isResending}>
                                {isLoading ? 'Verifying...' : 'Verify and Proceed'}
                            </Button>
                             <Button type="button" variant="outline" className="w-full" disabled={isLoading || isResending} onClick={() => handleSendCode()}>
                                {isResending ? 'Resending...' : 'Resend Code'}
                            </Button>
                        </div>
                         <Button variant="link" size="sm" onClick={() => setEmailConfirmed(false)} disabled={isLoading || isResending}>
                            Use a different email
                        </Button>
                    </div>
                </form>
            )}
            
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
