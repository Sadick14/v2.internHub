
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
import { getAllUsers, type UserProfile } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

export default function StudentsPage() {
    const [students, setStudents] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStudents() {
            setIsLoading(true);
            const allUsers = await getAllUsers();
            setStudents(allUsers.filter(user => user.role === 'student'));
            setIsLoading(false);
        }
        fetchStudents();
    }, []);

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
                        <Link href={`/admin/students/${student.uid}`} className="font-medium hover:underline text-primary">
                            {student.fullName}
                        </Link>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                        <div className="text-sm text-muted-foreground mt-2">
                           <p><strong>Department:</strong> {student.departmentName || 'N/A'}</p>
                           <p><strong>Lecturer:</strong> {student.assignedLecturerName || 'Unassigned'}</p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/students/${student.uid}`}>
                                    View Details
                                </Link>
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
                <CardTitle className="font-headline">Students</CardTitle>
                <CardDescription>A list of all students in the internship program.</CardDescription>
            </CardHeader>
            <CardContent>
                 {/* Mobile View */}
                <div className="md:hidden">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ) : students.length > 0 ? (
                        <div className="space-y-4">
                            {students.map((student) => <StudentCard key={student.firestoreId} student={student} />)}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-10">No students found.</p>
                    )}
                </div>
                 {/* Desktop View */}
                 <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Assigned Lecturer</TableHead>
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
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-9 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : students.length > 0 ? (
                                students.map((student) => (
                                    <TableRow key={student.firestoreId}>
                                        <TableCell className="font-medium">
                                            <Link href={`/admin/students/${student.uid}`} className="hover:underline text-primary">
                                                {student.fullName}
                                            </Link>
                                            <div className="text-sm text-muted-foreground">{student.email}</div>
                                        </TableCell>
                                        <TableCell>{student.departmentName || 'N/A'}</TableCell>
                                        <TableCell>{student.assignedLecturerName || 'Unassigned'}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(student.status)}>{student.status || 'inactive'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/admin/students/${student.uid}`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No students found.
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

    