
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
    const [currentFaculty, setCurrentFaculty] = useState<Partial<Faculty> | null>(null);
    const [currentDepartment, setCurrentDepartment] = useState<Partial<Department> | null>(null);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [isBulkUploading, setIsBulkUploading] = useState(false);

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
        setCurrentFaculty({ name: '', code: '' });
        setIsFacultyDialogOpen(true);
    };

    const openEditFacultyDialog = (faculty: Faculty) => {
        setIsEditMode(true);
        setCurrentFaculty(faculty);
        setIsFacultyDialogOpen(true);
    };

    const openAddDepartmentDialog = (facultyId: string) => {
        setIsEditMode(false);
        setCurrentDepartment({ name: '', code: '', facultyId });
        setIsDeptDialogOpen(true);
    };
    
    const openEditDepartmentDialog = (department: Department) => {
        setIsEditMode(true);
        setCurrentDepartment(department);
        setIsDeptDialogOpen(true);
    };


    const handleFacultySubmit = async () => {
        if (!currentFaculty || !currentFaculty.name || !currentFaculty.code) {
             toast({ title: "Error", description: "Faculty Name and Code are required.", variant: 'destructive' });
             return;
        }
        try {
            if (isEditMode && currentFaculty.id) {
                await updateFaculty(currentFaculty.id, { name: currentFaculty.name, code: currentFaculty.code });
                toast({ title: "Success", description: "Faculty updated successfully." });
            } else {
                await createFaculty({ name: currentFaculty.name, code: currentFaculty.code });
                toast({ title: "Success", description: "Faculty created successfully." });
            }
            setIsFacultyDialogOpen(false);
            fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: `Failed to save faculty: ${error.message}`, variant: 'destructive' });
        }
    };
    
    const handleDepartmentSubmit = async () => {
        if (!currentDepartment || !currentDepartment.name || !currentDepartment.code || !currentDepartment.facultyId) {
            toast({ title: "Error", description: "Department Name, Code and Faculty are required.", variant: 'destructive' });
            return;
        }

        try {
            const departmentData = { 
                name: currentDepartment.name, 
                code: currentDepartment.code, 
                facultyId: currentDepartment.facultyId 
            };

            if (isEditMode && currentDepartment.id) {
                await updateDepartment(currentDepartment.id, departmentData);
                toast({ title: "Success", description: "Department updated successfully." });
            } else {
                await createDepartment(departmentData);
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
    
    const parseCsv = (text: string) => {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (!lines.length) return [];
        const headers = lines[0].split(',').map(h => h.trim());
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: Record<string, string> = {};
            headers.forEach((h, idx) => {
                row[h] = values[idx] || '';
            });
            return row;
        });
    };

    const handleBulkUpload = async () => {
        if (!csvFile) {
            toast({ title: "No file", description: "Please choose a CSV file first.", variant: "destructive" });
            return;
        }
        setIsBulkUploading(true);
        try {
            const text = await csvFile.text();
            const rows = parseCsv(text);
            if (!rows.length) {
                toast({ title: "Empty file", description: "No rows found in the CSV.", variant: "destructive" });
                return;
            }

            let facultiesCreated = 0;
            let departmentsCreated = 0;
            const failures: string[] = [];
            const createdFacultyIds = new Map<string, string>();

            // First pass: Create faculties
            for (const [idx, row] of rows.entries()) {
                const rowNum = idx + 2;
                if (row.type?.toLowerCase() === 'faculty') {
                    if (!row.name || !row.code) {
                        failures.push(`Row ${rowNum}: Faculty missing name or code`);
                        continue;
                    }
                    try {
                        await createFaculty({ name: row.name, code: row.code });
                        facultiesCreated += 1;
                    } catch (err: any) {
                        failures.push(`Row ${rowNum}: ${err?.message || 'Failed to create faculty'}`);
                    }
                }
            }

            // Refresh faculties to get IDs
            const [updatedFaculties] = await Promise.all([getFaculties()]);
            const facultyByCode = new Map(updatedFaculties.map(f => [f.code.toLowerCase(), f.id]));
            const facultyByName = new Map(updatedFaculties.map(f => [f.name.toLowerCase(), f.id]));

            // Second pass: Create departments
            for (const [idx, row] of rows.entries()) {
                const rowNum = idx + 2;
                if (row.type?.toLowerCase() === 'department') {
                    if (!row.name || !row.code || !row['facultyId(for_department)']) {
                        failures.push(`Row ${rowNum}: Department missing name, code, or facultyId`);
                        continue;
                    }
                    const facultyRef = row['facultyId(for_department)'].toLowerCase();
                    const facultyId = facultyByCode.get(facultyRef) || facultyByName.get(facultyRef);
                    if (!facultyId) {
                        failures.push(`Row ${rowNum}: Faculty "${row['facultyId(for_department)']}" not found`);
                        continue;
                    }
                    try {
                        await createDepartment({ name: row.name, code: row.code, facultyId });
                        departmentsCreated += 1;
                    } catch (err: any) {
                        failures.push(`Row ${rowNum}: ${err?.message || 'Failed to create department'}`);
                    }
                }
            }

            await fetchData();

            if (failures.length) {
                toast({
                    title: `Imported ${facultiesCreated} faculties, ${departmentsCreated} departments with ${failures.length} errors`,
                    description: failures.slice(0, 3).join(' | ') + (failures.length > 3 ? '...' : ''),
                    variant: 'destructive',
                });
            } else {
                toast({ title: 'Bulk import successful', description: `Created ${facultiesCreated} faculties and ${departmentsCreated} departments.` });
            }
            setCsvFile(null);
        } catch (error: any) {
            toast({ title: 'Error', description: error?.message || 'Failed to process CSV', variant: 'destructive' });
        } finally {
            setIsBulkUploading(false);
        }
    };

    const handleDownloadTemplate = () => {
        let csvContent = "type,name,code,facultyId(for_department)\n";
        csvContent += "\n# INSTRUCTIONS:\n";
        csvContent += "# - type: 'faculty' or 'department'\n";
        csvContent += "# - name: Full name of the faculty or department\n";
        csvContent += "# - code: Short code (e.g., 'FAST', 'COMPSSA')\n";
        csvContent += "# - facultyId(for_department): For departments only, use faculty code or name\n";
        csvContent += "\n# EXAMPLE:\n";
        csvContent += "# faculty,Faculty of Computing,FAST,\n";
        csvContent += "# department,Computer Science,COMPSSA,FAST\n";
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
            description: "A CSV template with examples has been downloaded.",
        });
    };

    const handleDialogInputChange = <T extends Partial<Faculty> | Partial<Department>>(
        field: keyof T, 
        value: string, 
        setter: React.Dispatch<React.SetStateAction<T | null>>
    ) => {
         setter(prev => prev ? { ...prev, [field]: value } : prev);
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
                                    <div className="flex items-center w-full group">
                                        <AccordionTrigger className="text-lg font-medium hover:no-underline flex-1">
                                            <span>{faculty.name} <span className="text-sm font-normal text-muted-foreground">({faculty.code})</span></span>
                                        </AccordionTrigger>
                                        <div className="flex items-center gap-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                    <AccordionContent>
                                        <div className="pl-5 space-y-2 pt-2">
                                            {getDepartmentsForFaculty(faculty.id).length > 0 ? (
                                                <ul className="space-y-2">
                                                    {getDepartmentsForFaculty(faculty.id).map(dept => (
                                                        <li key={dept.id} className="flex justify-between items-center group/dept text-muted-foreground hover:bg-muted/50 p-2 rounded-md -mr-2">
                                                            <span>{dept.name} <span className="text-sm font-normal">({dept.code})</span></span>
                                                             <div className="flex items-center gap-2 opacity-0 group-hover/dept:opacity-100 transition-opacity">
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
                            <Input id="facultyName" value={currentFaculty?.name || ''} onChange={(e) => handleDialogInputChange('name', e.target.value, setCurrentFaculty)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="facultyCode">Faculty Code</Label>
                            <Input id="facultyCode" value={currentFaculty?.code || ''} onChange={(e) => handleDialogInputChange('code', e.target.value, setCurrentFaculty)} placeholder="e.g. FAST"/>
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
                            <Input id="departmentName" value={currentDepartment?.name || ''} onChange={(e) => handleDialogInputChange('name', e.target.value, setCurrentDepartment)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="departmentCode">Department Code</Label>
                            <Input id="departmentCode" value={currentDepartment?.code || ''} onChange={(e) => handleDialogInputChange('code', e.target.value, setCurrentDepartment)} placeholder="e.g. COMPSSA"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="faculty">Faculty</Label>
                            <Select value={currentDepartment?.facultyId} onValueChange={(v) => handleDialogInputChange('facultyId', v, setCurrentDepartment)} disabled={isEditMode}>
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
                                <Input id="csv-upload-structure" type="file" accept=".csv" className="hidden" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
                                {csvFile && <p className="text-xs text-muted-foreground">Selected: {csvFile.name}</p>}
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex items-center gap-4">
                        <Button onClick={handleBulkUpload} disabled={isBulkUploading || !csvFile}>{isBulkUploading ? 'Uploading...' : 'Upload & Import'}</Button>
                        <Button variant="outline" onClick={handleDownloadTemplate}><FileDown className="mr-2 h-4 w-4" /> Download Template</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
