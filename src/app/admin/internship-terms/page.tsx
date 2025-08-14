
'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { getAllTerms, createTerm, updateTerm, type InternshipTerm } from '@/services/internshipTermsService';
import { getSettings, updateSettings, type SystemSettings } from '@/services/settingsService';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Archive, CheckCircle, MoreHorizontal, Download, Save } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const termSchema = z.object({
  name: z.string().min(1, "A name is required."),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date({ required_error: "An end date is required." }),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date.",
  path: ["endDate"],
});

type TermFormValues = z.infer<typeof termSchema>;


const settingsSchema = z.object({
    notifications: z.object({
        newReportToLecturer: z.boolean(),
        reportApprovedToStudent: z.boolean(),
        reportRejectedToStudent: z.boolean(),
        newInviteToUser: z.boolean(),
    })
});

type SettingsFormValues = z.infer<typeof settingsSchema>;


export default function InternshipTermsPage() {
    const { toast } = useToast();
    const [terms, setTerms] = useState<InternshipTerm[]>([]);
    const [isLoadingTerms, setIsLoadingTerms] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    const termForm = useForm<TermFormValues>({
        resolver: zodResolver(termSchema),
        defaultValues: {
            name: '',
            startDate: new Date(),
            endDate: new Date(),
        }
    });
    
    const settingsForm = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            notifications: {
                newReportToLecturer: true,
                reportApprovedToStudent: true,
                reportRejectedToStudent: true,
                newInviteToUser: true,
            }
        }
    });

    async function fetchTerms() {
        setIsLoadingTerms(true);
        const termsData = await getAllTerms();
        setTerms(termsData);
        setIsLoadingTerms(false);
    }
    
    async function fetchSettings() {
        setIsLoadingSettings(true);
        const settingsData = await getSettings();
        if (settingsData) {
            settingsForm.reset(settingsData);
        }
        setIsLoadingSettings(false);
    }

    useEffect(() => {
        fetchTerms();
        fetchSettings();
    }, []);

    async function onTermSubmit(data: TermFormValues) {
        setIsSubmitting(true);
        try {
            await createTerm(data);
            toast({
                title: 'Term Created',
                description: 'The new internship term has been created successfully.',
            });
            fetchTerms();
            setIsDialogOpen(false);
            termForm.reset();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Failed to create term: ${error.message}`,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
     async function onSettingsSubmit(data: SettingsFormValues) {
        try {
            await updateSettings(data);
            toast({
                title: 'Settings Saved',
                description: 'Global settings have been updated successfully.',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Failed to save settings: ${error.message}`,
                variant: 'destructive',
            });
        }
    }

    const handleSetStatus = async (id: string, status: InternshipTerm['status']) => {
        try {
            if (status === 'Active') {
                // Ensure only one term is active at a time
                const activeTerm = terms.find(t => t.status === 'Active');
                if (activeTerm && activeTerm.id !== id) {
                    await updateTerm(activeTerm.id, { status: 'Upcoming' });
                }
            }
            await updateTerm(id, { status });
            toast({
                title: 'Status Updated',
                description: `Term status has been set to ${status}.`,
            });
            fetchTerms();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Failed to update status: ${error.message}`,
                variant: 'destructive',
            });
        }
    };
    
    const getStatusVariant = (status: InternshipTerm['status']) => {
        switch (status) {
            case 'Active': return 'default';
            case 'Archived': return 'secondary';
            case 'Upcoming': return 'outline';
        }
    }

    const handleDownloadArchive = (termId: string) => {
        toast({
            title: 'Feature In Progress',
            description: 'The ability to download term archives will be implemented soon.',
        });
        console.log(`Request to download archive for term ${termId}`);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                             <CardTitle className="font-headline">Internship Terms</CardTitle>
                             <CardDescription>Manage internship periods, set the active term, and archive past sessions.</CardDescription>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                 <Button><PlusCircle className="mr-2 h-4 w-4" /> Create New Term</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Internship Term</DialogTitle>
                                </DialogHeader>
                                <Form {...termForm}>
                                    <form onSubmit={termForm.handleSubmit(onTermSubmit)} className="space-y-4">
                                         <FormField
                                            control={termForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Term Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. 2024-2025 Session" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={termForm.control}
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
                                                control={termForm.control}
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
                                         <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Term'}</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingTerms ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Term Name</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {terms.map((term) => (
                                <TableRow key={term.id}>
                                    <TableCell className="font-medium">{term.name}</TableCell>
                                    <TableCell>{format(term.startDate, 'PPP')}</TableCell>
                                    <TableCell>{format(term.endDate, 'PPP')}</TableCell>
                                    <TableCell><Badge variant={getStatusVariant(term.status)}>{term.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleSetStatus(term.id, 'Active')} disabled={term.status === 'Active'}>
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Set as Active
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSetStatus(term.id, 'Archived')} disabled={term.status === 'Archived'}>
                                                    <Archive className="mr-2 h-4 w-4" /> Archive Term
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDownloadArchive(term.id)}>
                                                    <Download className="mr-2 h-4 w-4" /> Download Archive
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                               ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

             <Card>
                <Form {...settingsForm}>
                    <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)}>
                        <CardHeader>
                             <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="font-headline">Global Settings</CardTitle>
                                    <CardDescription>Configure system-wide email notifications.</CardDescription>
                                </div>
                                <Button type="submit" disabled={settingsForm.formState.isSubmitting || !settingsForm.formState.isDirty}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {settingsForm.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
                                </Button>
                             </div>
                        </CardHeader>
                        <CardContent>
                             {isLoadingSettings ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between space-x-2 rounded-lg border p-4"><Skeleton className="h-5 w-48" /><Skeleton className="h-6 w-11" /></div>
                                    <div className="flex items-center justify-between space-x-2 rounded-lg border p-4"><Skeleton className="h-5 w-48" /><Skeleton className="h-6 w-11" /></div>
                                    <div className="flex items-center justify-between space-x-2 rounded-lg border p-4"><Skeleton className="h-5 w-48" /><Skeleton className="h-6 w-11" /></div>
                                    <div className="flex items-center justify-between space-x-2 rounded-lg border p-4"><Skeleton className="h-5 w-48" /><Skeleton className="h-6 w-11" /></div>
                                </div>
                             ) : (
                                <div className="space-y-6">
                                     <FormField
                                        control={settingsForm.control}
                                        name="notifications.newReportToLecturer"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">New Report Submissions</FormLabel>
                                                    <FormDescription>Notify lecturers when one of their students submits a daily report.</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={settingsForm.control}
                                        name="notifications.reportApprovedToStudent"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Report Approvals</FormLabel>
                                                    <FormDescription>Notify students when their report is approved by their supervisor.</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={settingsForm.control}
                                        name="notifications.reportRejectedToStudent"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Report Rejections</FormLabel>
                                                    <FormDescription>Notify students when their report is rejected and requires changes.</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={settingsForm.control}
                                        name="notifications.newInviteToUser"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">New User Invitations</FormLabel>
                                                    <FormDescription>Send an email to users when they are invited to join the platform.</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                             )}
                        </CardContent>
                    </form>
                </Form>
             </Card>
        </div>
    );
}
