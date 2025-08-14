
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProgressEvaluationPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Progress Evaluation</CardTitle>
                <CardDescription>View feedback and evaluations from your supervisors.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Periodic and final evaluation forms submitted by your company and university supervisors will be displayed here.</p>
            </CardContent>
        </Card>
    )
}
