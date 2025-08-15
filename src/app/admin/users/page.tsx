
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { getAllUsers, updateUser, updateUserStatus, type UserProfile } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Role } from '@/hooks/use-role';
import { getFaculties, getDepartments, type Faculty, type Department } from '@/services/universityService';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function UserManagementPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserProfile & { id?: string } | null>(null);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const { toast } = useToast();

    async function fetchPageData() {
        setIsLoading(true);
        try {
            const [usersData, facultiesData, departmentsData] = await Promise.all([
                getAllUsers(),
                getFaculties(),
                getDepartments()
            ]);
            setUsers(usersData);
            setFaculties(facultiesData);
            setDepartments(departmentsData);
        } catch(e) {
            toast({ title: "Error", description: "Failed to fetch page data.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchPageData();
    }, []);

    const openEditDialog = (user: UserProfile) => {
        setCurrentUser({ ...user });
        setIsEditUserOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!currentUser || !currentUser.uid) return;
        try {
            await updateUser(currentUser.firestoreId, currentUser);
            toast({ title: "Success", description: "User updated successfully." });
            setIsEditUserOpen(false);
            fetchPageData();
        } catch (error: any) {
            toast({ title: "Error", description: `Failed to update user: ${error.message}`, variant: 'destructive' });
        }
    };
    
    const handleResetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
            toast({ title: "Success", description: `Password reset email sent to ${email}.` });
        } catch (error: any) {
             toast({ title: "Error", description: `Failed to send reset email: ${error.message}`, variant: 'destructive' });
        }
    };

    const handleToggleUserStatus = async (user: UserProfile) => {
        if (!user.uid) {
            toast({ title: "Error", description: `User ID is missing. Cannot update status.`, variant: 'destructive' });
            return;
        };
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
         try {
            await updateUserStatus(user.firestoreId, newStatus);
            toast({ title: "Success", description: `User status changed to ${newStatus}.` });
            fetchPageData();
        } catch (error: any) {
             toast({ title: "Error", description: `Failed to update status: ${error.message}`, variant: 'destructive' });
        }
    }
    
    const handleFieldChange = (field: keyof UserProfile, value: string) => {
        if (currentUser) {
            setCurrentUser(prev => ({ ...prev!, [field]: value }));
             if (field === 'facultyId') {
                 setCurrentUser(prev => ({...prev!, departmentId: ''}))
            }
        }
    };

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
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline">User Management</CardTitle>
                            <CardDescription>View, create, edit, and manage all system users.</CardDescription>
                        </div>
                        <Button asChild>
                           <Link href="/admin/invite-user">
                            <PlusCircle className="mr-2 h-4 w-4" />
                                Add New User
                           </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Assigned Lecturer</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.uid}>
                                        <TableCell className="font-medium">
                                            {user.role === 'student' && user.uid ? (
                                                <Link href={`/admin/students/${user.uid}`} className="hover:underline text-primary">
                                                    {user.fullName}
                                                </Link>
                                            ) : (
                                                user.fullName
                                            )}
                                           
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell className="capitalize">{user.role}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(user.status)}>{user.status || 'inactive'}</Badge>
                                        </TableCell>
                                        <TableCell>{user.departmentName || 'N/A'}</TableCell>
                                        <TableCell>{user.assignedLecturerName || 'N/A'}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost" disabled={!user.uid}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                     {user.role === 'student' && user.uid && <DropdownMenuItem asChild><Link href={`/admin/students/${user.uid}`}>View Profile</Link></DropdownMenuItem>}
                                                    <DropdownMenuItem onClick={() => openEditDialog(user)} disabled={user.status === 'pending'}>Edit User</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleResetPassword(user.email)} disabled={user.status === 'pending'}>Reset Password</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <div className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${user.status === 'active' ? 'text-destructive' : ''}`}>
                                                                {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                                            </div>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will {user.status === 'active' ? 'deactivate' : 'activate'} the user account. They will {user.status === 'active' ? 'lose' : 'gain'} access to the system.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleToggleUserStatus(user)}>{user.status === 'active' ? 'Deactivate' : 'Activate'}</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Modify the details for {currentUser?.fullName}.
                        </DialogDescription>
                    </DialogHeader>
                    {currentUser && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="fullName" className="text-right">Full Name</Label>
                                <Input id="fullName" value={currentUser.fullName} onChange={(e) => handleFieldChange('fullName', e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" value={currentUser.email} disabled className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">Role</Label>
                                <Select value={currentUser.role} onValueChange={(v) => handleFieldChange('role', v as Role)}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="lecturer">Lecturer</SelectItem>
                                        <SelectItem value="hod">Head of Department</SelectItem>
                                        <SelectItem value="supervisor">Supervisor</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            { (currentUser.role === 'student' || currentUser.role === 'lecturer' || currentUser.role === 'hod') &&
                             <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="faculty" className="text-right">Faculty</Label>
                                    <Select value={currentUser.facultyId} onValueChange={(v) => handleFieldChange('facultyId', v)}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select a faculty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {faculties.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="department" className="text-right">Department</Label>
                                    <Select value={currentUser.departmentId} onValueChange={(v) => handleFieldChange('departmentId', v)} disabled={!currentUser.facultyId}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select a department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.filter(d => d.facultyId === currentUser.facultyId).map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                             </>
                            }
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateUser}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
