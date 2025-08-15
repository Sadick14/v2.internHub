
'use client';
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  Users,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useRole } from '@/hooks/use-role';
import { useEffect, useState } from 'react';
import { getStudentsByLecturer, type UserProfile } from '@/services/userService';
import { getReportsByLecturer } from '@/services/reportsService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function LecturerDashboardPage() {
  const { user, loading } = useRole();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        if (!user?.uid) return;
        setDataLoading(true);
        const [studentsData, reportsData] = await Promise.all([
            getStudentsByLecturer(user.uid),
            getReportsByLecturer(user.uid, ['Pending'])
        ]);
        setStudents(studentsData);
        setPendingReportsCount(reportsData.length);
        setDataLoading(false);
    }
    if (user) {
        fetchData();
    }
  }, [user]);

  if(loading || dataLoading) {
    return (
         <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Lecturer Dashboard</CardTitle>
                <CardDescription>An overview of your assigned students and their recent activities.</CardDescription>
            </CardHeader>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground">under your supervision</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reports to Review</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-accent">+{pendingReportsCount}</div>
                <Link href="/lecturer/reports" className="text-xs text-muted-foreground hover:underline">
                    pending your feedback
                </Link>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Activity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-primary">Active</div>
                <p className="text-xs text-muted-foreground">
                    Students are actively reporting
                </p>
            </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader className="flex items-center">
            <CardTitle className="font-headline">My Students</CardTitle>
            <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/lecturer/students">
                View All
                <ArrowUpRight className="h-4 w-4" />
                </Link>
            </Button>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {students.slice(0, 5).map(student => (
                    <TableRow key={student.uid}>
                        <TableCell>
                            <Link href={`/lecturer/students/${student.uid}`} className="font-medium hover:underline text-primary">{student.fullName}</Link>
                            <div className="text-sm text-muted-foreground">{student.email}</div>
                        </TableCell>
                        <TableCell>{student.departmentName || 'N/A'}</TableCell>
                        <TableCell>Company Placeholder</TableCell>
                        <TableCell>
                            <Badge variant={student.status === 'active' ? 'default' : 'outline'}>{student.status}</Badge>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </div>
  )
}
