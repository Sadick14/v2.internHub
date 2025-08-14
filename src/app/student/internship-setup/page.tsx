
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/use-role';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { setupInternship } from '@/services/internshipService';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const internshipSetupSchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  companyAddress: z.string().min(5, "Company address is required."),
  supervisorName: z.string().min(2, "Supervisor name is required."),
  supervisorEmail: z.string().email("Invalid email address."),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date({ required_error: "An end date is required." }),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date.",
  path: ["endDate"],
});

type InternshipSetupFormValues = z.infer<typeof internshipSetupSchema>;

export default function InternshipSetupPage() {
    const { user, loading: userLoading } = useRole();
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<InternshipSetupFormValues>({
        resolver: zodResolver(internshipSetupSchema),
        defaultValues: {
            companyName: '',
            companyAddress: '',
            supervisorName: '',
            supervisorEmail: '',
        }
    });
    
    async function onSubmit(data: InternshipSetupFormValues) {
        if (!user?.uid || !user.name || !user.email) {
             toast({ title: 'Error', description: 'User information is not available. Please log in again.', variant: 'destructive' });
             return;
        }

        setIsSubmitting(true);
        try {
            const result = await setupInternship({
                ...data,
                studentId: user.uid, // This is now the document ID
                studentName: user.name,
                studentEmail: user.email
            });

            if (result.success) {
                toast({
                    title: 'Success!',
                    description: result.message,
                });
                // A hard refresh might be needed to fully reload the user context
                window.location.href = '/student/dashboard';
            } else {
                 toast({
                    title: 'Error',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
             toast({
                title: 'Submission Error',
                description: `An unexpected error occurred: ${error.message}`,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    }


    if (userLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-1/4" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Internship Profile Setup</CardTitle>
                <CardDescription>
                    Provide the details of your internship placement. This will invite your company supervisor to the platform.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <fieldset className="space-y-4">
                                 <legend className="text-lg font-medium font-headline mb-2">Company Details</legend>
                                <FormField
                                    control={form.control}
                                    name="companyName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Name</FormLabel>
                                            <FormControl><Input placeholder="e.g. Innovate LLC" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="companyAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Address</FormLabel>
                                            <FormControl><Input placeholder="e.g. 123 Tech Avenue, Silicon Valley" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </fieldset>
                             <fieldset className="space-y-4">
                                <legend className="text-lg font-medium font-headline mb-2">Supervisor Details</legend>
                                <FormField
                                    control={form.control}
                                    name="supervisorName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Supervisor Full Name</FormLabel>
                                            <FormControl><Input placeholder="e.g. Jane Doe" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="supervisorEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Supervisor Email</FormLabel>
                                            <FormControl><Input placeholder="e.g. supervisor@company.com" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </fieldset>
                        </div>

                         <fieldset className="space-y-4">
                            <legend className="text-lg font-medium font-headline mb-2">Internship Dates</legend>
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>End Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </fieldset>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Save & Send Supervisor Invite'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
