
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function UniversityStructurePage() {
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
                <p>A list of faculties and their departments will be displayed here, with options to add, edit, and deactivate.</p>
            </CardContent>
        </Card>
    )
}
