
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
import { getStudentsByLecturer, type UserProfile } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRole } from '@/hooks/use-role';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export default function LecturerStudentsPage() {
    const { user } = useRole();
    const [students, setStudents] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStudents() {
            if (!user?.uid) return;
            setIsLoading(true);
            const studentData = await getStudentsByLecturer(user.uid);
            setStudents(studentData);
            setIsLoading(false);
        }
        fetchStudents();
    }, [user]);

     const getStatusVariant = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'default';
            case 'inactive':
                return 'secondary';
            case 'pending':
                return 'outline';
            default:
                return 'destructive';
        }
    }

    const StudentCard = ({ student }: { student: UserProfile }) => (
        <Card>
            <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                    <div>
                        <Link href={`/lecturer/students/${student.uid}`} className="font-medium hover:underline text-primary">
                            {student.fullName}
                        </Link>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                        <div className="text-sm text-muted-foreground mt-2">
                           <p><strong>Department:</strong> {student.departmentName || 'N/A'}</p>
                        </div>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                                <Link href={`/lecturer/students/${student.uid}`}>View Details</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="mt-4">
                    <Badge variant={getStatusVariant(student.status)}>{student.status || 'inactive'}</Badge>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">My Students</CardTitle>
                <CardDescription>A list of all students assigned to you for supervision.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                     {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
                    ) : students.length > 0 ? (
                        students.map((student) => <StudentCard key={student.uid} student={student} />)
                    ) : (
                        <p className="text-center text-muted-foreground py-10">No students are currently assigned to you.</p>
                    )}
                </div>
                {/* Desktop View */}
                 <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-9 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : students.length > 0 ? (
                                students.map((student) => (
                                    <TableRow key={student.uid}>
                                        <TableCell className="font-medium">
                                            <Link href={`/lecturer/students/${student.uid}`} className="hover:underline text-primary">
                                                {student.fullName}
                                            </Link>
                                            <div className="text-sm text-muted-foreground">{student.email}</div>
                                        </TableCell>
                                        <TableCell>{student.departmentName || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(student.status)}>{student.status || 'inactive'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/lecturer/students/${student.uid}`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No students are currently assigned to you.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
        </Card>
    )
}

    