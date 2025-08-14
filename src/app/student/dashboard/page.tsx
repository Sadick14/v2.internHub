
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
          <CardTitle className="font-headline">Welcome to InternshipTrack!</CardTitle>
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
     <div className="flex flex-col gap-4 lg:gap-6">
       <Card className="bg-gradient-to-r from-primary/80 to-primary rounded-xl p-6 text-primary-foreground shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                  <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.name || 'Student'}!</h2>
                  <p className="opacity-90 text-sm">
                      {checkIn ? 
                        (pendingReportsCount > 0 ? `You have ${pendingReportsCount} reports pending review.` : 'You are all caught up on your reports.') 
                        : "Please check in to record your attendance for today."
                      }
                  </p>
              </div>
              <div className="flex-shrink-0 mt-3 md:mt-0">
                  {checkIn ? (
                    <Link href="/student/submit-report" passHref>
                        <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium transition rounded-lg px-4 py-2 text-sm">
                            <FileText className="mr-2 h-4 w-4" /> Submit Today's Report
                        </Button>
                    </Link>
                  ) : (
                    <Link href="/student/daily-check-in" passHref>
                        <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium transition rounded-lg px-4 py-2 text-sm animate-pulse">
                            <MapPin className="mr-2 h-4 w-4" /> Check-in Now
                        </Button>
                    </Link>
                  )}
              </div>
          </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Internship Progress</CardDescription>
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">{daysCompleted} / {internshipDurationDays} Days</CardTitle>
          </CardHeader>
          <CardContent>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">You are {progressPercentage}% through your internship.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Submitted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{submittedReportsCount}</div>
            <p className="text-xs text-muted-foreground">{pendingReportsCount} pending approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-in</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${checkIn ? 'text-primary' : 'text-muted-foreground'}`}>{checkIn ? 'Complete' : 'Pending'}</div>
             <p className="text-xs text-muted-foreground">
                {checkIn ? `at ${format(checkIn.timestamp, 'p')}` : 'Action required'}
             </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary capitalize">{profile?.status || 'Active'}</div>
            <p className="text-xs text-muted-foreground">at {profile?.companyName}</p>
          </CardContent>
        </Card>
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
