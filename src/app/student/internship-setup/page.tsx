
'use client';
import { useState, useEffect } from 'react';
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
import { CalendarIcon, Briefcase, Building2, Mail, User, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { createInternshipProfile, getInternshipProfileByStudentId, type InternshipProfile } from '@/services/internshipProfileService';
import { Badge } from '@/components/ui/badge';

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

function InternshipSetupForm() {
    const { user } = useRole();
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
            const result = await createInternshipProfile({
                ...data,
                studentId: user.uid,
                studentName: user.name,
                studentEmail: user.email
            });

            if (result.success) {
                toast({
                    title: 'Success!',
                    description: result.message,
                });
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

function InternshipProfileDisplay({ profile }: { profile: InternshipProfile }) {
    
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'pending': return 'secondary';
            default: return 'outline';
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline">Your Internship Profile</CardTitle>
                        <CardDescription>
                            These are the details of your current internship placement.
                        </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(profile.status)} className="capitalize">{profile.status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold font-headline mb-4 flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" />Company Details</h3>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                            <Building2 className="w-4 h-4 mt-1 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Company Name</p>
                                <p className="font-medium">{profile.companyName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Building2 className="w-4 h-4 mt-1 text-muted-foreground" />
                             <div>
                                <p className="text-muted-foreground">Company Address</p>
                                <p className="font-medium">{profile.companyAddress}</p>
                            </div>
                        </div>
                    </div>
                </div>

                 <div>
                    <h3 className="text-lg font-semibold font-headline mb-4 flex items-center"><User className="mr-2 h-5 w-5 text-primary" />Supervisor Details</h3>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                         <div className="flex items-start gap-3">
                            <User className="w-4 h-4 mt-1 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Supervisor Name</p>
                                <p className="font-medium">{profile.supervisorName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Supervisor Email</p>
                                <p className="font-medium">{profile.supervisorEmail}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold font-headline mb-4 flex items-center"><Clock className="mr-2 h-5 w-5 text-primary" />Internship Duration</h3>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                            <CalendarIcon className="w-4 h-4 mt-1 text-muted-foreground" />
                             <div>
                                <p className="text-muted-foreground">Start Date</p>
                                <p className="font-medium">{format(profile.startDate, "PPP")}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                             <CalendarIcon className="w-4 h-4 mt-1 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">End Date</p>
                                <p className="font-medium">{format(profile.endDate, "PPP")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


export default function InternshipSetupPage() {
    const { user, loading: userLoading } = useRole();
    const { toast } = useToast();
    const [profile, setProfile] = useState<InternshipProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
        if (userLoading) return;
        if (!user) {
            setIsLoading(false);
            return;
        };

        async function fetchProfile() {
            try {
                const existingProfile = await getInternshipProfileByStudentId(user!.uid);
                setProfile(existingProfile);
            } catch (error: any) {
                toast({
                    title: 'Error fetching profile',
                    description: error.message,
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchProfile();
    }, [user, userLoading, toast]);


    if (isLoading || userLoading) {
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

    // If profile exists, show the display component. Otherwise, show the form.
    return profile ? <InternshipProfileDisplay profile={profile} /> : <InternshipSetupForm />;
}
