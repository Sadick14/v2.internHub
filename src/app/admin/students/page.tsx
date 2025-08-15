
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


    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Students</CardTitle>
                <CardDescription>A list of all students in the internship program.</CardDescription>
            </CardHeader>
            <CardContent>
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
                                <TableRow key={student.uid}>
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
            </CardContent>
        </Card>
    )
}
