
'use client';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getSystemSettings, updateSystemSettings, type SystemSettings } from '@/services/systemSettingsService';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';

const settingsSchema = z.object({
  termStartDate: z.date({ required_error: "A start date is required." }),
  termEndDate: z.date({ required_error: "An end date is required." }),
  notifications: z.object({
    dailyReportReminder: z.boolean(),
    reportApproved: z.boolean(),
    reportRejected: z.boolean(),
  }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SystemSettingsPage() {
    const { toast } = useToast();
    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: async () => {
             const settings = await getSystemSettings();
             return {
                termStartDate: settings.termStartDate || new Date(),
                termEndDate: settings.termEndDate || new Date(),
                notifications: {
                    dailyReportReminder: settings.notifications?.dailyReportReminder ?? true,
                    reportApproved: settings.notifications?.reportApproved ?? true,
                    reportRejected: settings.notifications?.reportRejected ?? true,
                }
             }
        }
    });

    const { formState: { isLoading, isSubmitting }, reset } = form;

    useEffect(() => {
        async function fetchSettings() {
            const settings = await getSystemSettings();
            reset({
                termStartDate: settings.termStartDate || new Date(),
                termEndDate: settings.termEndDate || new Date(),
                notifications: {
                    dailyReportReminder: settings.notifications?.dailyReportReminder ?? true,
                    reportApproved: settings.notifications?.reportApproved ?? true,
                    reportRejected: settings.notifications?.reportRejected ?? true,
                }
            });
        }
        fetchSettings();
    }, [reset]);


    async function onSubmit(data: SettingsFormValues) {
        try {
            await updateSystemSettings(data);
            toast({
                title: 'Settings Saved',
                description: 'The system settings have been updated successfully.',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Failed to save settings: ${error.message}`,
                variant: 'destructive',
            });
        }
    }

    if (isLoading) {
        return <SettingsSkeleton />
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">System Settings</CardTitle>
                        <CardDescription>Manage global system configurations and settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                         <div className="space-y-4">
                            <h3 className="text-lg font-medium font-headline">Internship Term</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="termStartDate"
                                    render={({ field }) => (
                                         <FormItem className="flex flex-col">
                                            <FormLabel>Start Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                         <Button
                                                            variant={"outline"}
                                                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                            >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                             <FormDescription>The first day of the internship period.</FormDescription>
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="termEndDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>End Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                         <Button
                                                            variant={"outline"}
                                                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                            >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>The last day of the internship period.</FormDescription>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium font-headline">Email Notifications</h3>
                             <FormField
                                control={form.control}
                                name="notifications.dailyReportReminder"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Daily Report Reminders</FormLabel>
                                        <FormDescription>Send a daily reminder to students who have not submitted their report.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="notifications.reportApproved"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Report Approved</FormLabel>
                                        <FormDescription>Notify students when their daily report has been approved.</FormDescription>
                                    </div>
                                     <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                                )}
                            />
                              <FormField
                                control={form.control}
                                name="notifications.reportRejected"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Report Rejected</FormLabel>
                                        <FormDescription>Notify students when their daily report has been rejected and requires action.</FormDescription>
                                    </div>
                                     <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                                )}
                            />
                        </div>
                         <div>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}


function SettingsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-64" />
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="space-y-4">
                    <Skeleton className="h-7 w-40" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                             <Skeleton className="h-5 w-24" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                             <Skeleton className="h-5 w-24" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </div>
                 <div className="space-y-4">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
                 <div>
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardContent>
        </Card>
    )
}

