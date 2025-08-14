
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
import { acceptInvite, verifyInvite } from '@/services/invitesService';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [inviteId, setInviteId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFromInvite, setIsFromInvite] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<any>(null);


  useEffect(() => {
    const inviteEmail = searchParams.get('email');
    const inviteFirstName = searchParams.get('firstName');
    const inviteLastName = searchParams.get('lastName');
    const id = searchParams.get('inviteId');

    if (inviteEmail && inviteFirstName && inviteLastName && id) {
      setEmail(inviteEmail);
      setFirstName(inviteFirstName);
      setLastName(inviteLastName);
      setInviteId(id);
      setIsFromInvite(true);
      // It's better to refetch the invite details here to get all data
      const fetchInvite = async () => {
          const code = searchParams.get('code'); // Assuming code is also passed
          if (code) {
             const details = await verifyInvite(inviteEmail, code);
             setInviteDetails(details);
          }
      };
      fetchInvite();
    }
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (!inviteDetails) {
        toast({ title: "Error", description: "Invite details are missing. Please try the verification process again.", variant: 'destructive'});
        return;
    }
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const fullName = `${firstName} ${lastName}`;
      await updateProfile(user, { displayName: fullName });

      const userProfile = {
        uid: user.uid,
        fullName,
        email,
        role: inviteDetails.role,
        status: 'active',
        createdAt: new Date(),
        indexNumber: inviteDetails.indexNumber || '',
        programOfStudy: inviteDetails.programOfStudy || '',
        facultyId: inviteDetails.facultyId || '',
        departmentId: inviteDetails.departmentId || '',
      };
      
      await acceptInvite(inviteId, user.uid, userProfile);
      
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
  
  if (!isFromInvite) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-background">
              <Card className="w-full max-w-md mx-auto p-4">
                 <CardHeader>
                    <CardTitle className="text-2xl font-headline">Invalid Access</CardTitle>
                    <CardDescription>
                    This page is for completing an invitation. Please use the link from your invite email.
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
            <CardTitle className="text-2xl font-headline">Welcome, {firstName}!</CardTitle>
            <CardDescription>
              Create a password to activate your InternshipTrack account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister}>
              <div className="grid gap-4">
                 <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={firstName} disabled />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={lastName} disabled />
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
