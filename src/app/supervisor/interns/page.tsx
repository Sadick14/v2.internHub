
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
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
import { Button } from '@/components/ui/button';

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
    
    const InternCard = ({ intern }: { intern: UserProfile }) => (
        <Card>
            <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-medium">{intern.fullName}</div>
                        <div className="text-sm text-muted-foreground">{intern.email}</div>
                        <div className="text-sm text-muted-foreground mt-2">
                           <p><strong>Department:</strong> {intern.departmentName || 'N/A'}</p>
                        </div>
                    </div>
                     <Button asChild variant="outline" size="sm">
                        <Link href={`/supervisor/interns/${intern.uid}`}>
                            View Profile
                        </Link>
                    </Button>
                </div>
                <div className="mt-4">
                    <Badge variant={getStatusVariant(intern.status)}>{intern.status}</Badge>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">My Interns</CardTitle>
                <CardDescription>A complete list of all students currently under your supervision.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
                    ) : interns.length > 0 ? (
                        interns.map((intern) => <InternCard key={intern.uid} intern={intern} />)
                    ) : (
                        <p className="text-center text-muted-foreground py-10">You have not been assigned any interns yet.</p>
                    )}
                </div>
                {/* Desktop View */}
                 <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>University Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
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
                                        <TableCell><Skeleton className="h-9 w-24 ml-auto" /></TableCell>
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
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/supervisor/interns/${intern.uid}`}>
                                                    View Profile
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        You have not been assigned any interns yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
        </Card>
    )
}
