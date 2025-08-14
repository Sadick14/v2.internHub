
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/use-role';
import { getReportsByLecturer, approveReport, rejectReport, type Report } from '@/services/reportsService';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';


interface ReportWithStudentName extends Report {
    studentName: string;
}

export default function LecturerReportsPage() {
    const { user } = useRole();
    const { toast } = useToast();
    const [reports, setReports] = useState<ReportWithStudentName[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState<{ [key: string]: string }>({});
    const [activeTab, setActiveTab] = useState('pending');

    const fetchReports = async (status: 'Pending' | 'History') => {
        if (!user?.uid) return;
        setIsLoading(true);
        try {
            const statuses: Report['status'][] = status === 'Pending' ? ['Pending'] : ['Approved', 'Rejected'];
            const reportsData = await getReportsByLecturer(user.uid, statuses);
            setReports(reportsData as ReportWithStudentName[]);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch reports.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if(user?.uid) fetchReports('Pending');
    }, [user]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        fetchReports(value === 'pending' ? 'Pending' : 'History');
    }

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
            fetchReports('Pending'); // Refresh list after action
        } catch (error: any) {
            toast({ title: 'Error', description: `Failed to ${action} report: ${error.message}`, variant: 'destructive' });
        }
    };
    
    const getStatusVariant = (status: Report['status']) => {
        switch (status) {
            case 'Approved': return 'default';
            case 'Pending': return 'secondary';
            case 'Rejected': return 'destructive';
            default: return 'outline';
        }
    };

    const renderReportList = (reportList: ReportWithStudentName[]) => {
        if (reportList.length === 0) {
            return (
                <div className="text-center text-muted-foreground py-10">
                    <p>
                        {activeTab === 'pending' 
                            ? "No reports are currently pending your review. Well done!"
                            : "You have not reviewed any reports yet."}
                    </p>
                </div>
            );
        }

        if (activeTab === 'pending') {
            return (
                <Accordion type="multiple" className="w-full space-y-4">
                    {reportList.map((report) => (
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
                                    <h4 className="font-semibold text-sm">Work Accomplished:</h4>
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
            )
        }

        return (
             <ul className="space-y-4">
                {reportList.map((report) => (
                     <li key={report.id} className="p-4 rounded-lg border bg-muted/20">
                        <div className="flex justify-between w-full items-start">
                            <div>
                                <p className="font-semibold">{report.studentName} - {format(report.reportDate, 'PPP')}</p>
                                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                    <span className="font-medium">Summary:</span> {report.summary}
                                </p>
                            </div>
                            <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                        </div>
                         <div className="mt-2 pt-2 border-t">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                <span className="font-semibold">Your Feedback:</span> {report.lecturerComment}
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
                <CardTitle className="font-headline">Student Reports</CardTitle>
                <CardDescription>Review daily reports submitted by your students for university records. Provide feedback, approve, or reject them.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="pending" onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pending">Pending Review</TabsTrigger>
                        <TabsTrigger value="history">Review History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="mt-4">
                         {isLoading ? <Skeleton className="h-40 w-full" /> : renderReportList(reports)}
                    </TabsContent>
                    <TabsContent value="history" className="mt-4">
                        {isLoading ? <Skeleton className="h-40 w-full" /> : renderReportList(reports)}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
