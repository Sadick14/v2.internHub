'use client';

import { useEffect, useState } from 'react';
import { useRole } from '@/hooks/use-role';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Award,
  Target,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  BarChart3,
  Download,
  Flame,
  Star,
  Trophy,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { getReportsByStudentId, type Report } from '@/services/reportsService';
import { getInternshipProfileByStudentId, type InternshipProfile } from '@/services/internshipProfileService';
import { getCheckInsByStudentId, type CheckIn } from '@/services/checkInService';
import { getAllTasksByStudentId, type DailyTask } from '@/services/tasksService';
import { format, differenceInBusinessDays, startOfWeek, endOfWeek, eachWeekOfInterval, isSameWeek, addDays } from 'date-fns';

export default function StudentProgressPage() {
  const { user, loading } = useRole();
  const { toast } = useToast();
  const [profile, setProfile] = useState<InternshipProfile | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) return;
      setDataLoading(true);
      try {
        const [profileData, reportsData, checkInsData, tasksData] = await Promise.all([
          getInternshipProfileByStudentId(user.uid),
          getReportsByStudentId(user.uid),
          getCheckInsByStudentId(user.uid),
          getAllTasksByStudentId(user.uid)
        ]);
        setProfile(profileData);
        setReports(reportsData);
        setCheckIns(checkInsData);
        setTasks(tasksData);
      } catch (error: any) {
        toast({
          title: 'Error Loading Data',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setDataLoading(false);
      }
    }
    fetchData();
  }, [user, toast]);

  if (loading || dataLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Internship Profile</CardTitle>
          <CardDescription>Please set up your internship profile first</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate metrics
  const internshipDays = differenceInBusinessDays(new Date(profile.endDate), new Date(profile.startDate));
  const daysCompleted = Math.max(0, differenceInBusinessDays(new Date(), new Date(profile.startDate)));
  const progressPercentage = Math.min(100, Math.round((daysCompleted / internshipDays) * 100));

  const totalReports = reports.length;
  const approvedReports = reports.filter(r => r.status === 'Approved').length;
  const pendingReports = reports.filter(r => r.status === 'Pending').length;
  const rejectedReports = reports.filter(r => r.status === 'Rejected').length;
  const approvalRate = totalReports > 0 ? Math.round((approvedReports / totalReports) * 100) : 0;

  const totalCheckIns = checkIns.length;
  const expectedCheckIns = daysCompleted;
  const attendanceRate = expectedCheckIns > 0 ? Math.round((totalCheckIns / expectedCheckIns) * 100) : 0;

  // Calculate streak (consecutive check-ins)
  const sortedCheckIns = [...checkIns].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  let streak = 0;
  let checkDate = new Date();
  for (const checkIn of sortedCheckIns) {
    const checkInDate = new Date(checkIn.timestamp);
    if (format(checkInDate, 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd') ||
        format(checkInDate, 'yyyy-MM-dd') === format(addDays(checkDate, -1), 'yyyy-MM-dd')) {
      streak++;
      checkDate = checkInDate;
    } else {
      break;
    }
  }

  // Weekly activity data
  const weeks = eachWeekOfInterval({
    start: new Date(profile.startDate),
    end: new Date()
  }).slice(-8); // Last 8 weeks

  const weeklyActivity = weeks.map(weekStart => {
    const weekEnd = endOfWeek(weekStart);
    const weekReports = reports.filter(r => 
      isSameWeek(new Date(r.reportDate), weekStart)
    ).length;
    const weekCheckIns = checkIns.filter(c => 
      isSameWeek(new Date(c.timestamp), weekStart)
    ).length;
    const weekTasks = tasks.filter(t => 
      isSameWeek(new Date(t.date), weekStart)
    ).length;

    return {
      week: format(weekStart, 'MMM dd'),
      reports: weekReports,
      checkIns: weekCheckIns,
      tasks: weekTasks,
    };
  });

  // Report status distribution
  const reportStatusData = [
    { name: 'Approved', value: approvedReports, color: '#10b981' },
    { name: 'Pending', value: pendingReports, color: '#f59e0b' },
    { name: 'Rejected', value: rejectedReports, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Monthly submission trends
  const monthlyData = reports.reduce((acc, report) => {
    const month = format(new Date(report.reportDate), 'MMM yyyy');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyTrends = Object.entries(monthlyData)
    .map(([month, count]) => ({ month, reports: count }))
    .slice(-6);

  // Performance score calculation
  const performanceScore = Math.round(
    (attendanceRate * 0.3 + approvalRate * 0.4 + Math.min(100, (totalReports / daysCompleted) * 100) * 0.3)
  );

  const handleExportProgress = () => {
    const progressData = {
      student: user?.name,
      internship: {
        company: profile.companyName,
        supervisor: profile.supervisorName,
        startDate: format(new Date(profile.startDate), 'PPP'),
        endDate: format(new Date(profile.endDate), 'PPP'),
        daysCompleted: daysCompleted,
        progressPercentage: progressPercentage,
      },
      metrics: {
        totalReports,
        approvedReports,
        pendingReports,
        rejectedReports,
        approvalRate: `${approvalRate}%`,
        attendanceRate: `${attendanceRate}%`,
        checkInStreak: streak,
        performanceScore: `${performanceScore}/100`,
      },
      weeklyActivity,
    };

    const dataStr = JSON.stringify(progressData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `internship-progress-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Progress Exported',
      description: 'Your progress data has been downloaded successfully.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Internship Progress & Analytics
              </CardTitle>
              <CardDescription>
                Track your performance, attendance, and achievements throughout your internship
              </CardDescription>
            </div>
            <Button onClick={handleExportProgress} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Progress
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {daysCompleted} of {internshipDays} days
            </p>
            <Progress value={progressPercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceScore}/100</div>
            <p className="text-xs text-muted-foreground">
              Based on attendance & reports
            </p>
            <div className="mt-2">
              {performanceScore >= 80 && <Badge className="bg-green-600">Excellent</Badge>}
              {performanceScore >= 60 && performanceScore < 80 && <Badge className="bg-blue-600">Good</Badge>}
              {performanceScore >= 40 && performanceScore < 60 && <Badge className="bg-yellow-600">Fair</Badge>}
              {performanceScore < 40 && <Badge variant="destructive">Needs Improvement</Badge>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{streak} days</div>
            <p className="text-xs text-muted-foreground">
              Attendance: {attendanceRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              {approvedReports} of {totalReports} reports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Internship Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Internship Timeline</CardTitle>
                <CardDescription>Your journey from start to completion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Start Date</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(profile.startDate), 'PPP')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">End Date</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(profile.endDate), 'PPP')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Duration</span>
                    <span className="text-sm text-muted-foreground">
                      {internshipDays} business days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completed</span>
                    <Badge variant="secondary">{daysCompleted} days ({progressPercentage}%)</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Remaining</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.max(0, internshipDays - daysCompleted)} days
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
                <CardDescription>How your score is calculated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Attendance (30%)</span>
                    <span className="font-medium">{attendanceRate}%</span>
                  </div>
                  <Progress value={attendanceRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Report Approval (40%)</span>
                    <span className="font-medium">{approvalRate}%</span>
                  </div>
                  <Progress value={approvalRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Submission Rate (30%)</span>
                    <span className="font-medium">
                      {Math.min(100, Math.round((totalReports / Math.max(1, daysCompleted)) * 100))}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (totalReports / Math.max(1, daysCompleted)) * 100)} 
                    className="h-2" 
                  />
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Overall Score</span>
                    <span className="text-2xl font-bold">{performanceScore}/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity Trends</CardTitle>
              <CardDescription>Your reports, check-ins, and tasks over the last 8 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="reports" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Reports" />
                    <Area type="monotone" dataKey="checkIns" stackId="1" stroke="#10b981" fill="#10b981" name="Check-ins" />
                    <Area type="monotone" dataKey="tasks" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Tasks" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-20">No activity data yet</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalCheckIns}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {attendanceRate}% attendance rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalReports}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {daysCompleted > 0 ? (totalReports / daysCompleted).toFixed(1) : 0} per day average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tasks.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Declared and tracked
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Report Status Distribution</CardTitle>
                <CardDescription>Breakdown of your submitted reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reportStatusData.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <Badge 
                        variant={item.name === 'Approved' ? 'default' : item.name === 'Pending' ? 'secondary' : 'destructive'}
                      >
                        {item.value} reports
                      </Badge>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full" 
                        style={{ 
                          width: `${totalReports > 0 ? (item.value / totalReports) * 100 : 0}%`,
                          backgroundColor: item.color
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Submission Trends</CardTitle>
                <CardDescription>Reports submitted per month</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="reports" fill="#3b82f6" name="Reports" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-20">No data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Milestones */}
            <Card className={totalReports >= 10 ? 'border-green-500' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Award className={totalReports >= 10 ? 'h-8 w-8 text-green-600' : 'h-8 w-8 text-gray-400'} />
                  {totalReports >= 10 && <Badge className="bg-green-600">Unlocked</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-1">First 10 Reports</h3>
                <p className="text-xs text-muted-foreground">
                  Submit 10 reports ({totalReports}/10)
                </p>
                <Progress value={(totalReports / 10) * 100} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className={streak >= 7 ? 'border-orange-500' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Flame className={streak >= 7 ? 'h-8 w-8 text-orange-600' : 'h-8 w-8 text-gray-400'} />
                  {streak >= 7 && <Badge className="bg-orange-600">Unlocked</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-1">Week Streak</h3>
                <p className="text-xs text-muted-foreground">
                  7-day check-in streak ({streak}/7)
                </p>
                <Progress value={(streak / 7) * 100} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className={approvalRate >= 90 ? 'border-yellow-500' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Star className={approvalRate >= 90 ? 'h-8 w-8 text-yellow-600' : 'h-8 w-8 text-gray-400'} />
                  {approvalRate >= 90 && <Badge className="bg-yellow-600">Unlocked</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-1">Quality Performer</h3>
                <p className="text-xs text-muted-foreground">
                  90% approval rate ({approvalRate}%)
                </p>
                <Progress value={approvalRate} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className={progressPercentage >= 50 ? 'border-blue-500' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Target className={progressPercentage >= 50 ? 'h-8 w-8 text-blue-600' : 'h-8 w-8 text-gray-400'} />
                  {progressPercentage >= 50 && <Badge className="bg-blue-600">Unlocked</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-1">Halfway There</h3>
                <p className="text-xs text-muted-foreground">
                  50% internship complete ({progressPercentage}%)
                </p>
                <Progress value={progressPercentage} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className={attendanceRate >= 95 ? 'border-purple-500' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CheckCircle2 className={attendanceRate >= 95 ? 'h-8 w-8 text-purple-600' : 'h-8 w-8 text-gray-400'} />
                  {attendanceRate >= 95 && <Badge className="bg-purple-600">Unlocked</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-1">Perfect Attendance</h3>
                <p className="text-xs text-muted-foreground">
                  95% attendance rate ({attendanceRate}%)
                </p>
                <Progress value={attendanceRate} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className={performanceScore >= 85 ? 'border-red-500' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Trophy className={performanceScore >= 85 ? 'h-8 w-8 text-red-600' : 'h-8 w-8 text-gray-400'} />
                  {performanceScore >= 85 && <Badge className="bg-red-600">Unlocked</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-1">Excellence Award</h3>
                <p className="text-xs text-muted-foreground">
                  85+ performance score ({performanceScore}/100)
                </p>
                <Progress value={performanceScore} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
