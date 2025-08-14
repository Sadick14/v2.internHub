
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AttendancePage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Attendance</CardTitle>
                <CardDescription>View your attendance record for the internship period.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>A calendar view showing your check-in history and attendance compliance will be displayed here.</p>
            </CardContent>
        </Card>
    )
}
