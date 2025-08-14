
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, PlusCircle, Upload, Edit, Trash2 } from "lucide-react";
import { 
    getFaculties, 
    getDepartments, 
    createFaculty, 
    createDepartment, 
    updateFaculty,
    deleteFaculty,
    updateDepartment,
    deleteDepartment,
    type Faculty, 
    type Department 
} from '@/services/universityService';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function UniversityStructurePage() {
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // State for Add/Edit dialogs
    const [isFacultyDialogOpen, setIsFacultyDialogOpen] = useState(false);
    const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentFaculty, setCurrentFaculty] = useState<Faculty | null>(null);
    const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
    const [newFacultyName, setNewFacultyName] = useState('');
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [selectedFacultyId, setSelectedFacultyId] = useState('');

    const { toast } = useToast();

    async function fetchData() {
        setIsLoading(true);
        try {
            const [facultiesData, departmentsData] = await Promise.all([
                getFaculties(),
                getDepartments()
            ]);
            setFaculties(facultiesData);
            setDepartments(departmentsData);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch university data.", variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const getDepartmentsForFaculty = (facultyId: string) => {
        return departments.filter(dep => dep.facultyId === facultyId);
    }
    
    // Dialog Open/Close handlers
    const openAddFacultyDialog = () => {
        setIsEditMode(false);
        setCurrentFaculty(null);
        setNewFacultyName('');
        setIsFacultyDialogOpen(true);
    };

    const openEditFacultyDialog = (faculty: Faculty) => {
        setIsEditMode(true);
        setCurrentFaculty(faculty);
        setNewFacultyName(faculty.name);
        setIsFacultyDialogOpen(true);
    };

    const openAddDepartmentDialog = (facultyId: string) => {
        setIsEditMode(false);
        setCurrentDepartment(null);
        setNewDepartmentName('');
        setSelectedFacultyId(facultyId);
        setIsDeptDialogOpen(true);
    };
    
    const openEditDepartmentDialog = (department: Department) => {
        setIsEditMode(true);
        setCurrentDepartment(department);
        setNewDepartmentName(department.name);
        setSelectedFacultyId(department.facultyId);
        setIsDeptDialogOpen(true);
    };


    const handleFacultySubmit = async () => {
        if (!newFacultyName) return;
        try {
            if (isEditMode && currentFaculty) {
                await updateFaculty(currentFaculty.id, { name: newFacultyName });
                toast({ title: "Success", description: "Faculty updated successfully." });
            } else {
                await createFaculty({ name: newFacultyName });
                toast({ title: "Success", description: "Faculty created successfully." });
            }
            setIsFacultyDialogOpen(false);
            fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: `Failed to save faculty: ${error.message}`, variant: 'destructive' });
        }
    };
    
    const handleDepartmentSubmit = async () => {
        if (!newDepartmentName || !selectedFacultyId) return;
        try {
            if (isEditMode && currentDepartment) {
                await updateDepartment(currentDepartment.id, { name: newDepartmentName, facultyId: selectedFacultyId });
                toast({ title: "Success", description: "Department updated successfully." });
            } else {
                await createDepartment({ name: newDepartmentName, facultyId: selectedFacultyId });
                toast({ title: "Success", description: "Department created successfully." });
            }
            setIsDeptDialogOpen(false);
            fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: `Failed to save department: ${error.message}`, variant: 'destructive' });
        }
    };

    const handleFacultyDelete = async (facultyId: string) => {
        try {
            await deleteFaculty(facultyId);
            toast({ title: "Success", description: "Faculty deleted successfully." });
            fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: `Failed to delete faculty: ${error.message}`, variant: 'destructive' });
        }
    }

    const handleDepartmentDelete = async (departmentId: string) => {
         try {
            await deleteDepartment(departmentId);
            toast({ title: "Success", description: "Department deleted successfully." });
            fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: `Failed to delete department: ${error.message}`, variant: 'destructive' });
        }
    }
    
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
                        <Button onClick={openAddFacultyDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Faculty
                        </Button>
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
                                        <div className="flex justify-between items-center w-full">
                                            <span>{faculty.name}</span>
                                            <div className="flex items-center gap-2 mr-2" onClick={(e) => e.stopPropagation()}>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditFacultyDialog(faculty)}><Edit className="h-4 w-4"/></Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the faculty and all associated departments.
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleFacultyDelete(faculty.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="pl-5 space-y-2 pt-2">
                                            {getDepartmentsForFaculty(faculty.id).length > 0 ? (
                                                <ul className="space-y-2">
                                                    {getDepartmentsForFaculty(faculty.id).map(dept => (
                                                        <li key={dept.id} className="flex justify-between items-center text-muted-foreground hover:bg-muted/50 p-2 rounded-md">
                                                            <span>{dept.name}</span>
                                                             <div className="flex items-center gap-2 mr-2">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDepartmentDialog(dept)}><Edit className="h-4 w-4"/></Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action cannot be undone. This will permanently delete the department.
                                                                        </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDepartmentDelete(dept.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-muted-foreground text-center py-4">No departments assigned to this faculty yet.</p>
                                            )}
                                             <Button variant="outline" size="sm" className="mt-4" onClick={() => openAddDepartmentDialog(faculty.id)}>
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Add Department
                                            </Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </CardContent>
            </Card>
            
            {/* ADD/EDIT FACULTY DIALOG */}
             <Dialog open={isFacultyDialogOpen} onOpenChange={setIsFacultyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="facultyName">Faculty Name</Label>
                            <Input id="facultyName" value={newFacultyName} onChange={(e) => setNewFacultyName(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFacultyDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleFacultySubmit}>Save Faculty</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* ADD/EDIT DEPARTMENT DIALOG */}
            <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit Department' : 'Add New Department'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="departmentName">Department Name</Label>
                            <Input id="departmentName" value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="faculty">Faculty</Label>
                            <Select value={selectedFacultyId} onValueChange={setSelectedFacultyId} disabled={isEditMode}>
                                <SelectTrigger><SelectValue placeholder="Select a faculty" /></SelectTrigger>
                                <SelectContent>{faculties.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeptDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleDepartmentSubmit}>Save Department</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                <Label htmlFor="csv-upload-structure" className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <span className="text-primary font-medium">Click to upload a file</span>
                                    <span className="text-muted-foreground text-sm">or drag and drop your CSV here</span>
                                </Label>
                                <Input id="csv-upload-structure" type="file" accept=".csv" className="hidden" />
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
