
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, WifiOff, Loader2, CheckCircle, Check, Flame, CalendarClock, Building2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/use-role';
import { createCheckIn, getTodayCheckIn, getCheckInsByStudentId, type CheckIn } from '@/services/checkInService';
import { getInternshipProfileByStudentId, type InternshipProfile } from '@/services/internshipProfileService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { format, differenceInDays, isSameDay, subDays } from 'date-fns';
import { InternshipGuard } from '@/components/guards/internship-guard';

type GeolocationData = {
    latitude: number;
    longitude: number;
}

const StatCard = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
    <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
        <div className="bg-background rounded-md p-2">
            <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-bold text-lg">{value}</p>
        </div>
    </div>
);

function calculateStreak(checkIns: CheckIn[]): number {
    if (checkIns.length === 0) return 0;

    // Sort check-ins by date descending
    const sortedCheckIns = checkIns.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    let streak = 0;
    let today = new Date();

    // Check if the most recent check-in was today or yesterday
    if (!isSameDay(sortedCheckIns[0].timestamp, today) && !isSameDay(sortedCheckIns[0].timestamp, subDays(today, 1))) {
        return 0; // Streak is broken if no check-in today or yesterday
    }

    if (isSameDay(sortedCheckIns[0].timestamp, today)) {
        streak = 1;
        today = subDays(today, 1); // Start checking from yesterday
    } else if (isSameDay(sortedCheckIns[0].timestamp, subDays(today,1))) {
        streak = 1;
        today = subDays(subDays(today, 1), 1); // Start checking from the day before yesterday
    }


    const uniqueDays = new Set<string>();
    sortedCheckIns.forEach(ci => uniqueDays.add(format(ci.timestamp, 'yyyy-MM-dd')));

    for (let i = 1; i < sortedCheckIns.length; i++) {
        if (isSameDay(sortedCheckIns[i].timestamp, today)) {
             streak++;
             today = subDays(today, 1);
        } else if (sortedCheckIns[i].timestamp < today) {
            // A day was missed
            break;
        }
        // If multiple check-ins on the same day, we just continue
    }
    
    // Check consecutive days from the most recent
    let lastDate = sortedCheckIns[0].timestamp;
    if (!isSameDay(lastDate, new Date()) && !isSameDay(lastDate, subDays(new Date(),1))) {
        return 0;
    }
    
    streak = 1;
    let expectedDate = subDays(lastDate, 1);

    const uniqueCheckinDates = [...new Set(sortedCheckIns.map(ci => format(ci.timestamp, 'yyyy-MM-dd')))];

    for (let i = 1; i < uniqueCheckinDates.length; i++) {
        const currentDate = new Date(uniqueCheckinDates[i]);
         if (isSameDay(currentDate, expectedDate)) {
            streak++;
            expectedDate = subDays(expectedDate, 1);
        } else {
            break;
        }
    }


    return streak;
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
    const [profile, setProfile] = useState<InternshipProfile | null>(null);
    const [allCheckIns, setAllCheckIns] = useState<CheckIn[]>([]);

    useEffect(() => {
        async function fetchInitialData() {
            if (!user?.uid) return;
            setPageLoading(true);
            try {
                const [checkIn, profileData, allCheckInsData] = await Promise.all([
                    getTodayCheckIn(user.uid),
                    getInternshipProfileByStudentId(user.uid),
                    getCheckInsByStudentId(user.uid)
                ]);

                setTodayCheckIn(checkIn);
                setProfile(profileData);
                setAllCheckIns(allCheckInsData);

            } catch (err) {
                toast({ title: 'Error', description: 'Could not fetch check-in status or profile data.', variant: 'destructive' });
            } finally {
                setPageLoading(false);
            }
        }
        fetchInitialData();
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
            setAllCheckIns(prev => [...prev, checkInResult]); // Add to all checkins
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
             setAllCheckIns(prev => [...prev, checkInResult]); // Add to all checkins
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
        const daysLeft = profile ? differenceInDays(profile.endDate, new Date()) : 0;
        const streak = calculateStreak(allCheckIns);

        return (
            <InternshipGuard>
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-center">You are Checked In for Today</CardTitle>
                    <CardDescription className="text-center">Your attendance has been recorded successfully. Keep up the great work!</CardDescription>
                </CardHeader>
                 <CardContent className="flex flex-col items-center justify-center text-center gap-4">
                     <div className="p-6 rounded-full bg-green-100 dark:bg-green-900">
                        <Check className="w-16 h-16 text-green-600 dark:text-green-400" />
                     </div>

                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <StatCard icon={Flame} label="Current Streak" value={`${streak} Day(s)`} />
                        <StatCard icon={CalendarClock} label="Days Left" value={daysLeft >= 0 ? `${daysLeft}` : 'Completed'} />
                        <div className="sm:col-span-2">
                            <StatCard icon={Building2} label="Check-in Location" value={todayCheckIn.isGpsVerified ? todayCheckIn.address_resolved || '...' : `Manual: ${todayCheckIn.manualReason}`} />
                        </div>
                    </div>

                     <Button disabled className="w-full mt-4">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Check-in Complete for {format(todayCheckIn.timestamp, 'PPP')}
                    </Button>
                </CardContent>
            </Card>
            </InternshipGuard>
        )
    }

    return (
        <InternshipGuard>
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
                        Location Acquired: <span className="font-mono">{(isFinite(location.latitude) ? location.latitude : 0).toFixed(4)}, {(isFinite(location.longitude) ? location.longitude : 0).toFixed(4)}</span>
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
        </InternshipGuard>
    )
}
