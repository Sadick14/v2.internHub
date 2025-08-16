
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { getInternsBySupervisor } from '@/services/userService';
import { getCheckInsForInterns, type CheckIn } from '@/services/checkInService';
import { Skeleton } from '@/components/ui/skeleton';
import { useRole } from '@/hooks/use-role';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Map } from 'lucide-react';

interface CheckInWithStudentName extends CheckIn {
    studentName: string;
}

const MapDialog = ({ checkIn }: { checkIn: CheckIn }) => {
    if (!checkIn.isGpsVerified || !checkIn.latitude || !checkIn.longitude) {
        return null;
    }
    
    const { latitude, longitude } = checkIn;
    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.005}%2C${latitude - 0.005}%2C${longitude + 0.005}%2C${latitude + 0.005}&layer=mapnik&marker=${latitude}%2C${longitude}`;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Map className="mr-2 h-4 w-4"/>View Map</Button>
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

export default function SupervisorCheckInsPage() {
    const { user } = useRole();
    const [checkIns, setCheckIns] = useState<CheckInWithStudentName[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user?.uid) return;
            setIsLoading(true);

            try {
                const interns = await getInternsBySupervisor(user.uid);
                if (interns.length > 0) {
                    const internIds = interns.map(i => i.uid);
                    const checkInsData = await getCheckInsForInterns(internIds);

                    const enrichedCheckIns = checkInsData.map(checkIn => {
                        const intern = interns.find(i => i.uid === checkIn.studentId);
                        return {
                            ...checkIn,
                            studentName: intern?.fullName || 'Unknown Student',
                        };
                    });
                    setCheckIns(enrichedCheckIns);
                }
            } catch (error) {
                console.error("Failed to fetch check-in data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [user]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Intern Check-in History</CardTitle>
                <CardDescription>A log of all daily check-ins from your assigned interns.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Intern Name</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Map</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-9 w-24" /></TableCell>
                                </TableRow>
                            ))
                        ) : checkIns.length > 0 ? (
                            checkIns.map((checkIn) => (
                                <TableRow key={checkIn.id}>
                                    <TableCell className="font-medium">{checkIn.studentName}</TableCell>
                                    <TableCell>
                                        <div>{format(checkIn.timestamp, 'PPP')}</div>
                                        <div className="text-xs text-muted-foreground">{format(checkIn.timestamp, 'p')}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={checkIn.isGpsVerified ? 'default' : 'secondary'}>
                                            {checkIn.isGpsVerified ? 'GPS Verified' : 'Manual'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {checkIn.isGpsVerified ? checkIn.address_resolved : checkIn.manualReason}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {checkIn.isGpsVerified && <MapDialog checkIn={checkIn} />}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No check-ins have been recorded yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
