
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssignLecturersPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Assign Lecturers</CardTitle>
                <CardDescription>Assign supervising lecturers to students.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>A list of unassigned students will be displayed here. Administrators can select a student and assign an available lecturer from the same faculty or department.</p>
            </CardContent>
        </Card>
    )
}
