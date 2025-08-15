
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserById, type UserProfile, getStudentDetails } from '@/services/userService';
import type { Report } from '@/services/reportsService';
import type { InternshipProfile } from '@/services/internshipProfileService';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Briefcase, Calendar, Mail, Phone, User as UserIcon, Building2, Clock } from 'lucide-react';
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
import { format } from 'date-fns';

type StudentDetails = {
    student: UserProfile;
    profile: InternshipProfile | null;
    reports: Report[];
};

function StudentDetailSkeleton() {
    return (
         <div className="space-y-6">
             <div className="flex items-center gap-4">
                 <Skeleton className="h-9 w-9 rounded-full" />
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

export default function StudentDetailPage({ params }: { params: { studentId: string } }) {
    const [details, setDetails] = useState<StudentDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const studentDetails = await getStudentDetails(params.studentId);
                if (!studentDetails) {
                    throw new Error("Student not found.");
                }
                setDetails(studentDetails);
            } catch (e: any) {
                console.error("Failed to fetch student details:", e);
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [params.studentId]);

    const getStatusVariant = (status: Report['status']) => {
        switch (status) {
            case 'Approved': return 'default';
            case 'Pending': return 'secondary';
            case 'Rejected': return 'destructive';
            default: return 'outline';
        }
    };

    if (isLoading) {
        return <StudentDetailSkeleton />
    }

    if (error || !details) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Student Not Found</CardTitle>
                    <CardDescription>{error || "The requested student could not be found."}</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild variant="outline" className="mt-4">
                        <Link href="/admin/students"><ArrowLeft className="mr-2 h-4 w-4" />Back to Students</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const { student, profile, reports } = details;

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
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span>{student.departmentName}, {student.facultyName}</span>
                        </div>
                         <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Joined on: {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>
                
                <div className="lg:col-span-2 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Internship Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            {profile ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                                        <span>Works at <span className="font-semibold">{profile.companyName}</span></span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                                        <span>Supervisor: <span className="font-semibold">{profile.supervisorName}</span> ({profile.supervisorEmail})</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span>Duration: {format(new Date(profile.startDate), 'PPP')} - {format(new Date(profile.endDate), 'PPP')}</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground">Student has not set up their internship profile yet.</p>
                            )}
                        </CardContent>
                     </Card>
                      <Card>
                        <CardHeader>
                            <CardTitle>Supervising Lecturer</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            {student.assignedLecturerName ? (
                                 <div className="flex items-center gap-3">
                                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-semibold">{student.assignedLecturerName}</span>
                                </div>
                            ) : (
                                 <p className="text-muted-foreground">No supervising lecturer has been assigned yet.</p>
                            )}
                        </CardContent>
                     </Card>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Daily Reports</CardTitle>
                    <CardDescription>A complete log of all submitted daily reports by the student.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Supervisor Comment</TableHead>
                                <TableHead>Lecturer Comment</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.length > 0 ? (
                                reports.map(report => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">{report.reportDate.toLocaleDateString()}</TableCell>
                                    <TableCell><Badge variant={getStatusVariant(report.status)}>{report.status}</Badge></TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-xs">{report.supervisorComment || 'None'}</TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-xs">{report.lecturerComment || 'None'}</TableCell>
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
    );
}
