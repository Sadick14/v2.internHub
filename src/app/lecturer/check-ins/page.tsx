
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { getStudentsByLecturer } from '@/services/userService';
import { getCheckInsForInterns, type CheckIn } from '@/services/checkInService';
import { Skeleton } from '@/components/ui/skeleton';
import { useRole } from '@/hooks/use-role';
import { format } from 'date-fns';

interface CheckInWithStudentName extends CheckIn {
    studentName: string;
}

export default function LecturerCheckInsPage() {
    const { user } = useRole();
    const [checkIns, setCheckIns] = useState<CheckInWithStudentName[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user?.uid) return;
            setIsLoading(true);

            try {
                const interns = await getStudentsByLecturer(user.uid);
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
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                </TableRow>
                            ))
                        ) : checkIns.length > 0 ? (
                            checkIns.map((checkIn) => (
                                <TableRow key={checkIn.id}>
                                    <TableCell className="font-medium">{checkIn.studentName}</TableCell>
                                    <TableCell>{format(checkIn.timestamp, 'PPP')}</TableCell>
                                    <TableCell>{format(checkIn.timestamp, 'p')}</TableCell>
                                    <TableCell>
                                        <Badge variant={checkIn.isGpsVerified ? 'default' : 'secondary'}>
                                            {checkIn.isGpsVerified ? 'GPS Verified' : 'Manual'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {checkIn.isGpsVerified ? checkIn.address_resolved : checkIn.manualReason}
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
