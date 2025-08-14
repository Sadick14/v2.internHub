
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function InviteStudentPage() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInviteStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!fullName || !email || !department) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill out all fields.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      // We use the email as the document ID for easy lookup during verification
      await setDoc(doc(db, "pendingUsers", email), {
        fullName,
        email,
        department,
        role: 'student',
        status: 'pending',
      });

      toast({
        title: 'Student Invited',
        description: `${fullName} has been added as a pending student.`,
      });

      // Clear form
      setFullName('');
      setEmail('');
      setDepartment('');

    } catch (error: any) {
      toast({
        title: 'Error Inviting Student',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Invite Student</CardTitle>
        <CardDescription>
          Add a student to the system by providing their details. They will be in a 'pending' state until they verify their account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInviteStudent} className="space-y-4 max-w-lg">
          <div className="grid gap-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input
              id="full-name"
              placeholder="e.g., Jane Doe"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Student Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., student.id@university.edu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="e.g., Computer Science"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding Student...' : 'Add Pending Student'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
