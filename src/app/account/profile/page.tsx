
'use client';
import { useRole } from '@/hooks/use-role';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/services/userService';
import { useState } from 'react';
import { sendPasswordResetEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Separator } from '@/components/ui/separator';

const profileSchema = z.object({
    fullName: z.string().min(1, "Full name is required."),
    email: z.string().email(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
});


export default function ProfilePage() {
    const { user, loading } = useRole();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        values: {
            fullName: user?.name || '',
            email: user?.email || ''
        }
    });

    const passwordForm = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    async function onProfileSubmit(data: z.infer<typeof profileSchema>) {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await updateUser(user.firestoreId, { fullName: data.fullName });
            toast({ title: "Success", description: "Your profile has been updated." });
        } catch (error: any) {
            toast({ title: "Error", description: `Failed to update profile: ${error.message}`, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    }

    async function onPasswordSubmit(data: z.infer<typeof passwordSchema>) {
        const currentUser = auth.currentUser;
        if (!currentUser || !currentUser.email) {
            toast({title: "Error", description: "Not authenticated.", variant: "destructive"});
            return;
        };

        setIsSubmitting(true);
        try {
            const credential = EmailAuthProvider.credential(currentUser.email, data.currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, data.newPassword);
            toast({ title: "Success", description: "Your password has been changed successfully."});
            passwordForm.reset();
        } catch (error: any) {
             toast({ title: "Error", description: `Failed to change password: ${error.message}`, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loading) {
        return <Skeleton className="h-[400px] w-full" />
    }

    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>User not found</CardTitle>
                    <CardDescription>Please log in to view your profile.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">My Profile</CardTitle>
                    <CardDescription>View and edit your personal information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                            <FormField
                                control={profileForm.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={profileForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl><Input {...field} disabled /></FormControl>
                                        <FormDescription>Your email address cannot be changed.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isSubmitting || !profileForm.formState.isDirty}>Update Profile</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Change Password</CardTitle>
                    <CardDescription>Update your password for security.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <FormField
                                control={passwordForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Password</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isSubmitting}>Change Password</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
