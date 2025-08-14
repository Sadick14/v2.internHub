
'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { createInvite, getPendingInvites, type Invite } from '@/services/invitesService';
import { getFaculties, getDepartments, type Faculty, type Department } from '@/services/universityService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type InviteFormState = {
    firstName: string;
    lastName: string;
    indexNumber: string;
    email: string;
    facultyId: string;
    departmentId: string;
    programOfStudy: string;
}

export default function InviteStudentPage() {
    const { toast } = useToast();
    const [formData, setFormData] = useState<InviteFormState>({
        firstName: '',
        lastName: '',
        indexNumber: '',
        email: '',
        facultyId: '',
        departmentId: '',
        programOfStudy: '',
    });
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingInvites, setIsFetchingInvites] = useState(true);

    async function fetchPageData() {
        const [facultiesData, departmentsData, invitesData] = await Promise.all([
            getFaculties(),
            getDepartments(),
            getPendingInvites()
        ]);
        setFaculties(facultiesData);
        setDepartments(departmentsData);
        setPendingInvites(invitesData);
        setIsFetchingInvites(false);
    }
    
    useEffect(() => {
        fetchPageData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'facultyId') {
            setFormData(prev => ({ ...prev, departmentId: '' }));
        }
    };
    
    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createInvite({ ...formData, role: 'student' });
            toast({
                title: "Invite Sent",
                description: `An invitation has been sent to ${formData.email}.`,
            });
            // Reset form and refresh pending invites
            setFormData({
                firstName: '', lastName: '', indexNumber: '', email: '',
                facultyId: '', departmentId: '', programOfStudy: '',
            });
            setIsFetchingInvites(true);
            const invites = await getPendingInvites();
            setPendingInvites(invites);
            setIsFetchingInvites(false);
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

    const handleDownloadTemplate = () => {
        const headers = "firstName,lastName,indexNumber,email,facultyId,departmentId,programOfStudy";
        const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "student_invite_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
            title: "Template Downloaded",
            description: "A CSV template has been downloaded.",
        });
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Invite Students</CardTitle>
                <CardDescription>Send invitations to new students to join the platform, either individually or in bulk.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="single">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="single">Single Invite</TabsTrigger>
                        <TabsTrigger value="bulk">Bulk Invite (CSV)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="single">
                        <form onSubmit={handleSendInvite} className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" name="firstName" required value={formData.firstName} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" name="lastName" required value={formData.lastName} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="indexNumber">Index Number</Label>
                                    <Input id="indexNumber" name="indexNumber" required value={formData.indexNumber} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">School Email</Label>
                                    <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="facultyId">Faculty</Label>
                                    <Select name="facultyId" value={formData.facultyId} onValueChange={(v) => handleSelectChange('facultyId', v)} required>
                                        <SelectTrigger><SelectValue placeholder="Select a faculty" /></SelectTrigger>
                                        <SelectContent>{faculties.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="departmentId">Department</Label>
                                    <Select name="departmentId" value={formData.departmentId} onValueChange={(v) => handleSelectChange('departmentId', v)} required disabled={!formData.facultyId}>
                                        <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
                                        <SelectContent>{departments.filter(d => d.facultyId === formData.facultyId).map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="programOfStudy">Program of Study</Label>
                                    <Input id="programOfStudy" name="programOfStudy" required value={formData.programOfStudy} onChange={handleInputChange} />
                                </div>
                            </div>
                            <Button type="submit" disabled={isLoading}>{isLoading ? 'Sending...' : 'Send Invite'}</Button>
                        </form>
                    </TabsContent>
                    <TabsContent value="bulk">
                        <div className="space-y-4 pt-4">
                            <Card className="bg-muted/40">
                                <CardContent className="pt-6">
                                     <div className="space-y-2 text-center">
                                        <Label htmlFor="csv-upload" className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                            <span className="text-primary font-medium">Click to upload a file</span>
                                            <span className="text-muted-foreground text-sm">or drag and drop your CSV here</span>
                                        </Label>
                                        <Input id="csv-upload" type="file" accept=".csv" className="hidden" />
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="flex items-center gap-4">
                                <Button>Upload & Send Invites</Button>
                                <Button variant="outline" onClick={handleDownloadTemplate}><FileDown className="mr-2 h-4 w-4" /> Download Template</Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
                
                <div className="mt-8">
                     <h3 className="text-lg font-headline mb-2">Pending Invitations</h3>
                     <Card>
                        <CardContent className="pt-6">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Invited On</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isFetchingInvites ? (
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : pendingInvites.length > 0 ? (
                                        pendingInvites.map((invite) => (
                                            <TableRow key={invite.id}>
                                                <TableCell className="font-medium">{invite.email}</TableCell>
                                                <TableCell>{invite.firstName} {invite.lastName}</TableCell>
                                                <TableCell>{departments.find(d => d.id === invite.departmentId)?.name || 'N/A'}</TableCell>
                                                <TableCell>{invite.createdAt?.toLocaleDateString() || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                                No pending invitations.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                     </Card>
                </div>
            </CardContent>
        </Card>
    );
}
