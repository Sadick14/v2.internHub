
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, WifiOff, Loader2, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/use-role';
import { createCheckIn } from '@/services/checkInService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type GeolocationData = {
    latitude: number;
    longitude: number;
}

export default function DailyCheckInPage() {
    const { toast } = useToast();
    const { user } = useRole();
    const [location, setLocation] = useState<GeolocationData | null>(null);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
    const [manualReason, setManualReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleGpsCheckIn = () => {
        setIsFetchingLocation(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                setIsFetchingLocation(false);
                
                // Automatically submit after getting location
                await submitCheckIn({ latitude, longitude });
            },
            (error) => {
                setError(`GPS Error: ${error.message}. You can use manual check-in.`);
                setIsFetchingLocation(false);
                toast({ title: 'GPS Error', description: error.message, variant: 'destructive' });
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const submitCheckIn = async (coords: GeolocationData) => {
         if (!user) {
            toast({ title: "Error", description: "You must be logged in.", variant: "destructive"});
            return;
        }
        setIsSubmitting(true);
        try {
            await createCheckIn({
                studentId: user.uid,
                isGpsVerified: true,
                latitude: coords.latitude,
                longitude: coords.longitude
            });
            toast({ title: "Success!", description: "You have been successfully checked in.", className: 'bg-green-100 text-green-800'});
             setTimeout(() => window.location.href = '/student/dashboard', 1000);
        } catch (err: any) {
            toast({ title: "Check-in failed", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const handleManualCheckIn = async () => {
         if (!user) {
            toast({ title: "Error", description: "You must be logged in.", variant: "destructive"});
            return;
        }
         if (!manualReason.trim()) {
            toast({ title: "Error", description: "A reason is required for manual check-in.", variant: "destructive"});
            return;
        }
        setIsSubmitting(true);
         try {
            await createCheckIn({
                studentId: user.uid,
                isGpsVerified: false,
                manualReason: manualReason
            });
            toast({ title: "Success!", description: "Your manual check-in has been recorded.", className: 'bg-green-100 text-green-800'});
            setIsManualEntryOpen(false);
            setTimeout(() => window.location.href = '/student/dashboard', 1000);
        } catch (err: any) {
            toast({ title: "Check-in failed", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-center">Daily Attendance Check-in</CardTitle>
                <CardDescription className="text-center">Verify your presence at your internship location for today.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center gap-4">
                 <div className="p-6 rounded-full bg-primary/10">
                    <MapPin className="w-16 h-16 text-primary" />
                 </div>
                 
                 {isFetchingLocation && <p className="text-muted-foreground">Getting your location...</p>}
                 {location && !isSubmitting && (
                    <div className="text-sm bg-muted p-2 rounded-md">
                        Location Acquired: <span className="font-mono">{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                    </div>
                 )}
                 
                 {error && <p className="text-destructive text-sm">{error}</p>}
                 
                <Button onClick={handleGpsCheckIn} disabled={isFetchingLocation || isSubmitting} className="w-full">
                    {isFetchingLocation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting && !isFetchingLocation && <CheckCircle className="mr-2 h-4 w-4" />}
                    {isSubmitting ? 'Submitting...' : 'Check-in with GPS'}
                </Button>
                
                <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <WifiOff className="mr-2 h-4 w-4" />
                            Manual Check-in
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Manual Check-in</DialogTitle>
                            <DialogDescription>
                                Only use this if you are unable to check-in with GPS. Your supervisor may be notified.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="manualReason">Reason for Manual Check-in</Label>
                            <Textarea 
                                id="manualReason" 
                                value={manualReason}
                                onChange={(e) => setManualReason(e.target.value)}
                                placeholder="e.g., GPS not working in the office building, internet connection issue."
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsManualEntryOpen(false)}>Cancel</Button>
                            <Button onClick={handleManualCheckIn} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Manual Check-in
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </CardContent>
        </Card>
    )
}
