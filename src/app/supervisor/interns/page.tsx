
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { getInternsBySupervisor, type UserProfile } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';
import { useRole } from '@/hooks/use-role';

export default function SupervisorInternsPage() {
    const { user } = useRole();
    const [interns, setInterns] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchInterns() {
            if (!user?.uid) return;
            setIsLoading(true);
            const internsData = await getInternsBySupervisor(user.uid);
            setInterns(internsData);
            setIsLoading(false);
        }
        fetchInterns();
    }, [user]);

     const getStatusVariant = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'default';
            case 'inactive':
                return 'secondary';
            case 'pending':
                return 'outline';
            default:
                return 'destructive';
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">My Interns</CardTitle>
                <CardDescription>A complete list of all students currently under your supervision.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>University Department</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                </TableRow>
                            ))
                        ) : interns.length > 0 ? (
                            interns.map((intern) => (
                                <TableRow key={intern.uid}>
                                    <TableCell className="font-medium">{intern.fullName}</TableCell>
                                    <TableCell className="text-muted-foreground">{intern.email}</TableCell>
                                    <TableCell>{intern.departmentName || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(intern.status)}>{intern.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    You have not been assigned any interns yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
