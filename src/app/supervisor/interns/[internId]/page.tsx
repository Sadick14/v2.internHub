
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserById, type UserProfile } from '@/services/userService';
import { getTasksByDate, type DailyTask } from '@/services/tasksService';
import { getCheckInsByStudentId, type CheckIn } from '@/services/checkInService';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Briefcase, Calendar, Mail, User as UserIcon, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

function ProfileTab({ intern }: { intern: UserProfile }) {
    return (
        <Card>
            <CardHeader className="items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="person portrait" />
                    <AvatarFallback>{intern.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <CardTitle className="font-headline">{intern.fullName}</CardTitle>
                <CardDescription>{intern.programOfStudy || 'Program not set'}</CardDescription>
                <Badge variant={intern.status === 'active' ? 'default' : 'secondary'} className="mt-2 capitalize">{intern.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    <span>Index Number: {intern.indexNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${intern.email}`} className="text-primary hover:underline">{intern.email}</a>
                </div>
                <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{intern.departmentName}, {intern.facultyName}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Joined on: {intern.createdAt ? new Date(intern.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
            </CardContent>
        </Card>
    )
}

function TasksTab({ internId }: { internId: string }) {
    const [tasks, setTasks] = useState<DailyTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchTasks() {
            // Note: getTasksByDate with no date is not ideal. We need a new service function.
            // For now, let's assume we want tasks for "today", but ideally we'd fetch all.
            // Let's create a temporary solution to fetch all tasks for a student.
            const allTasks = await getTasksByDate(internId, new Date()); // This needs to be improved.
            setTasks(allTasks);
            setIsLoading(false);
        }
        fetchTasks();
    }, [internId]);
    
    const getStatusVariant = (status: DailyTask['status']) => {
        switch (status) {
            case 'Completed': return 'outline';
            case 'Pending': return 'secondary';
            case 'Approved': return 'default';
            case 'Rejected': return 'destructive';
            default: return 'outline';
        }
    };
    
    const TaskCard = ({ task }: { task: DailyTask }) => (
        <Card>
            <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-medium">{task.description}</div>
                        <div className="text-sm text-muted-foreground">{format(task.date, 'PPP')}</div>
                    </div>
                    <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <Card>
            <CardHeader><CardTitle>Declared Tasks</CardTitle></CardHeader>
            <CardContent>
                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                    ) : tasks.length > 0 ? (
                        tasks.map((task) => <TaskCard key={task.id} task={task} />)
                    ) : (
                        <p className="text-center text-muted-foreground py-10">No tasks found.</p>
                    )}
                </div>
                {/* Desktop View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Task</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : tasks.length > 0 ? (
                                tasks.map(task => (
                                    <TableRow key={task.id}>
                                        <TableCell>{format(task.date, 'PPP')}</TableCell>
                                        <TableCell>{task.description}</TableCell>
                                        <TableCell><Badge variant={getStatusVariant(task.status)}>{task.status}</Badge></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={3} className="text-center h-24">No tasks found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

function AttendanceTab({ internId }: { internId: string }) {
     const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
     const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchCheckIns() {
            const data = await getCheckInsByStudentId(internId);
            setCheckIns(data);
            setIsLoading(false);
        }
        fetchCheckIns();
    }, [internId]);

    const CheckInCard = ({ checkIn }: { checkIn: CheckIn }) => (
         <Card>
            <CardContent className="pt-6">
                 <div className="flex justify-between items-start">
                    <div>
                        <div className="font-medium">{format(checkIn.timestamp, 'PPP')}</div>
                        <div className="text-sm text-muted-foreground">
                            {format(checkIn.timestamp, 'p')}
                        </div>
                    </div>
                     <Badge variant={checkIn.isGpsVerified ? 'default' : 'secondary'}>
                        {checkIn.isGpsVerified ? 'GPS' : 'Manual'}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                     {checkIn.isGpsVerified ? checkIn.address_resolved : checkIn.manualReason}
                </p>
            </CardContent>
        </Card>
    );
    
    return (
        <Card>
            <CardHeader><CardTitle>Attendance History</CardTitle></CardHeader>
            <CardContent>
                 {/* Mobile View */}
                <div className="md:hidden space-y-4">
                     {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                    ) : checkIns.length > 0 ? (
                        checkIns.map((checkIn) => <CheckInCard key={checkIn.id} checkIn={checkIn} />)
                    ) : (
                        <p className="text-center text-muted-foreground py-10">No check-ins found.</p>
                    )}
                </div>
                 {/* Desktop View */}
                 <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : checkIns.length > 0 ? (
                                checkIns.map(checkIn => (
                                    <TableRow key={checkIn.id}>
                                        <TableCell>{format(checkIn.timestamp, 'PPP')}</TableCell>
                                        <TableCell>{format(checkIn.timestamp, 'p')}</TableCell>
                                        <TableCell>
                                            <Badge variant={checkIn.isGpsVerified ? 'default' : 'secondary'}>
                                                {checkIn.isGpsVerified ? 'GPS' : 'Manual'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{checkIn.isGpsVerified ? checkIn.address_resolved : checkIn.manualReason}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={4} className="text-center h-24">No check-ins found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
        </Card>
    )
}

export default function InternDetailPage({ params }: { params: { internId: string } }) {
    const [intern, setIntern] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const { internId } = params;
        async function fetchData() {
            if (!internId) {
                setIsLoading(false);
                return;
            };
            setIsLoading(true);
            const internData = await getUserById(internId);
            setIntern(internData);
            setIsLoading(false);
        }
        fetchData();
    }, [params]);

    if (isLoading) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-[500px] w-full" />
            </div>
        )
    }

    if (!intern) {
        return (
             <Card>
                <CardHeader><CardTitle>Intern Not Found</CardTitle></CardHeader>
                <CardContent>
                    <p>The requested intern could not be found.</p>
                     <Button asChild variant="outline" className="mt-4">
                        <Link href="/supervisor/interns"><ArrowLeft className="mr-2 h-4 w-4" />Back to Interns List</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
             <Button asChild variant="outline" size="sm">
                <Link href="/supervisor/interns"><ArrowLeft className="mr-2 h-4 w-4" />Back to Interns List</Link>
            </Button>
            
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="mt-4">
                    <ProfileTab intern={intern} />
                </TabsContent>
                <TabsContent value="tasks" className="mt-4">
                    <TasksTab internId={intern.uid} />
                </TabsContent>
                <TabsContent value="attendance" className="mt-4">
                    <AttendanceTab internId={intern.uid} />
                </TabsContent>
            </Tabs>

        </div>
    )
}
