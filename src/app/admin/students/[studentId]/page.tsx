
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserById, type UserProfile } from '@/services/userService';
import { getReportsByStudentId, type Report } from '@/services/reportsService';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Briefcase, Calendar, Mail, Phone, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function StudentDetailPage({ params }: { params: { studentId: string } }) {
    const [student, setStudent] = useState<UserProfile | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const studentData = await getUserById(params.studentId);
            setStudent(studentData);
            if (studentData) {
                const reportsData = await getReportsByStudentId(params.studentId);
                setReports(reportsData);
            }
            setIsLoading(false);
        }
        fetchData();
    }, [params.studentId]);

    if (isLoading) {
        return <StudentDetailSkeleton />
    }

    if (!student) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Student Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The requested student could not be found.</p>
                     <Button asChild variant="outline" className="mt-4">
                        <Link href="/admin/students"><ArrowLeft className="mr-2 h-4 w-4" />Back to Students</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const getStatusVariant = (status: Report['status']) => {
        switch (status) {
            case 'Approved': return 'default';
            case 'Pending': return 'secondary';
            case 'Rejected': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <Button asChild variant="outline" size="icon">
                    <Link href="/admin/students"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <h1 className="text-2xl font-bold font-headline">Student Details</h1>
            </div>
             <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader className="items-center text-center">
                        <Avatar className="w-24 h-24 mb-4">
                            <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="person portrait" />
                            <AvatarFallback>{student.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="font-headline">{student.fullName}</CardTitle>
                        <CardDescription>{student.programOfStudy || 'Program not set'}</CardDescription>
                         <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="mt-2 capitalize">{student.status}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-center gap-3 text-sm">
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                            <span>{student.indexNumber || 'No Index Number'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <a href={`mailto:${student.email}`} className="text-primary hover:underline">{student.email}</a>
                        </div>
                         <div className="flex items-center gap-3 text-sm">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                            <span>{student.departmentName}, {student.facultyName}</span>
                        </div>
                         <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Joined on: {student.createdAt?.toLocaleDateString() || 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>
                
                <div className="lg:col-span-2 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Internship Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Company, supervisor, and progress details will be shown here.</p>
                        </CardContent>
                     </Card>
                      <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">A timeline of recent student activities will appear here.</p>
                        </CardContent>
                     </Card>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Daily Reports</CardTitle>
                    <CardDescription>A complete log of all submitted daily reports.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Lecturer Comment</TableHead>
                                <TableHead>Supervisor Comment</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.length > 0 ? (
                                reports.map(report => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">{report.reportDate.toLocaleDateString()}</TableCell>
                                    <TableCell><Badge variant={getStatusVariant(report.status)}>{report.status}</Badge></TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-xs">{report.lecturerComment || 'None'}</TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-xs">{report.supervisorComment || 'None'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">View Report</Button>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        This student has not submitted any reports yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

function StudentDetailSkeleton() {
    return (
         <div className="space-y-6">
             <div className="flex items-center gap-4">
                 <Skeleton className="h-9 w-9" />
                 <Skeleton className="h-7 w-48" />
            </div>
             <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader className="items-center text-center">
                        <Skeleton className="w-24 h-24 rounded-full mb-4" />
                        <Skeleton className="h-7 w-40 mb-2" />
                        <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                    </CardContent>
                </Card>
                <div className="lg:col-span-2 space-y-6">
                     <Card>
                        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                        <CardContent><Skeleton className="h-5 w-3/4" /></CardContent>
                     </Card>
                      <Card>
                        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                        <CardContent><Skeleton className="h-5 w-3/4" /></CardContent>
                     </Card>
                </div>
            </div>
             <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-5 w-64" />
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
