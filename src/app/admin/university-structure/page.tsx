
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, PlusCircle, Upload } from "lucide-react";
import { getFaculties, getDepartments, createFaculty, createDepartment, type Faculty, type Department } from '@/services/universityService';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UniversityStructurePage() {
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddFacultyOpen, setIsAddFacultyOpen] = useState(false);
    const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
    const [newFacultyName, setNewFacultyName] = useState('');
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [selectedFacultyId, setSelectedFacultyId] = useState('');
    const { toast } = useToast();

    async function fetchData() {
        setIsLoading(true);
        const [facultiesData, departmentsData] = await Promise.all([
            getFaculties(),
            getDepartments()
        ]);
        setFaculties(facultiesData);
        setDepartments(departmentsData);
        setIsLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    const getDepartmentsForFaculty = (facultyId: string) => {
        return departments.filter(dep => dep.facultyId === facultyId);
    }

    const handleAddFaculty = async () => {
        if (!newFacultyName) return;
        try {
            await createFaculty({ name: newFacultyName });
            toast({ title: "Success", description: "Faculty created successfully." });
            setNewFacultyName('');
            setIsAddFacultyOpen(false);
            fetchData(); // Refresh data
        } catch (error: any) {
            toast({ title: "Error", description: `Failed to create faculty: ${error.message}`, variant: 'destructive' });
        }
    };

    const handleAddDepartment = async () => {
        if (!newDepartmentName || !selectedFacultyId) return;
        try {
            await createDepartment({ name: newDepartmentName, facultyId: selectedFacultyId });
            toast({ title: "Success", description: "Department created successfully." });
            setNewDepartmentName('');
            setSelectedFacultyId('');
            setIsAddDeptOpen(false);
            fetchData(); // Refresh data
        } catch (error: any) {
            toast({ title: "Error", description: `Failed to create department: ${error.message}`, variant: 'destructive' });
        }
    };
    
    const handleDownloadTemplate = () => {
        const headers = "type,name,facultyId(for_department)";
        const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "university_structure_template.csv");
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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline">University Structure</CardTitle>
                            <CardDescription>Define and manage faculties and their associated departments.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                             <Dialog open={isAddDeptOpen} onOpenChange={setIsAddDeptOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Department
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Department</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="departmentName">Department Name</Label>
                                            <Input id="departmentName" value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="faculty">Faculty</Label>
                                            <Select value={selectedFacultyId} onValueChange={setSelectedFacultyId}>
                                                <SelectTrigger><SelectValue placeholder="Select a faculty" /></SelectTrigger>
                                                <SelectContent>{faculties.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddDeptOpen(false)}>Cancel</Button>
                                        <Button onClick={handleAddDepartment}>Save Department</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                             <Dialog open={isAddFacultyOpen} onOpenChange={setIsAddFacultyOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Faculty
                                    </Button>
                                </DialogTrigger>
                                 <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Faculty</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="facultyName">Faculty Name</Label>
                                            <Input id="facultyName" value={newFacultyName} onChange={(e) => setNewFacultyName(e.target.value)} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddFacultyOpen(false)}>Cancel</Button>
                                        <Button onClick={handleAddFaculty}>Save Faculty</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full">
                            {faculties.map(faculty => (
                                <AccordionItem key={faculty.id} value={faculty.id}>
                                    <AccordionTrigger className="text-lg font-medium hover:no-underline">
                                        {faculty.name}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {getDepartmentsForFaculty(faculty.id).length > 0 ? (
                                            <ul className="list-disc pl-5 space-y-2 pt-2">
                                                {getDepartmentsForFaculty(faculty.id).map(dept => (
                                                    <li key={dept.id} className="text-muted-foreground">{dept.name}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-muted-foreground pl-5 pt-2">No departments assigned to this faculty yet.</p>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Bulk Import</CardTitle>
                    <CardDescription>
                        Quickly add multiple faculties and departments by uploading a CSV file.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        <Button>Upload & Import</Button>
                        <Button variant="outline" onClick={handleDownloadTemplate}><FileDown className="mr-2 h-4 w-4" /> Download Template</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
