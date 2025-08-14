

'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import type { Role } from '@/hooks/use-role';
import { verifyInvite, completeUserRegistration, type Invite } from '@/services/invitesService';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<Invite | null>(null);
  const [isValidating, setIsValidating] = useState(true);


  useEffect(() => {
    const inviteEmail = searchParams.get('email');
    const verificationCode = searchParams.get('code');

    if (inviteEmail && verificationCode) {
      const validateInvite = async () => {
        setIsValidating(true);
        try {
          const details = await verifyInvite(inviteEmail, verificationCode);
          if (details) {
            setInviteDetails(details);
          } else {
            toast({ title: "Error", description: "Invalid invite link. Please try the verification process again.", variant: 'destructive'});
            router.push('/verify');
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to validate invite.", variant: 'destructive'});
          router.push('/verify');
        } finally {
          setIsValidating(false);
        }
      };
      validateInvite();
    } else {
        setIsValidating(false);
    }
  }, [searchParams, router, toast]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (!inviteDetails || !inviteDetails.id) {
        toast({ title: "Error", description: "Invite details are missing. Please try the verification process again.", variant: 'destructive'});
        return;
    }
    setIsLoading(true);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, inviteDetails.email, password);
      const user = userCredential.user;
      
      const fullName = `${inviteDetails.firstName} ${inviteDetails.lastName}`;
      
      // 2. Update Auth profile (optional, but good practice)
      await updateProfile(user, { displayName: fullName });
      
      // 3. Call the server action to activate user and update invite
      await completeUserRegistration(inviteDetails.id, user.uid);
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now log in.",
      });
      router.push('/login');

    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isValidating) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-background">
              <Card className="w-full max-w-md mx-auto p-4">
                 <CardHeader>
                    <CardTitle className="text-2xl font-headline">Validating Invite...</CardTitle>
                    <CardDescription>
                        Please wait while we verify your invitation link.
                    </CardDescription>
                </CardHeader>
              </Card>
         </div>
      )
  }

  if (!inviteDetails) {
       return (
         <div className="flex items-center justify-center min-h-screen bg-background">
              <Card className="w-full max-w-md mx-auto p-4">
                 <CardHeader>
                    <CardTitle className="text-2xl font-headline">Invalid Access</CardTitle>
                    <CardDescription>
                    This page is for completing an invitation. Please use the link from your invite email or start the verification process.
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                     <Button asChild className="w-full">
                        <Link href="/verify">Verify Your Invite</Link>
                    </Button>
                </CardContent>
              </Card>
         </div>
      )
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Welcome, {inviteDetails.firstName}!</CardTitle>
            <CardDescription>
              Create a password to activate your InternshipTrack account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister}>
              <div className="grid gap-4">
                 <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={inviteDetails.email} disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={inviteDetails.firstName} disabled />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={inviteDetails.lastName} disabled />
                    </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Activating Account...' : 'Set Password & Activate'}
                </Button>
              </div>
            </form>
             <div className="mt-4 text-center text-sm">
                Go back to{' '}
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


export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterForm />
        </Suspense>
    )
}
