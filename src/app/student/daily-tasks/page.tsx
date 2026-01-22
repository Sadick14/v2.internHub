
'use client';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/use-role';
import { createTask, getTasksByDate, updateTaskStatus, type DailyTask } from '@/services/tasksService';
import { getInternshipProfileByStudentId, type InternshipProfile } from '@/services/internshipProfileService';
import { PlusCircle, Trash2, Check, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { InternshipGuard } from '@/components/guards/internship-guard';

const taskSchema = z.object({
  description: z.string().min(5, 'Task description must be at least 5 characters.'),
  learningObjectives: z.string().min(5, 'Learning objectives are required.'),
});

const dailyTasksSchema = z.object({
  tasks: z.array(taskSchema),
});

type DailyTasksFormValues = z.infer<typeof dailyTasksSchema>;

export default function DailyTasksPage() {
    const { user } = useRole();
    const { toast } = useToast();
    const [profile, setProfile] = useState<InternshipProfile | null>(null);
    const [tasks, setTasks] = useState<DailyTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<DailyTasksFormValues>({
        resolver: zodResolver(dailyTasksSchema),
        defaultValues: {
            tasks: [{ description: '', learningObjectives: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "tasks",
    });

    const fetchPageData = async () => {
        if (!user?.uid) return;
        setIsLoading(true);
        try {
            const [profileData, tasksData] = await Promise.all([
                getInternshipProfileByStudentId(user.uid),
                getTasksByDate(user.uid, new Date()),
            ]);
            setProfile(profileData);
            setTasks(tasksData);
        } catch (error: any) {
            toast({ title: "Error", description: `Failed to fetch data: ${error.message}`, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if(user?.uid) fetchPageData();
    }, [user]);

    async function onSubmit(data: DailyTasksFormValues) {
        if (!user?.uid) {
            toast({ title: "Error", description: "User or internship profile is not available.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            for (const task of data.tasks) {
                await createTask({
                    studentId: user.uid,
                    date: startOfDay(new Date()),
                    description: task.description,
                    learningObjectives: task.learningObjectives,
                });
            }
            toast({ title: "Tasks Submitted", description: "Your daily tasks have been declared." });
            form.reset({ tasks: [{ description: '', learningObjectives: '' }] });
            fetchPageData(); // Refresh task list
        } catch (error: any) {
            toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleMarkAsComplete = async (taskId: string) => {
        try {
            await updateTaskStatus(taskId, 'Completed');
            toast({ title: 'Task Completed!', description: 'The task has been marked as complete.' });
            fetchPageData();
        } catch (error: any) {
            toast({ title: 'Error', description: `Failed to update task: ${error.message}`, variant: 'destructive' });
        }
    };

    const getStatusVariant = (status: DailyTask['status']) => {
        switch (status) {
            case 'Completed': return 'default';
            case 'Pending': return 'secondary';
            case 'Approved': return 'default'; // Treat same as completed for student view
            case 'Rejected': return 'destructive';
            default: return 'outline';
        }
    };

    if (isLoading) {
        return <Skeleton className="h-96 w-full" />;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Today's Declared Tasks</CardTitle>
                    <CardDescription>
                        A log of tasks you have declared for today, {format(new Date(), 'PPP')}. Your supervisor will review these.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {tasks.length > 0 ? (
                        <ul className="space-y-4">
                            {tasks.map(task => (
                                <li key={task.id} className="p-4 rounded-lg border bg-muted/20 flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{task.description}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            <span className="font-medium">Learning:</span> {task.learningObjectives}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
                                            {task.supervisorFeedback && (
                                                <p className="text-xs text-muted-foreground italic">
                                                   <span className="font-semibold">Feedback:</span> {task.supervisorFeedback}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {task.status === 'Pending' && (
                                        <Button size="sm" onClick={() => handleMarkAsComplete(task.id)}>
                                            <Check className="mr-2 h-4 w-4" />
                                            Mark as Complete
                                        </Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            You have not declared any tasks for today.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Declare New Tasks</CardTitle>
                    <CardDescription>
                        Add your tasks for today. You can add multiple tasks at once.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 rounded-lg border relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`tasks.${index}.description`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Task Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="e.g., Implement the user profile page UI" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`tasks.${index}.learningObjectives`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Learning Objectives</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="e.g., Learn how to use React components and Tailwind CSS" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                             <div className="flex justify-between items-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => append({ description: '', learningObjectives: '' })}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Another Task
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Declared Tasks
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
        </InternshipGuard>
    );
}
