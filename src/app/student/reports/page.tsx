
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRole } from '@/hooks/use-role';
import { getReportsByStudentId, type Report } from '@/services/reportsService';
import { getAllTasksByStudentId, updateTaskStatus, type DailyTask } from '@/services/tasksService';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HistoryPage() {
    const { user } = useRole();
    const { toast } = useToast();
    const [reports, setReports] = useState<Report[]>([]);
    const [tasks, setTasks] = useState<DailyTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchData() {
        if (!user?.uid) return;
        setIsLoading(true);
        try {
            const [reportsData, tasksData] = await Promise.all([
                getReportsByStudentId(user.uid),
                getAllTasksByStudentId(user.uid)
            ]);
            setReports(reportsData);
            setTasks(tasksData);
        } catch (error) {
            console.error("Failed to fetch history:", error);
            toast({ title: "Error", description: "Could not load history data.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (user?.uid) {
            fetchData();
        }
    }, [user]);

    const handleMarkAsComplete = async (taskId: string) => {
        try {
            await updateTaskStatus(taskId, 'Completed');
            toast({ title: 'Task Completed!', description: 'The task has been marked as complete.' });
            fetchData(); // Refresh task list
        } catch (error: any) {
            toast({ title: 'Error', description: `Failed to update task: ${error.message}`, variant: 'destructive' });
        }
    };

    const getReportStatusVariant = (status: string) => {
        switch (status) {
            case 'Approved': return 'default';
            case 'Pending': return 'secondary';
            case 'Rejected': return 'destructive';
            default: return 'outline';
        }
    }

    const getTaskStatusVariant = (status: DailyTask['status']) => {
        switch (status) {
            case 'Completed': return 'outline';
            case 'Pending': return 'secondary';
            case 'Approved': return 'default';
            case 'Rejected': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">My History</CardTitle>
                <CardDescription>A log of all your submitted reports and declared tasks.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="reports">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="reports">Report History</TabsTrigger>
                        <TabsTrigger value="tasks">Task History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="reports" className="mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Work Accomplished</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : reports.length > 0 ? (
                                    reports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell className="font-medium">{format(report.reportDate, 'PPP')}</TableCell>
                                            <TableCell className="text-muted-foreground truncate max-w-xs">{report.declaredTasks}</TableCell>
                                            <TableCell><Badge variant={getReportStatusVariant(report.status)}>{report.status}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/student/reports/${report.id}`}>
                                                        View Details
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            You have not submitted any reports yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="tasks" className="mt-4">
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : tasks.length > 0 ? (
                                    tasks.map((task) => (
                                        <TableRow key={task.id}>
                                            <TableCell className="font-medium">{format(task.date, 'PPP')}</TableCell>
                                            <TableCell className="text-muted-foreground truncate max-w-xs">{task.description}</TableCell>
                                            <TableCell><Badge variant={getTaskStatusVariant(task.status)}>{task.status}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                {task.status === 'Pending' && (
                                                     <Button size="sm" variant="outline" onClick={() => handleMarkAsComplete(task.id)}>
                                                        <Check className="mr-2 h-4 w-4" />
                                                        Mark as Complete
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            You have not declared any tasks yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
