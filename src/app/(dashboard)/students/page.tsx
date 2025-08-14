import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Students</CardTitle>
                <CardDescription>Manage student profiles and internship details.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>A list of all students will be displayed here, with options to view details, assign supervisors, and track progress.</p>
            </CardContent>
        </Card>
    )
}
