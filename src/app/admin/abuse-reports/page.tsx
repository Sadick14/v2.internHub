
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useRole } from '@/hooks/use-role';
import { getAllAbuseReports, updateAbuseReportStatus, type AbuseReport } from '@/services/abuseReportsService';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminAbuseReportsPage() {
    const { toast } = useToast();
    const [reports, setReports] = useState<AbuseReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('new');

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const allReports = await getAllAbuseReports();
            setReports(allReports);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch abuse reports.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleStatusChange = async (reportId: string, status: AbuseReport['status']) => {
        try {
            await updateAbuseReportStatus(reportId, status);
            toast({ title: 'Status Updated', description: `Report status has been changed to ${status}.` });
            fetchReports();
        } catch (error: any) {
            toast({ title: 'Error', description: `Failed to update status: ${error.message}`, variant: 'destructive' });
        }
    };

    const getStatusVariant = (status: AbuseReport['status']) => {
        switch (status) {
            case 'new': return 'destructive';
            case 'under_review': return 'secondary';
            case 'resolved': return 'default';
        }
    };

    const filteredReports = reports.filter(report => {
        if (activeTab === 'new') return report.status === 'new';
        if (activeTab === 'reviewing') return report.status === 'under_review';
        if (activeTab === 'resolved') return report.status === 'resolved';
        return false;
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">System-Wide Abuse Reports</CardTitle>
                <CardDescription>Review and manage all confidential reports from across the system. Please handle with care and urgency.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="new">New</TabsTrigger>
                        <TabsTrigger value="reviewing">Under Review</TabsTrigger>
                        <TabsTrigger value="resolved">Resolved</TabsTrigger>
                    </TabsList>
                    <TabsContent value={activeTab} className="mt-4">
                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        ) : filteredReports.length > 0 ? (
                            <Accordion type="multiple" className="w-full space-y-4">
                                {filteredReports.map(report => (
                                    <AccordionItem key={report.id} value={report.id} className="border rounded-lg px-4 bg-muted/20">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex justify-between w-full items-center pr-4">
                                                <div>
                                                    <p className="font-semibold">{report.studentName}</p>
                                                    <p className="text-sm text-muted-foreground">{format(report.reportedAt, 'PPP p')}</p>
                                                </div>
                                                <Badge variant={getStatusVariant(report.status)} className="capitalize">{report.status.replace('_', ' ')}</Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-2">
                                            <div>
                                                <h4 className="font-semibold text-sm">Report Details:</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap p-3 bg-background rounded-md">{report.message}</p>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                {report.status === 'new' && (
                                                    <Button variant="secondary" size="sm" onClick={() => handleStatusChange(report.id, 'under_review')}>Mark as Under Review</Button>
                                                )}
                                                {report.status === 'under_review' && (
                                                    <Button size="sm" onClick={() => handleStatusChange(report.id, 'resolved')}>Mark as Resolved</Button>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                <p>No reports in this category.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
