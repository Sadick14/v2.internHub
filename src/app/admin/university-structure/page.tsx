
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getFaculties, getDepartments, type Faculty, type Department } from '@/services/universityService';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';

interface DepartmentWithFaculty extends Department {
  facultyName: string;
}

export default function UniversityStructurePage() {
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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
        fetchData();
    }, []);

    const getDepartmentsForFaculty = (facultyId: string) => {
        return departments.filter(dep => dep.facultyId === facultyId);
    }

    return (
        <Card>
            <CardHeader>
                 <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">University Structure</CardTitle>
                        <CardDescription>Define and manage faculties and their associated departments.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                         <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Department
                        </Button>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Faculty
                        </Button>
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
    )
}
