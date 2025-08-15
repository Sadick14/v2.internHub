
'use client';
import {
  Activity,
  Users,
  ListChecks,
  LogIn,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRole } from '@/hooks/use-role';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { getInternsBySupervisor, type UserProfile } from '@/services/userService';
import { getTasksBySupervisor, type DailyTask } from '@/services/tasksService';
import { getTodayCheckInsForInterns, type CheckIn } from '@/services/checkInService';

export default function SupervisorDashboardPage() {
  const { user, loading } = useRole();
  const [interns, setInterns] = useState<UserProfile[]>([]);
  const [pendingTasks, setPendingTasks] = useState<DailyTask[]>([]);
  const [todayCheckIns, setTodayCheckIns] = useState<CheckIn[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user || !user.uid) return;
      setDataLoading(true);
      
      const internsData = await getInternsBySupervisor(user.uid);
      setInterns(internsData);

      if (internsData.length > 0) {
        const internIds = internsData.map(i => i.uid);
        const [tasksData, checkInsData] = await Promise.all([
          getTasksBySupervisor(user.uid, ['Completed']),
          getTodayCheckInsForInterns(internIds),
        ]);
        setPendingTasks(tasksData);
        setTodayCheckIns(checkInsData);
      } else {
        setPendingTasks([]);
        setTodayCheckIns([]);
      }
      
      setDataLoading(false);
    }
    fetchData();
  }, [user]);

  if (loading || dataLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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
     <div className="flex flex-col gap-4 lg:gap-6">
       <Card className="bg-gradient-to-r from-primary/80 to-primary rounded-xl p-6 text-primary-foreground shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                  <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.name || 'Supervisor'}!</h2>
                  <p className="opacity-90 text-sm">
                      {pendingTasks.length > 0 
                        ? `You have ${pendingTasks.length} tasks to review.` 
                        : 'All tasks are reviewed. Great job!'}
                  </p>
              </div>
              <div className="flex-shrink-0 mt-3 md:mt-0">
                  <Link href="/supervisor/tasks" passHref>
                      <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium transition rounded-lg px-4 py-2 text-sm">
                          <ListChecks className="mr-2 h-4 w-4" /> Review Tasks
                      </Button>
                  </Link>
              </div>
          </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Interns</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interns.length}</div>
            <p className="text-xs text-muted-foreground">under your supervision</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks to Review</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">+{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">completed by interns</p>
          </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
              <LogIn className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayCheckIns.length} / {interns.length}</div>
              <Link href="/supervisor/check-ins" className="text-xs text-muted-foreground hover:underline">
                View check-in history
              </Link>
            </CardContent>
          </Card>
      </div>
       <Card>
        <CardHeader>
          <CardTitle className="font-headline">My Interns</CardTitle>
           <CardDescription>A list of all students currently under your supervision.</CardDescription>
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
              {interns.length > 0 ? (
                interns.map((intern) => (
                  <TableRow key={intern.uid}>
                    <TableCell>
                      <div className="font-medium">{intern.fullName}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{intern.email}</TableCell>
                    <TableCell className="text-muted-foreground">{intern.departmentName || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(intern.status)}>{intern.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        You have not been assigned any interns yet.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
