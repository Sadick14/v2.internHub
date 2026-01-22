
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
  AlertTriangle,
  Shield,
  Loader2,
  CheckCircle,
  GraduationCap,
  BookOpen
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createAbuseReport } from '@/services/abuseReportsService';
import { TrendingUp } from 'lucide-react';
import { subscribeToReportsByStudent } from '@/services/client/reportsClient';
import { subscribeToTodayCheckIn } from '@/services/client/checkInClient';
import { PWAInstallPrompt } from '@/components/layout/pwa-install-prompt';
import { useInternshipAccess } from '@/hooks/use-internship-access';

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

function ReportAbuseDialog() {
    const { user } = useRole();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {
        if (!user || !user.uid || !user.name) {
            toast({ title: "Error", description: "You must be logged in to submit a report.", variant: "destructive" });
            return;
        }
        if (message.length < 20) {
            toast({ title: "Error", description: "Please provide a more detailed description of the situation.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            await createAbuseReport(user.uid, user.name, message);
            toast({
                title: "Report Submitted",
                description: "Your report has been sent confidentially to your lecturer and a system administrator. They will be in touch shortly."
            });
            setMessage("");
            setIsOpen(false);
        } catch (error: any) {
            toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    <Shield className="mr-2 h-4 w-4" /> Report an Issue
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confidential Abuse & Harassment Report</DialogTitle>
                    <DialogDescription>
                        Your safety is our top priority. Please use this form to report any incident of abuse, harassment, or misconduct. This report will be sent directly to your supervising lecturer and a system administrator.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="abuse-message">Please describe the situation in detail:</Label>
                    <Textarea
                        id="abuse-message"
                        rows={8}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please provide as much detail as possible, including what happened, when and where it occurred, and who was involved. Your report will be kept confidential."
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                        Submit Confidential Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function StudentDashboardPage() {
  const { user, loading } = useRole();
  const [reports, setReports] = useState<Report[]>([]);
  const [profile, setProfile] = useState<InternshipProfile | null>(null);
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const access = useInternshipAccess(user?.uid);

  useEffect(() => {
    if (!user || !user.uid) return;
    
    async function fetchData() {
      setDataLoading(true);
      
      // Initial fetch
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

    // Set up real-time listeners
    const unsubscribeReports = subscribeToReportsByStudent(user.uid, (updatedReports) => {
      setReports(updatedReports);
    });

    const unsubscribeCheckIn = subscribeToTodayCheckIn(user.uid, (updatedCheckIn) => {
      setCheckIn(updatedCheckIn);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeReports();
      unsubscribeCheckIn();
    };
  }, [user]);

  if (loading || dataLoading) {
    return (
       <main className="flex-1 overflow-y-auto p-4 md:p-6">
           <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <GraduationCap className="h-10 w-10 text-primary animate-spin"/>
              <p className="text-muted-foreground">Loading Student Dashboard...</p>
              <svg width="200" height="40" viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg" className="text-primary/20">
                    <circle cx="25" cy="20" r="4" >
                        <animate attributeName="r" from="4" to="8" dur="0.8s" begin="0s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="1" to="0.5" dur="0.8s" begin="0s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="75" cy="20" r="4">
                        <animate attributeName="r" from="4" to="8" dur="0.8s" begin="0.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="1" to="0.5" dur="0.8s" begin="0.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="125" cy="20" r="4">
                        <animate attributeName="r" from="4" to="8" dur="0.8s" begin="0.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="1" to="0.5" dur="0.8s" begin="0.4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="175" cy="20" r="4">
                        <animate attributeName="r" from="4" to="8" dur="0.8s" begin="0.6s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="1" to="0.5" dur="0.8s" begin="0.6s" repeatCount="indefinite" />
                    </circle>
                </svg>
            </div>
          </div>
        </main>
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

  // Show preparation guide if internship hasn't started
  const showPreparationAlert = !access.isLoading && !access.hasStarted && access.daysUntilStart !== null && access.daysUntilStart > 0;

  const internshipDurationDays = profile ? differenceInBusinessDays(new Date(profile.endDate), new Date(profile.startDate)) : 0;
  const daysCompleted = profile ? Math.max(0, differenceInBusinessDays(new Date(), new Date(profile.startDate))) : 0;
  const daysRemaining = profile ? Math.max(0, differenceInBusinessDays(new Date(profile.endDate), new Date())) : 0;
  const progressPercentage = internshipDurationDays > 0 ? Math.min(100, Math.max(0, Math.round((daysCompleted / internshipDurationDays) * 100))) : 0;
  const submittedReportsCount = reports.length;
  const pendingReportsCount = reports.filter(r => r.status === 'Pending').length;
  const hoursLogged = Math.max(0, daysCompleted * 8);

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
       <PWAInstallPrompt />
       
       <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name || 'Student'}!</h1>
          <p className="text-gray-600">Here's what's happening with your internship today.</p>
      </div>

       {showPreparationAlert && (
        <Alert className="bg-primary/10 border-primary/20">
          <BookOpen className="h-4 w-4 !text-primary" />
          <AlertTitle className="font-bold">Internship Starting Soon!</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>Your internship at <strong>{profile.companyName}</strong> starts in <strong>{access.daysUntilStart} {access.daysUntilStart === 1 ? 'day' : 'days'}</strong> on {format(new Date(profile.startDate), 'MMMM dd, yyyy')}.</p>
              <p className="text-sm">Daily activities (check-in, tasks, reports) will be available once your internship begins. Use this time to prepare!</p>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href="/student/preparation">
                  <BookOpen className="mr-2 h-4 w-4" /> View Preparation Guide
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

       {!checkIn && access.canAccessActivities ? (
        <Alert className="bg-blue-50 border-blue-200 text-blue-800">
             <MapPin className="h-4 w-4 !text-blue-600" />
            <AlertTitle className="font-bold text-blue-900">Good Morning!</AlertTitle>
            <AlertDescription>
                 <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <p className="flex-grow">Your first step today is to check in at your internship location.</p>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/student/daily-check-in">
                            <MapPin className="mr-2 h-4 w-4" /> Go to Daily Check-in
                        </Link>
                    </Button>
                </div>
            </AlertDescription>
        </Alert>
       ) : access.canAccessActivities ? (
        <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 !text-green-600" />
            <AlertTitle className="font-bold text-green-900">Checked In Successfully!</AlertTitle>
            <AlertDescription>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <p className="flex-grow">Great work! Your next step is to submit your daily report.</p>
                     <Button asChild variant="secondary" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                        <Link href="/student/submit-report">
                            <FileText className="mr-2 h-4 w-4" /> Submit Daily Report
                        </Link>
                    </Button>
                </div>
            </AlertDescription>
        </Alert>
       ) : null}


       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard icon={CalendarDays} label="Days Completed" value={`${daysCompleted} / ${internshipDurationDays}`} color="blue-500" />
            <StatCard icon={ListChecks} label="Reports Submitted" value={`${submittedReportsCount}`} color="green-500" />
            <StatCard icon={Clock} label="Hours Logged" value={`${hoursLogged}`} color="purple-500" />
            <StatCard icon={MapPin} label="Today's Check-in" value={checkIn ? 'Done' : 'Pending'} color="yellow-500" />
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Internship Progress</h3>
                  <span className="text-sm text-gray-500">Week {Math.max(1, Math.floor(daysCompleted / 5) + 1)} of {Math.max(1, Math.ceil(internshipDurationDays / 5))}</span>
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
                  <Button asChild className="w-full justify-start"><Link href="/student/daily-tasks"><ListChecks className="mr-2"/> Declare Tasks</Link></Button>
                  <Button asChild className="w-full justify-start" variant="outline"><Link href="/student/reports"><FileText className="mr-2"/> View Report History</Link></Button>
                  <Button asChild className="w-full justify-start" variant="secondary"><Link href="/student/progress"><TrendingUp className="mr-2"/> View Progress & Analytics</Link></Button>
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
      
       <Alert variant="destructive" className="bg-destructive/10 border-destructive/50 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-bold text-destructive">Confidential Reporting</AlertTitle>
          <AlertDescription>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <p className="flex-grow">Your safety is important. If you experience any form of abuse or harassment, please report it immediately.</p>
                <ReportAbuseDialog />
            </div>
          </AlertDescription>
        </Alert>
    </div>
  )
}

    
