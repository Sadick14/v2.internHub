
'use client';
import {
  Activity,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  CalendarCheck,
  MapPin,
  FileText,
  CalendarDays,
  ListChecks,
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
import { getReportsByStudentId, type Report } from '@/services/reportsService';
import { useEffect, useState } from 'react';
import { getInternshipProfileByStudentId, type InternshipProfile } from '@/services/internshipProfileService';
import { getTodayCheckIn, type CheckIn } from '@/services/checkInService';
import { format, differenceInDays, differenceInBusinessDays } from 'date-fns';
import { Progress } from '@/components/ui/progress';

const StatCard = ({ icon: Icon, label, value, color = 'primary' }: { icon: React.ElementType, label: string, value: string | number, color?: string }) => (
    <div className="stat-card bg-white rounded-xl shadow-sm p-6 flex items-center">
        <div className={`bg-${color}/10 p-3 rounded-lg`}>
            <Icon className={`text-${color} text-xl`} />
        </div>
        <div className="ml-4">
            <p className="text-gray-500 text-sm">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


export default function StudentDashboardPage() {
  const { user, loading } = useRole();
  const [reports, setReports] = useState<Report[]>([]);
  const [profile, setProfile] = useState<InternshipProfile | null>(null);
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user || !user.uid) return;
      setDataLoading(true);
      
      const [reportsData, profileData, checkInData] = await Promise.all([
        getReportsByStudentId(user.uid),
        getInternshipProfileByStudentId(user.uid),
        getTodayCheckIn(user.uid)
      ]);
      setReports(reportsData);
      setProfile(profileData);
      setCheckIn(checkInData);

      setDataLoading(false);
    }
    fetchData();
  }, [user]);

  if (loading || dataLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // If user has no internshipId, show the setup prompt.
  if (!profile) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="font-headline">Welcome to Intern Hub!</CardTitle>
          <CardDescription>Let's get your internship profile set up so you can start logging your progress.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            <Briefcase className="w-16 h-16 text-primary" />
            <p>You have not configured your internship details yet.</p>
            <Button asChild>
                <Link href="/student/internship-setup">
                    Setup Internship Profile <ArrowRight className="ml-2" />
                </Link>
            </Button>
        </CardContent>
      </Card>
    )
  }

  const internshipDurationDays = profile ? differenceInBusinessDays(new Date(profile.endDate), new Date(profile.startDate)) : 0;
  const daysCompleted = profile ? differenceInBusinessDays(new Date(), new Date(profile.startDate)) : 0;
  const progressPercentage = internshipDurationDays > 0 ? Math.min(100, Math.round((daysCompleted / internshipDurationDays) * 100)) : 0;
  const submittedReportsCount = reports.length;
  const pendingReportsCount = reports.filter(r => r.status === 'Pending').length;

  const getStatusVariant = (status: Report['status']) => {
    switch (status) {
        case 'Approved': return 'default';
        case 'Pending': return 'secondary';
        case 'Rejected': return 'destructive';
        default: return 'outline';
    }
  };


  return (
     <div className="space-y-6">
       <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name || 'Student'}!</h1>
          <p className="text-gray-600">Here's what's happening with your internship today.</p>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard icon={CalendarDays} label="Days Completed" value={`${daysCompleted} / ${internshipDurationDays}`} color="blue-500" />
            <StatCard icon={ListChecks} label="Reports Submitted" value={`${submittedReportsCount}`} color="green-500" />
            <StatCard icon={Clock} label="Hours Logged" value={`${daysCompleted * 8}`} color="purple-500" />
            <StatCard icon={MapPin} label="Today's Check-in" value={checkIn ? 'Done' : 'Pending'} color="yellow-500" />
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Internship Progress</h3>
                  <span className="text-sm text-gray-500">Week {Math.floor(daysCompleted / 5) + 1} of {Math.floor(internshipDurationDays / 5)}</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Start</span>
                <span>{progressPercentage}%</span>
                <span>End</span>
              </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                  <Button asChild className="w-full justify-start"><Link href="/student/daily-check-in"><MapPin className="mr-2"/> Daily Check-in</Link></Button>
                  <Button asChild className="w-full justify-start"><Link href="/student/daily-tasks"><ListTodo className="mr-2"/> Declare Tasks</Link></Button>
                  <Button asChild className="w-full justify-start"><Link href="/student/submit-report"><FileText className="mr-2"/> Submit Report</Link></Button>
              </div>
          </div>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Reports</CardTitle>
           <CardDescription>A log of your 5 most recent daily report submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supervisor Comment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length > 0 ? (
                reports.slice(0, 5).map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="font-medium">{format(new Date(report.reportDate), 'PPP')}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-xs">
                        {report.supervisorComment || 'No comment yet.'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/student/reports/${report.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        You have not submitted any reports yet.
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
