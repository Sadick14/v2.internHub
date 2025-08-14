
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export default function DailyCheckInPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Daily Check-in</CardTitle>
                <CardDescription>Check in to your workplace to verify your attendance for the day.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center gap-4">
                <MapPin className="w-16 h-16 text-primary" />
                <p className="text-muted-foreground">Use the mobile app to check in with your location.</p>
                <Button>
                    Check-in Now
                </Button>
            </CardContent>
        </Card>
    )
}
