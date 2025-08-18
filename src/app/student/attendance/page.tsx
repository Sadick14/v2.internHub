
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useRole } from '@/hooks/use-role';
import { getCheckInsByStudentId, type CheckIn } from '@/services/checkInService';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { isSameDay } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';


const MapDialog = ({ checkIn }: { checkIn: CheckIn }) => {
    if (!checkIn.isGpsVerified || !checkIn.latitude || !checkIn.longitude) {
        return null;
    }
    
    const { latitude, longitude } = checkIn;
    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.005}%2C${latitude - 0.005}%2C${longitude + 0.005}%2C${latitude + 0.005}&layer=mapnik&marker=${latitude}%2C${longitude}`;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2"><Map className="mr-2 h-4 w-4"/>View Map</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Check-in Location</DialogTitle>
                    <DialogDescription>{checkIn.address_resolved}</DialogDescription>
                </DialogHeader>
                <div className="aspect-video w-full rounded-md overflow-hidden border">
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        src={mapSrc}
                    ></iframe>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function AttendancePage() {
    const { user } = useRole();
    const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    useEffect(() => {
        async function fetchCheckIns() {
            if (!user?.uid) return;
            setIsLoading(true);
            const data = await getCheckInsByStudentId(user.uid);
            setCheckIns(data);
            setIsLoading(false);
        }
        fetchCheckIns();
    }, [user]);

    const checkedInDays = checkIns.map(ci => ci.timestamp);

    const selectedDayCheckIn = selectedDate ? checkIns.find(ci => isSameDay(ci.timestamp, selectedDate)) : null;

    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                   <Skeleton className="h-7 w-48" />
                   <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-8">
                   <Skeleton className="h-80 w-full md:w-96" />
                   <div className="flex-1 space-y-4">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-16 w-full" />
                   </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Attendance Record</CardTitle>
                <CardDescription>A calendar view of your check-in history. Select a day to see details.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{ checkedIn: checkedInDays }}
                    modifiersStyles={{
                         checkedIn: { 
                             color: 'hsl(var(--primary-foreground))',
                             backgroundColor: 'hsl(var(--primary))'
                         }
                    }}
                />
                 <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-4">Details for {selectedDate ? selectedDate.toLocaleDateString() : '...'}</h3>
                    {selectedDayCheckIn ? (
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <Badge>Checked-in at: {selectedDayCheckIn.timestamp.toLocaleTimeString()}</Badge>
                            </div>
                            <p className="text-sm">
                                <span className="font-semibold">Method:</span>{' '}
                                {selectedDayCheckIn.isGpsVerified ? 'GPS Verified' : 'Manual Entry'}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">Location/Reason:</span>{' '}
                                <span className="text-muted-foreground">
                                    {selectedDayCheckIn.isGpsVerified ? selectedDayCheckIn.address_resolved : selectedDayCheckIn.manualReason}
                                </span>
                            </p>
                            {selectedDayCheckIn.isGpsVerified && <MapDialog checkIn={selectedDayCheckIn} />}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-10">
                            <p>{selectedDate ? "No check-in record for this day." : "Select a day to see details."}</p>
                        </div>
                    )}
                 </div>
            </CardContent>
        </Card>
    )
}
