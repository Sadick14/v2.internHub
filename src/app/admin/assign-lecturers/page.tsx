
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllUsers, assignLecturerToStudent, type UserProfile } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function AssignLecturersPage() {
    const [students, setStudents] = useState<UserProfile[]>([]);
    const [lecturers, setLecturers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
    const [selectedLecturerId, setSelectedLecturerId] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    async function fetchUsers() {
        setIsLoading(true);
        try {
            const allUsers = await getAllUsers();
            // Show all active students
            setStudents(allUsers.filter(u => u.role === 'student' && u.status === 'active'));
            // Lecturers who are active
            setLecturers(allUsers.filter(u => u.role === 'lecturer' && u.status === 'active'));
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch users.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const openAssignDialog = (student: UserProfile) => {
        setSelectedStudent(student);
        // Pre-select the current lecturer if one is assigned
        setSelectedLecturerId(student.lecturerId || '');
        setIsDialogOpen(true);
    };

    const handleAssignLecturer = async () => {
        if (!selectedStudent || !selectedLecturerId) {
            toast({ title: 'Error', description: 'Please select a student and a lecturer.', variant: 'destructive' });
            return;
        }

        const isReassigning = !!selectedStudent.lecturerId;
        setIsAssigning(true);
        try {
            await assignLecturerToStudent(selectedStudent.firestoreId, selectedLecturerId);
            toast({
                title: 'Success',
                description: `${isReassigning ? 'Re-assigned' : 'Assigned'} lecturer to ${selectedStudent.fullName}.`
            });
            setIsDialogOpen(false);
            // Refresh the list of students
            fetchUsers();
        } catch (error: any) {
            toast({ title: 'Error', description: `Failed to assign lecturer: ${error.message}`, variant: 'destructive' });
        } finally {
            setIsAssigning(false);
        }
    };

    const getLecturersForDepartment = (departmentId?: string) => {
        if (!departmentId) return [];
        return lecturers.filter(l => l.departmentId === departmentId);
    }
    
    const StudentCard = ({ student }: { student: UserProfile }) => (
         <Card>
            <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-medium">{student.fullName}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                         <div className="text-sm text-muted-foreground mt-2">
                           <p><strong>Department:</strong> {student.departmentName || 'N/A'}</p>
                        </div>
                    </div>
                    <Button onClick={() => openAssignDialog(student)} size="sm" variant={student.lecturerId ? 'outline' : 'default'}>
                        {student.lecturerId ? 'Re-assign' : 'Assign'}
                    </Button>
                </div>
                 <div className="mt-4">
                     {student.assignedLecturerName ? (
                        <div className="flex items-center">
                            <Badge variant="secondary">{student.assignedLecturerName}</Badge>
                        </div>
                    ) : (
                        <Badge variant="outline">Unassigned</Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Assign Lecturers</CardTitle>
                    <CardDescription>Assign or re-assign supervising lecturers to students for the active internship term.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Mobile View */}
                    <div className="md:hidden">
                         {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-28 w-full" />
                                <Skeleton className="h-28 w-full" />
                                <Skeleton className="h-28 w-full" />
                            </div>
                        ) : students.length > 0 ? (
                            <div className="space-y-4">
                                {students.map((student) => (
                                    <StudentCard key={student.uid} student={student} />
                                ))}
                            </div>
                        ) : (
                           <div className="text-center py-10 text-muted-foreground">
                                No active students found.
                           </div>
                        )}
                    </div>
                    {/* Desktop View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Assigned Lecturer</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-9 w-28 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : students.length > 0 ? (
                                    students.map((student) => (
                                        <TableRow key={student.uid}>
                                            <TableCell>
                                                <div className="font-medium">{student.fullName}</div>
                                                <div className="text-sm text-muted-foreground">{student.email}</div>
                                            </TableCell>
                                            <TableCell>{student.departmentName || 'N/A'}</TableCell>
                                            <TableCell>
                                                {student.assignedLecturerName ? (
                                                    <div className="flex items-center">
                                                        <Badge variant="secondary">{student.assignedLecturerName}</Badge>
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline">Unassigned</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button onClick={() => openAssignDialog(student)} variant={student.lecturerId ? 'outline' : 'default'}>
                                                    {student.lecturerId ? 'Re-assign' : 'Assign Lecturer'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No active students found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Lecturer to {selectedStudent?.fullName}</DialogTitle>
                        <DialogDescription>
                            Select a lecturer from the student's department ({selectedStudent?.departmentName}) to act as their internal supervisor.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select onValueChange={setSelectedLecturerId} value={selectedLecturerId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a lecturer" />
                            </SelectTrigger>
                            <SelectContent>
                                {getLecturersForDepartment(selectedStudent?.departmentId).length > 0 ? (
                                    getLecturersForDepartment(selectedStudent?.departmentId).map(lecturer => (
                                        <SelectItem key={lecturer.uid} value={lecturer.uid}>{lecturer.fullName}</SelectItem>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">No available lecturers in this department.</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssignLecturer} disabled={isAssigning || !selectedLecturerId}>
                            {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
