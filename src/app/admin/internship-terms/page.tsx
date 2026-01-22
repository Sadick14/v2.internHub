
'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { getAllTerms, createTerm, updateTerm, archiveTerm, type InternshipTerm } from '@/services/internshipTermsService';
import { getSettings, updateSettings, type SystemSettings } from '@/services/settingsService';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Archive, CheckCircle, MoreHorizontal, Download, Save, Send, BellRing } from 'lucide-react';
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
import { sendEvaluationReminders, sendTermEndingReminders } from '@/services/remindersService';
import { useRole } from '@/hooks/use-role';

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
        taskDeclaredToSupervisor: z.boolean(),
        taskApprovedToStudent: z.boolean(),
        taskRejectedToStudent: z.boolean(),
        lecturerAssignedToStudent: z.boolean(),
    })
});

type SettingsFormValues = z.infer<typeof settingsSchema>;


export default function InternshipTermsPage() {
    const { user } = useRole();
    const { toast } = useToast();
    const [terms, setTerms] = useState<InternshipTerm[]>([]);
    const [isLoadingTerms, setIsLoadingTerms] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSendingEvalReminders, setIsSendingEvalReminders] = useState(false);
    const [isSendingTermReminders, setIsSendingTermReminders] = useState(false);
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
                taskDeclaredToSupervisor: true,
                taskApprovedToStudent: true,
                taskRejectedToStudent: true,
                lecturerAssignedToStudent: true,
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
                 await updateTerm(id, { status });
            } else if (status === 'Archived') {
                await archiveTerm(id);
            } else {
                 await updateTerm(id, { status });
            }

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

    const [isDownloading, setIsDownloading] = useState<string | null>(null);
    const [archivePreview, setArchivePreview] = useState<any>(null);
    const [showArchiveDialog, setShowArchiveDialog] = useState(false);

    const handleShowArchivePreview = async (termId: string, termName: string) => {
        try {
            toast({
                title: 'Loading Preview',
                description: 'Fetching archive statistics...',
            });

            const { getTermArchiveData } = await import('@/services/internshipTermsService');
            const archiveData = await getTermArchiveData(termId);
            setArchivePreview({ ...archiveData, termId, termName });
            setShowArchiveDialog(true);
        } catch (error: any) {
            toast({
                title: 'Preview Failed',
                description: error.message || 'Failed to load archive preview.',
                variant: 'destructive',
            });
        }
    };

    const handleDownloadArchive = async (termId: string, termName: string, format: 'json' | 'csv' = 'json') => {
        setIsDownloading(termId);
        try {
            toast({
                title: 'Preparing Archive',
                description: 'Collecting all term data for export...',
            });

            const { getTermArchiveData } = await import('@/services/internshipTermsService');
            const archiveData = await getTermArchiveData(termId);

            if (format === 'json') {
                // Download as JSON
                const jsonString = JSON.stringify(archiveData, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${termName.replace(/\s+/g, '_')}_archive_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                // Download as CSV (summary + separate CSV files zipped)
                const { exportArchiveAsCSV } = await import('@/lib/archiveExport');
                await exportArchiveAsCSV(archiveData, termName);
            }

            toast({
                title: 'Archive Downloaded',
                description: `Successfully exported ${archiveData.statistics.totalReports} reports, ${archiveData.statistics.totalUsers} users, and more.`,
            });
        } catch (error: any) {
            console.error('Archive download error:', error);
            toast({
                title: 'Download Failed',
                description: error.message || 'Failed to generate archive. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsDownloading(null);
        }
    };

    const handleSendEvalReminders = async () => {
        if (!user) {
            toast({ title: 'Error', description: 'You must be logged in to perform this action.', variant: 'destructive'});
            return;
        }
        setIsSendingEvalReminders(true);
        try {
            const result = await sendEvaluationReminders({
                uid: user.uid,
                displayName: user.name,
                email: user.email
            });
            if (result.success) {
                toast({
                    title: 'Reminders Sent',
                    description: `Successfully sent ${result.remindersSent} evaluation reminders to supervisors.`
                });
            } else {
                toast({
                    title: 'Error',
                    description: result.message,
                    variant: 'destructive'
                });
            }
        } catch (error: any) {
             toast({
                title: 'Error',
                description: `An unexpected error occurred: ${error.message}`,
                variant: 'destructive',
            });
        } finally {
            setIsSendingEvalReminders(false);
        }
    }

     const handleSendTermReminders = async () => {
        if (!user) {
            toast({ title: 'Error', description: 'You must be logged in to perform this action.', variant: 'destructive'});
            return;
        }
        setIsSendingTermReminders(true);
        try {
            const result = await sendTermEndingReminders({
                uid: user.uid,
                displayName: user.name,
                email: user.email
            });
            if (result.success) {
                toast({
                    title: 'Reminders Sent',
                    description: `Successfully sent ${result.notificationsSent} end-of-term reminders.`
                });
            } else {
                toast({
                    title: 'Error',
                    description: result.message,
                    variant: 'destructive'
                });
            }
        } catch (error: any) {
             toast({
                title: 'Error',
                description: `An unexpected error occurred: ${error.message}`,
                variant: 'destructive',
            });
        } finally {
            setIsSendingTermReminders(false);
        }
    }
    
    const TermCard = ({term}: {term: InternshipTerm}) => (
        <Card>
            <CardContent className="pt-6">
                 <div className="flex justify-between items-start">
                    <div>
                        <div className="font-medium">{term.name}</div>
                        <div className="text-sm text-muted-foreground">{format(term.startDate, 'PPP')} - {format(term.endDate, 'PPP')}</div>
                    </div>
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
                            {term.status === 'Archived' && (
                                <DropdownMenuItem onClick={() => handleShowArchivePreview(term.id, term.name)}>
                                    <Activity className="mr-2 h-4 w-4" /> View Archive Stats
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDownloadArchive(term.id, term.name, 'json')} disabled={isDownloading === term.id}>
                                <Download className="mr-2 h-4 w-4" /> {isDownloading === term.id ? 'Downloading...' : 'Download as JSON'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadArchive(term.id, term.name, 'csv')} disabled={isDownloading === term.id}>
                                <Download className="mr-2 h-4 w-4" /> {isDownloading === term.id ? 'Downloading...' : 'Download as CSV'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="mt-4">
                    <Badge variant={getStatusVariant(term.status)}>{term.status}</Badge>
                </div>
            </CardContent>
        </Card>
    );

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
                        <>
                        {/* Mobile View */}
                         <div className="md:hidden space-y-4">
                            {terms.map((term) => <TermCard key={term.id} term={term} />)}
                         </div>
                         {/* Desktop View */}
                         <div className="hidden md:block">
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
                                                    {term.status === 'Archived' && (
                                                        <DropdownMenuItem onClick={() => handleShowArchivePreview(term.id, term.name)}>
                                                            <Activity className="mr-2 h-4 w-4" /> View Archive Stats
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleDownloadArchive(term.id, term.name, 'json')} disabled={isDownloading === term.id}>
                                                        <Download className="mr-2 h-4 w-4" /> {isDownloading === term.id ? 'Downloading...' : 'Download as JSON'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDownloadArchive(term.id, term.name, 'csv')} disabled={isDownloading === term.id}>
                                                        <Download className="mr-2 h-4 w-4" /> {isDownloading === term.id ? 'Downloading...' : 'Download as CSV'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                         </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">System Actions</CardTitle>
                    <CardDescription>Perform manual system-wide actions and triggers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <h3 className="font-semibold">Send Evaluation Reminders</h3>
                            <p className="text-sm text-muted-foreground">
                                Notify supervisors who have not yet completed their intern evaluations for the active term.
                            </p>
                        </div>
                         <Button onClick={handleSendEvalReminders} disabled={isSendingEvalReminders}>
                            <Send className="mr-2 h-4 w-4" />
                            {isSendingEvalReminders ? 'Sending...' : 'Send Reminders'}
                        </Button>
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <h3 className="font-semibold">Send End-of-Term Reminders</h3>
                            <p className="text-sm text-muted-foreground">
                                Notify all active users that the current internship term is ending soon.
                            </p>
                        </div>
                         <Button onClick={handleSendTermReminders} disabled={isSendingTermReminders}>
                            <BellRing className="mr-2 h-4 w-4" />
                            {isSendingTermReminders ? 'Sending...' : 'Send Notifications'}
                        </Button>
                    </div>
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
                                    <FormField
                                        control={settingsForm.control}
                                        name="notifications.lecturerAssignedToStudent"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Lecturer Assignment</FormLabel>
                                                    <FormDescription>Notify students when a supervising lecturer is assigned to them.</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
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
                                                    <FormDescription>Notify students when their report is approved by their lecturer.</FormDescription>
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
                                        name="notifications.taskDeclaredToSupervisor"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Task Declaration</FormLabel>
                                                    <FormDescription>Notify supervisors when an intern declares their daily tasks.</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={settingsForm.control}
                                        name="notifications.taskApprovedToStudent"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Task Approval</FormLabel>
                                                    <FormDescription>Notify students when their supervisor approves a task.</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={settingsForm.control}
                                        name="notifications.taskRejectedToStudent"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Task Rejection</FormLabel>
                                                    <FormDescription>Notify students when their supervisor requests changes to a task.</FormDescription>
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

            {/* Archive Preview Dialog */}
            <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Archive Statistics - {archivePreview?.termName}</DialogTitle>
                    </DialogHeader>
                    {archivePreview && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Term Period</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(archivePreview.term.startDate).toLocaleDateString()} - {new Date(archivePreview.term.endDate).toLocaleDateString()}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Status</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Badge variant="secondary">{archivePreview.term.status}</Badge>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Data Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold">{archivePreview.statistics.totalUsers}</p>
                                            <p className="text-xs text-muted-foreground">Total Users</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold">{archivePreview.statistics.totalStudents}</p>
                                            <p className="text-xs text-muted-foreground">Students</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold">{archivePreview.statistics.totalLecturers}</p>
                                            <p className="text-xs text-muted-foreground">Lecturers</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold">{archivePreview.statistics.totalSupervisors}</p>
                                            <p className="text-xs text-muted-foreground">Supervisors</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold">{archivePreview.statistics.totalReports}</p>
                                            <p className="text-xs text-muted-foreground">Reports</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold">{archivePreview.statistics.totalProfiles}</p>
                                            <p className="text-xs text-muted-foreground">Internships</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold">{archivePreview.statistics.totalEvaluations}</p>
                                            <p className="text-xs text-muted-foreground">Evaluations</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold">{archivePreview.statistics.totalCheckIns}</p>
                                            <p className="text-xs text-muted-foreground">Check-ins</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold">{archivePreview.statistics.totalTasks}</p>
                                            <p className="text-xs text-muted-foreground">Tasks</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
                                    Close
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        handleDownloadArchive(archivePreview.termId, archivePreview.termName, 'csv');
                                        setShowArchiveDialog(false);
                                    }}
                                >
                                    <Download className="mr-2 h-4 w-4" /> Download CSV
                                </Button>
                                <Button
                                    onClick={() => {
                                        handleDownloadArchive(archivePreview.termId, archivePreview.termName, 'json');
                                        setShowArchiveDialog(false);
                                    }}
                                >
                                    <Download className="mr-2 h-4 w-4" /> Download JSON
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
