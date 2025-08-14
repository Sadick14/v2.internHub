import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Reports</CardTitle>
                <CardDescription>View and manage all student reports.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>A comprehensive table of all student reports will be displayed here, with filters and search capabilities.</p>
            </CardContent>
        </Card>
    )
}
