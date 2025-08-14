
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, FileText, MessageSquare, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Report } from '@/services/reportsService';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

async function getReportById(reportId: string): Promise<Report | null> {
    const reportRef = doc(db, 'reports', reportId);
    const reportSnap = await getDoc(reportRef);

    if (!reportSnap.exists()) {
        return null;
    }

    const data = reportSnap.data();
    return {
        id: reportSnap.id,
        ...data,
        reportDate: data.reportDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt?.toDate(),
    } as Report;
}

export default function ReportDetailPage({ params }: { params: { reportId: string } }) {
    const [report, setReport] = useState<Report | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchReport() {
            setIsLoading(true);
            const reportData = await getReportById(params.reportId);
            setReport(reportData);
            setIsLoading(false);
        }
        fetchReport();
    }, [params.reportId]);

    const getStatusVariant = (status: Report['status']) => {
        switch (status) {
            case 'Approved': return 'default';
            case 'Pending': return 'secondary';
            case 'Rejected': return 'destructive';
            default: return 'outline';
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!report) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Report Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The requested report could not be found.</p>
                     <Button asChild variant="outline" className="mt-4">
                        <Link href="/student/reports"><ArrowLeft className="mr-2 h-4 w-4" />Back to History</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/student/reports"><ArrowLeft className="mr-2 h-4 w-4" />Back to History</Link>
            </Button>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                             <CardTitle className="font-headline text-2xl">Report for {format(report.reportDate, 'PPP')}</CardTitle>
                             <CardDescription className="flex items-center gap-2 mt-1">
                                <Calendar className="h-4 w-4" />
                                Submitted on {format(report.createdAt, 'PPP')}
                            </CardDescription>
                        </div>
                        <Badge variant={getStatusVariant(report.status)} className="text-base px-3 py-1">{report.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                         <h3 className="font-semibold text-lg flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Work Accomplished</h3>
                         <p className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md">{report.declaredTasks}</p>
                    </div>
                    
                    <Separator />

                    <div className="space-y-3">
                         <h3 className="font-semibold text-lg flex items-center"><Bot className="mr-2 h-5 w-5 text-primary" />AI-Generated Summary</h3>
                         <p className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md">{report.summary}</p>
                    </div>
                    
                    {(report.lecturerComment || report.supervisorComment) && <Separator />}

                    {report.lecturerComment && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary" />Lecturer's Feedback</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md">{report.lecturerComment}</p>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    )
}
