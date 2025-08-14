
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, WifiOff, Loader2, CheckCircle, Check } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/use-role';
import { createCheckIn, getTodayCheckIn, type CheckIn } from '@/services/checkInService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

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
    const [pageLoading, setPageLoading] = useState(true);
    const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);

    useEffect(() => {
        async function fetchTodayCheckIn() {
            if (!user?.uid) return;
            setPageLoading(true);
            try {
                const checkIn = await getTodayCheckIn(user.uid);
                setTodayCheckIn(checkIn);
            } catch (err) {
                toast({ title: 'Error', description: 'Could not fetch check-in status.', variant: 'destructive' });
            } finally {
                setPageLoading(false);
            }
        }
        fetchTodayCheckIn();
    }, [user, toast]);

    const handleGpsCheckIn = () => {
        setIsFetchingLocation(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                setIsFetchingLocation(false);
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
            const checkInResult = await createCheckIn({
                studentId: user.uid,
                isGpsVerified: true,
                latitude: coords.latitude,
                longitude: coords.longitude
            });
            setTodayCheckIn(checkInResult); // Update state with new check-in
            toast({ title: "Success!", description: "You have been successfully checked in.", className: 'bg-green-100 text-green-800'});
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
            const checkInResult = await createCheckIn({
                studentId: user.uid,
                isGpsVerified: false,
                manualReason: manualReason
            });
             setTodayCheckIn(checkInResult);
            toast({ title: "Success!", description: "Your manual check-in has been recorded.", className: 'bg-green-100 text-green-800'});
            setIsManualEntryOpen(false);
        } catch (err: any) {
            toast({ title: "Check-in failed", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (pageLoading) {
        return (
             <Card className="max-w-md mx-auto">
                <CardHeader><Skeleton className="h-7 w-3/4 mx-auto" /><Skeleton className="h-4 w-full mx-auto mt-2" /></CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center gap-4">
                    <Skeleton className="h-28 w-28 rounded-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    if (todayCheckIn) {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-center">You are Checked In for Today</CardTitle>
                    <CardDescription className="text-center">Your attendance has been recorded successfully.</CardDescription>
                </CardHeader>
                 <CardContent className="flex flex-col items-center justify-center text-center gap-4">
                     <div className="p-6 rounded-full bg-green-100 dark:bg-green-900">
                        <Check className="w-16 h-16 text-green-600 dark:text-green-400" />
                     </div>
                    <div className="text-center">
                        <p className="font-semibold">Checked in at: {format(todayCheckIn.timestamp, 'p')}</p>
                        <p className="text-sm text-muted-foreground">{todayCheckIn.isGpsVerified ? todayCheckIn.address_resolved : `Manual: ${todayCheckIn.manualReason}`}</p>
                    </div>
                     <Button disabled className="w-full">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Check-in Complete
                    </Button>
                </CardContent>
            </Card>
        )
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
