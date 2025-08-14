
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/use-role';
import { getReportsBySupervisor, approveReport, rejectReport, type Report } from '@/services/reportsService';
import { getUserById } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReportWithStudentName extends Report {
    studentName: string;
}

export default function SupervisorReportsPage() {
    const { user } = useRole();
    const { toast } = useToast();
    const [reports, setReports] = useState<ReportWithStudentName[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState<{ [key: string]: string }>({});

    const fetchReports = async () => {
        if (!user?.uid) return;
        setIsLoading(true);
        try {
            const reportsData = await getReportsBySupervisor(user.uid);
            
            const reportsWithNames = await Promise.all(reportsData.map(async (report) => {
                const student = await getUserById(report.studentId);
                return { ...report, studentName: student?.fullName || 'Unknown Student' };
            }));

            setReports(reportsWithNames);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch pending reports.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [user]);

    const handleFeedbackChange = (reportId: string, value: string) => {
        setFeedback(prev => ({ ...prev, [reportId]: value }));
    };

    const handleApproval = async (reportId: string, action: 'approve' | 'reject') => {
        const comment = feedback[reportId] || (action === 'approve' ? 'Great work!' : 'Please review and resubmit.');
        
        try {
            if (action === 'approve') {
                await approveReport(reportId, comment);
                toast({ title: 'Report Approved', description: 'The student will be notified.' });
            } else {
                await rejectReport(reportId, comment);
                toast({ title: 'Report Rejected', description: 'Feedback has been sent to the student.' });
            }
            fetchReports(); // Refresh list after action
        } catch (error) {
            toast({ title: 'Error', description: `Failed to ${action} report.`, variant: 'destructive' });
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Pending Reports</CardTitle>
                <CardDescription>Review daily reports submitted by your interns. Provide feedback and approve or reject them.</CardDescription>
            </CardHeader>
            <CardContent>
                {reports.length > 0 ? (
                    <Accordion type="multiple" className="w-full space-y-4">
                        {reports.map((report) => (
                            <AccordionItem value={report.id} key={report.id} className="border rounded-lg px-4 bg-muted/20">
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex justify-between w-full items-center pr-4">
                                        <div>
                                            <p className="font-semibold">{report.studentName}</p>
                                            <p className="text-sm text-muted-foreground">{format(report.reportDate, 'PPP')}</p>
                                        </div>
                                        <Badge variant="secondary">Pending Review</Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <div>
                                        <h4 className="font-semibold text-sm">Declared Tasks:</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.declaredTasks}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">AI Generated Summary:</h4>
                                        <p className="text-sm text-muted-foreground">{report.summary}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor={`feedback-${report.id}`} className="font-semibold text-sm">Your Feedback:</label>
                                        <Textarea
                                            id={`feedback-${report.id}`}
                                            placeholder="Provide constructive feedback..."
                                            value={feedback[report.id] || ''}
                                            onChange={(e) => handleFeedbackChange(report.id, e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleApproval(report.id, 'reject')}>
                                            <X className="mr-2 h-4 w-4" /> Reject
                                        </Button>
                                        <Button size="sm" onClick={() => handleApproval(report.id, 'approve')}>
                                            <Check className="mr-2 h-4 w-4" /> Approve
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>No pending reports to review. Great job!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

