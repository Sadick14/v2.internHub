
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { useRole } from '@/hooks/use-role';
import { getReportsByStudentId, type Report } from '@/services/reportsService';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function DailyReportHistoryPage() {
  const { user } = useRole();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      if (!user?.uid) return;
      setIsLoading(true);
      const reportsData = await getReportsByStudentId(user.uid);
      setReports(reportsData);
      setIsLoading(false);
    }
    fetchReports();
  }, [user]);


  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'Approved': return 'default';
      case 'Pending': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">My Report History</CardTitle>
        <CardDescription>A log of all your submitted daily reports and their statuses.</CardDescription>
      </CardHeader>
      <CardContent>
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
                            <TableCell><Badge variant={getStatusVariant(report.status)}>{report.status}</Badge></TableCell>
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
      </CardContent>
    </Card>
  )
}
