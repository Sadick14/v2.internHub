
'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { createInvite } from '@/services/invitesService';
import { getFaculties, getDepartments, type Faculty, type Department } from '@/services/universityService';
import type { Role } from '@/hooks/use-role';

export default function InviteStudentPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>('student');
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const facultiesData = await getFaculties();
            setFaculties(facultiesData);
            const departmentsData = await getDepartments();
            setDepartments(departmentsData);
        }
        fetchData();
    }, []);
    
    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createInvite({ email, role, facultyId: selectedFaculty, departmentId: selectedDepartment });
            toast({
                title: "Invite Sent",
                description: `An invitation has been sent to ${email}.`,
            });
            setEmail('');
        } catch (error: any) {
            toast({
                title: "Error",
                description: `Failed to send invite: ${error.message}`,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Invite User</CardTitle>
                <CardDescription>Send an invitation to a new user to join the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSendInvite} className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="new.user@university.edu"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="lecturer">Lecturer</SelectItem>
                                <SelectItem value="hod">Head of Department</SelectItem>
                                <SelectItem value="supervisor">Company Supervisor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {(role === 'student' || role === 'lecturer' || role === 'hod') && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="faculty">Faculty</Label>
                                 <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                                    <SelectTrigger id="faculty">
                                        <SelectValue placeholder="Select a faculty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {faculties.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                 <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled={!selectedFaculty}>
                                    <SelectTrigger id="department">
                                        <SelectValue placeholder="Select a department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.filter(d => d.facultyId === selectedFaculty).map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}


                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Sending Invite...' : 'Send Invite'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
