
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
import { Check, Download } from 'lucide-react';
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
    
    const handleDownload = () => {
        if (!user) return;

        let content = `<html><head><title>Internship Data for ${user.name}</title>`;
        content += `<style>body{font-family:sans-serif;line-height:1.5;} h1,h2,h3{color:#333;} .section{margin-bottom:2rem;padding-bottom:1rem;border-bottom:1px solid #eee;} .task-item, .report-item{margin-bottom:1.5rem;}</style>`;
        content += `</head><body>`;
        content += `<h1>Internship Data for ${user.name}</h1>`;
        
        // Tasks Section
        content += `<div class="section"><h2>Daily Tasks History</h2>`;
        if (tasks.length > 0) {
            tasks.forEach(task => {
                content += `<div class="task-item">`;
                content += `<h3>Task for ${format(task.date, 'PPP')}</h3>`;
                content += `<p><strong>Description:</strong> ${task.description}</p>`;
                content += `<p><strong>Learning Objectives:</strong> ${task.learningObjectives}</p>`;
                content += `<p><strong>Status:</strong> ${task.status}</p>`;
                if (task.supervisorFeedback) {
                    content += `<p><strong>Feedback:</strong> ${task.supervisorFeedback}</p>`;
                }
                content += `</div>`;
            });
        } else {
            content += `<p>No tasks found.</p>`;
        }
        content += `</div>`;

        // Reports Section
        content += `<div class="section"><h2>Daily Reports History</h2>`;
        if (reports.length > 0) {
            reports.forEach(report => {
                content += `<div class="report-item">`;
                content += `<h3>Report for ${format(report.reportDate, 'PPP')}</h3>`;
                content += `<p><strong>Status:</strong> ${report.status}</p>`;
                content += `<h4>Work Accomplished:</h4><pre>${report.declaredTasks}</pre>`;
                content += `<h4>Detailed Report:</h4><pre>${report.fullReport}</pre>`;
                if (report.summary) {
                    content += `<h4>AI Summary:</h4><p>${report.summary}</p>`;
                }
                 if (report.supervisorComment) {
                    content += `<h4>Supervisor Feedback:</h4><p>${report.supervisorComment}</p>`;
                }
                 if (report.lecturerComment) {
                    content += `<h4>Lecturer Feedback:</h4><p>${report.lecturerComment}</p>`;
                }
                content += `</div>`;
            });
        } else {
            content += `<p>No reports found.</p>`;
        }
        content += `</div>`;
        
        content += `</body></html>`;
        
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Internship_Data.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({ title: 'Download Started', description: 'Your data is being downloaded as an HTML file.'});
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                     <div>
                        <CardTitle className="font-headline">My History</CardTitle>
                        <CardDescription>A log of all your submitted reports and declared tasks.</CardDescription>
                     </div>
                     <Button variant="outline" onClick={handleDownload} disabled={isLoading} className="w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        Download All Data
                    </Button>
                </div>
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
