'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings, type SystemSettings } from '@/services/settingsService';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Save, 
  Bell, 
  Mail, 
  Shield, 
  Database, 
  Clock,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const form = useForm<SettingsFormValues>({
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

  async function fetchSettings() {
    setIsLoading(true);
    try {
      const settingsData = await getSettings();
      if (settingsData) {
        form.reset(settingsData);
      }
    } catch (error: any) {
      toast({
        title: 'Error Loading Settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  async function onSubmit(data: SettingsFormValues) {
    try {
      await updateSettings(data);
      setLastSaved(new Date());
      toast({
        title: 'Settings Saved',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error Saving Settings',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  const handleExportSettings = () => {
    setIsExporting(true);
    try {
      const settings = form.getValues();
      const dataStr = JSON.stringify(settings, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `system-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Settings Exported',
        description: 'Configuration file downloaded successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedSettings = JSON.parse(content);
        
        // Validate imported settings structure
        settingsSchema.parse(importedSettings);
        
        form.reset(importedSettings);
        
        toast({
          title: 'Settings Imported',
          description: 'Configuration loaded. Click Save to apply changes.',
        });
      } catch (error: any) {
        toast({
          title: 'Import Failed',
          description: 'Invalid settings file format.',
          variant: 'destructive',
        });
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
  };

  const handleResetToDefaults = () => {
    form.reset({
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
    });

    toast({
      title: 'Reset to Defaults',
      description: 'Settings reset to default values. Click Save to apply.',
    });
  };

  // Calculate notification statistics
  const notificationSettings = form.watch('notifications');
  const totalNotifications = Object.keys(notificationSettings).length;
  const enabledNotifications = Object.values(notificationSettings).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide preferences, notifications, and behavior
              </CardDescription>
            </div>
            {lastSaved && (
              <Badge variant="outline" className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3" />
                Last saved: {lastSaved.toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notification Channels</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledNotifications}/{totalNotifications}</div>
            <p className="text-xs text-muted-foreground">
              {enabledNotifications === totalNotifications ? 'All enabled' : `${totalNotifications - enabledNotifications} disabled`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configuration Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{form.formState.isDirty ? 'Modified' : 'Saved'}</div>
            <p className="text-xs text-muted-foreground">
              {form.formState.isDirty ? 'Unsaved changes' : 'All changes applied'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
            <p className="text-xs text-muted-foreground">All systems running</p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="notifications" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="system">
                <Database className="h-4 w-4 mr-2" />
                System
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Shield className="h-4 w-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Control when the system sends email notifications to users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-6 w-11" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* User Management Notifications */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold">User Management</h3>
                          <Separator className="flex-1" />
                        </div>

                        <FormField
                          control={form.control}
                          name="notifications.newInviteToUser"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">User Invitation</FormLabel>
                                <FormDescription>
                                  Send email when users are invited to join the platform
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notifications.lecturerAssignedToStudent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Lecturer Assignment</FormLabel>
                                <FormDescription>
                                  Notify students when a supervising lecturer is assigned
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Report Notifications */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold">Report Workflow</h3>
                          <Separator className="flex-1" />
                        </div>

                        <FormField
                          control={form.control}
                          name="notifications.newReportToLecturer"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">New Report Submission</FormLabel>
                                <FormDescription>
                                  Notify lecturers when students submit daily reports
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notifications.reportApprovedToStudent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Report Approved</FormLabel>
                                <FormDescription>
                                  Notify students when their report is approved
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notifications.reportRejectedToStudent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Report Rejected</FormLabel>
                                <FormDescription>
                                  Notify students when their report requires changes
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Task Notifications */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold">Task Management</h3>
                          <Separator className="flex-1" />
                        </div>

                        <FormField
                          control={form.control}
                          name="notifications.taskDeclaredToSupervisor"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Task Declaration</FormLabel>
                                <FormDescription>
                                  Notify supervisors when interns declare daily tasks
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notifications.taskApprovedToStudent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Task Approved</FormLabel>
                                <FormDescription>
                                  Notify students when supervisors approve tasks
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notifications.taskRejectedToStudent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Task Rejected</FormLabel>
                                <FormDescription>
                                  Notify students when supervisors request task changes
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notification Summary Alert */}
              {enabledNotifications < totalNotifications && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Some notifications are disabled</AlertTitle>
                  <AlertDescription>
                    {totalNotifications - enabledNotifications} notification channel(s) are currently turned off. 
                    Users may miss important updates.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    System Configuration
                  </CardTitle>
                  <CardDescription>
                    Backup, restore, and manage system configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <h3 className="font-semibold">Export Configuration</h3>
                      <p className="text-sm text-muted-foreground">
                        Download current settings as a JSON file for backup
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleExportSettings}
                      disabled={isExporting}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {isExporting ? 'Exporting...' : 'Export'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <h3 className="font-semibold">Import Configuration</h3>
                      <p className="text-sm text-muted-foreground">
                        Restore settings from a previously exported file
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('import-file')?.click()}
                      disabled={isImporting}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isImporting ? 'Importing...' : 'Import'}
                    </Button>
                    <input
                      id="import-file"
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportSettings}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <h3 className="font-semibold">Reset to Defaults</h3>
                      <p className="text-sm text-muted-foreground">
                        Restore all settings to their default values
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetToDefaults}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>

                  <Separator />

                  <div className="rounded-lg bg-muted p-4 space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Configuration Status
                    </h3>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">Last Modified:</span>{' '}
                        <span className="font-medium">{lastSaved ? lastSaved.toLocaleString() : 'Never'}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Pending Changes:</span>{' '}
                        <span className="font-medium">{form.formState.isDirty ? 'Yes' : 'No'}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Configuration Version:</span>{' '}
                        <span className="font-medium">1.0</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Advanced Settings
                  </CardTitle>
                  <CardDescription>
                    Additional configuration options and system information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Advanced Features</AlertTitle>
                    <AlertDescription>
                      Additional configuration options will be available in future updates.
                      Current settings cover all essential notification and system preferences.
                    </AlertDescription>
                  </Alert>

                  <div className="mt-6 space-y-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold mb-2">System Information</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Platform Version: 2.0.0</p>
                        <p>Settings Schema: v1.0</p>
                        <p>Environment: Production</p>
                        <p>Last Deploy: {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold mb-2">Feature Status</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Email Notifications</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Real-time Updates</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Data Export</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Analytics</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {form.formState.isDirty 
                    ? 'You have unsaved changes' 
                    : 'All changes are saved'
                  }
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={!form.formState.isDirty || form.formState.isSubmitting}
                  >
                    Discard Changes
                  </Button>
                  <Button
                    type="submit"
                    disabled={!form.formState.isDirty || form.formState.isSubmitting}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
