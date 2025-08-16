
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { sendAnnouncement, type AnnouncementTarget } from '@/services/announcementsService';
import { useRole } from '@/hooks/use-role';

const announcementSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters long.'),
  message: z.string().min(20, 'Message must be at least 20 characters long.'),
  target: z.enum(['all', 'students', 'lecturers', 'supervisors', 'admins', 'hods']),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function AnnouncementsPage() {
    const { user } = useRole();
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);

    const form = useForm<AnnouncementFormValues>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            subject: '',
            message: '',
            target: 'all',
        },
    });

    async function onSubmit(data: AnnouncementFormValues) {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to send an announcement.", variant: "destructive" });
            return;
        }

        setIsSending(true);
        try {
            const result = await sendAnnouncement({
                actor: { uid: user.uid, name: user.name, email: user.email },
                title: data.subject,
                message: data.message,
                targetRoles: data.target as AnnouncementTarget,
            });

            if (result.success) {
                toast({
                    title: "Announcement Sent!",
                    description: `Your message has been sent to ${result.recipientsCount} user(s).`,
                });
                form.reset();
            } else {
                 toast({ title: "Error", description: result.message, variant: "destructive" });
            }

        } catch (error: any) {
            toast({ title: "Sending Failed", description: `An unexpected error occurred: ${error.message}`, variant: "destructive" });
        } finally {
            setIsSending(false);
        }
    }

    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline">Send New Announcement</CardTitle>
                <CardDescription>
                    Compose and send an important announcement to users of the platform. The message will be delivered via in-app notification and email.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Subject</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Important Update for All Students" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="target"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Send To</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an audience" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="all">All Users</SelectItem>
                                                <SelectItem value="students">Students</SelectItem>
                                                <SelectItem value="lecturers">Lecturers</SelectItem>
                                                <SelectItem value="hods">HODs</SelectItem>
                                                <SelectItem value="supervisors">Supervisors</SelectItem>
                                                <SelectItem value="admins">Admins</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message Body</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write your announcement here. This content will be used for both the in-app notification and the email body."
                                            rows={10}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSending}>
                            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            {isSending ? 'Sending Announcement...' : 'Send Announcement'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
