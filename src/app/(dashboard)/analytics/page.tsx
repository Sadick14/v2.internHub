import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Analytics</CardTitle>
                <CardDescription>Data-driven insights into the internship program.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Interactive charts and graphs showing performance metrics will be displayed here.</p>
            </CardContent>
        </Card>
    )
}
