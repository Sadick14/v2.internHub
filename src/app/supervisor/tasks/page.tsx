
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/use-role';
import { getTasksBySupervisor, updateTaskStatus, type DailyTask } from '@/services/tasksService';
import { getUserById } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TaskWithStudentName extends DailyTask {
    studentName: string;
}

export default function SupervisorTasksPage() {
    const { user } = useRole();
    const { toast } = useToast();
    const [tasks, setTasks] = useState<TaskWithStudentName[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState<{ [key: string]: string }>({});
    const [activeTab, setActiveTab] = useState('review');

    const fetchTasks = async (status: 'Review' | 'History') => {
        if (!user?.uid) return;
        setIsLoading(true);
        try {
            const statuses: DailyTask['status'][] = status === 'Review' ? ['Completed'] : ['Approved', 'Rejected'];
            const tasksData = await getTasksBySupervisor(user.uid, statuses);
            
            const tasksWithNames = await Promise.all(tasksData.map(async (task) => {
                const student = await getUserById(task.studentId);
                return { ...task, studentName: student?.fullName || 'Unknown Student' };
            }));

            setTasks(tasksWithNames);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch tasks.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if(user?.uid) fetchTasks('Review');
    }, [user]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        fetchTasks(value === 'review' ? 'Review' : 'History');
    }

    const handleFeedbackChange = (taskId: string, value: string) => {
        setFeedback(prev => ({ ...prev, [taskId]: value }));
    };

    const handleApproval = async (taskId: string, action: 'approve' | 'reject') => {
        const comment = feedback[taskId] || (action === 'approve' ? 'Good job.' : 'Needs improvement.');
        
        try {
            if (action === 'approve') {
                await updateTaskStatus(taskId, 'Approved', comment);
                toast({ title: 'Task Approved', description: 'The student will be notified.' });
            } else {
                await updateTaskStatus(taskId, 'Rejected', comment);
                toast({ title: 'Task Sent for Review', description: 'Feedback has been sent to the student.' });
            }
            fetchTasks('Review'); // Refresh list after action
        } catch (error: any) {
            toast({ title: 'Error', description: `Failed to ${action} task: ${error.message}`, variant: 'destructive' });
        }
    };
    
    const getStatusVariant = (status: DailyTask['status']) => {
        switch (status) {
            case 'Approved': return 'default';
            case 'Rejected': return 'destructive';
            default: return 'secondary';
        }
    };

    const renderTaskList = (taskList: TaskWithStudentName[]) => {
        if (taskList.length === 0) {
            return (
                <div className="text-center text-muted-foreground py-10">
                    <p>
                        {activeTab === 'review'
                            ? "No tasks are currently pending your review. Well done!"
                            : "You have not reviewed any tasks yet."}
                    </p>
                </div>
            )
        }

        if (activeTab === 'review') {
             return (
                 <Accordion type="multiple" className="w-full space-y-4">
                    {taskList.map((task) => (
                        <AccordionItem value={task.id} key={task.id} className="border rounded-lg px-4 bg-muted/20">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex justify-between w-full items-center pr-4">
                                    <div>
                                        <p className="font-semibold">{task.studentName}</p>
                                        <p className="text-sm text-muted-foreground">{format(task.date, 'PPP')}</p>
                                    </div>
                                    <Badge variant="secondary">Ready for Review</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                                <div>
                                    <h4 className="font-semibold text-sm">Task Description:</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
                                </div>
                                 <div>
                                    <h4 className="font-semibold text-sm">Learning Objectives:</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.learningObjectives}</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor={`feedback-${task.id}`} className="font-semibold text-sm">Your Feedback:</label>
                                    <Textarea
                                        id={`feedback-${task.id}`}
                                        placeholder="Provide constructive feedback..."
                                        value={feedback[task.id] || ''}
                                        onChange={(e) => handleFeedbackChange(task.id, e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleApproval(task.id, 'reject')}>
                                        <ThumbsDown className="mr-2 h-4 w-4" /> Reject
                                    </Button>
                                    <Button size="sm" onClick={() => handleApproval(task.id, 'approve')}>
                                        <ThumbsUp className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
             )
        }

        return (
             <ul className="space-y-4">
                {taskList.map((task) => (
                     <li key={task.id} className="p-4 rounded-lg border bg-muted/20">
                        <div className="flex justify-between w-full items-start">
                            <div>
                                <p className="font-semibold">{task.description}</p>
                                <p className="text-sm text-muted-foreground">{task.studentName} - {format(task.date, 'PPP')}</p>
                            </div>
                            <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
                        </div>
                         <div className="mt-2 pt-2 border-t">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                <span className="font-semibold">Your Feedback:</span> {task.supervisorFeedback}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Daily Task Review</CardTitle>
                <CardDescription>Review daily tasks submitted by your interns. Provide feedback and approve or reject them.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="review" onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="review">Pending Review</TabsTrigger>
                        <TabsTrigger value="history">Review History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="review" className="mt-4">
                        {isLoading ? <Skeleton className="h-40 w-full" /> : renderTaskList(tasks)}
                    </TabsContent>
                    <TabsContent value="history" className="mt-4">
                         {isLoading ? <Skeleton className="h-40 w-full" /> : renderTaskList(tasks)}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
