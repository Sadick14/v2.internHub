'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  TrendingUp,
  Users,
  FileText,
  Briefcase,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { getAllUsers, type UserProfile } from '@/services/userService';
import { getAllReports, type Report } from '@/services/reportsService';
import { getInternshipProfiles, type InternshipProfile } from '@/services/internshipProfileService';
import { getDepartments, getFaculties, type Department, type Faculty } from '@/services/universityService';
import { getAuditLogs, type AuditLog } from '@/services/auditLogService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AdminAnalyticsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [profiles, setProfiles] = useState<InternshipProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersData, reportsData, profilesData, deptsData] = await Promise.all([
          getAllUsers(),
          getAllReports(),
          getInternshipProfiles(),
          getDepartments()
        ]);

        // Fetch additional data sequentially
        const facultiesData = await getFaculties();
        const logsData = await getAuditLogs();

        setUsers(usersData);
        setReports(reportsData);
        setProfiles(profilesData);
        setDepartments(deptsData);
        setFaculties(facultiesData);
        setAuditLogs(logsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
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

  // Data Science Metrics Calculations
  const students = users.filter(u => u.role === 'student' && u.status === 'active');
  const lecturers = users.filter(u => u.role === 'lecturer' && u.status === 'active');
  const supervisors = users.filter(u => u.role === 'supervisor' && u.status === 'active');

  // Time-series data: User registrations over time (by month)
  const userRegistrationTrend = (() => {
    const monthlyData = new Map<string, { month: string; students: number; lecturers: number; supervisors: number }>();
    
    users.forEach(user => {
      if (user.createdAt) {
        const month = new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const existing = monthlyData.get(month) || { month, students: 0, lecturers: 0, supervisors: 0 };
        
        if (user.role === 'student') existing.students++;
        else if (user.role === 'lecturer') existing.lecturers++;
        else if (user.role === 'supervisor') existing.supervisors++;
        
        monthlyData.set(month, existing);
      }
    });
    
    return Array.from(monthlyData.values()).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    ).slice(-12); // Last 12 months
  })();

  // Report submission trends over time
  const reportSubmissionTrend = (() => {
    const monthlyData = new Map<string, { month: string; approved: number; pending: number; rejected: number; total: number }>();
    
    reports.forEach(report => {
      if (report.createdAt) {
        const month = new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const existing = monthlyData.get(month) || { month, approved: 0, pending: 0, rejected: 0, total: 0 };
        
        existing.total++;
        if (report.status === 'Approved') existing.approved++;
        else if (report.status === 'Pending') existing.pending++;
        else if (report.status === 'Rejected') existing.rejected++;
        
        monthlyData.set(month, existing);
      }
    });
    
    return Array.from(monthlyData.values()).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    ).slice(-12);
  })();

  // Role distribution for pie chart
  const roleDistribution = [
    { name: 'Students', value: students.length, color: COLORS[0] },
    { name: 'Lecturers', value: lecturers.length, color: COLORS[1] },
    { name: 'Supervisors', value: supervisors.length, color: COLORS[2] },
    { name: 'HODs', value: users.filter(u => u.role === 'hod').length, color: COLORS[3] },
    { name: 'Admins', value: users.filter(u => u.role === 'admin').length, color: COLORS[4] },
  ].filter(item => item.value > 0);

  // Department performance metrics
  const departmentMetrics = departments.map(dept => {
    const deptStudents = students.filter(s => s.departmentId === dept.id);
    const deptLecturers = lecturers.filter(l => l.departmentId === dept.id);
    const studentIds = deptStudents.map(s => s.uid);
    const deptReports = reports.filter(r => studentIds.includes(r.studentId));
    const deptProfiles = profiles.filter(p => studentIds.includes(p.studentId));
    
    return {
      name: dept.code || dept.name.substring(0, 15),
      students: deptStudents.length,
      lecturers: deptLecturers.length,
      reports: deptReports.length,
      activeInternships: deptProfiles.filter(p => p.status === 'active').length,
      avgReportsPerStudent: deptStudents.length > 0 ? Math.round(deptReports.length / deptStudents.length) : 0,
    };
  }).sort((a, b) => b.students - a.students);

  // Report status distribution
  const reportStatusDistribution = [
    { name: 'Approved', value: reports.filter(r => r.status === 'Approved').length, color: '#10b981' },
    { name: 'Pending', value: reports.filter(r => r.status === 'Pending').length, color: '#f59e0b' },
    { name: 'Rejected', value: reports.filter(r => r.status === 'Rejected').length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Company distribution - top companies by student count
  const companyDistribution = (() => {
    const companyCount = new Map<string, number>();
    profiles.forEach(p => {
      if (p.companyName) {
        companyCount.set(p.companyName, (companyCount.get(p.companyName) || 0) + 1);
      }
    });
    
    return Array.from(companyCount.entries())
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  })();

  // Lecturer workload distribution
  const lecturerWorkloadDist = lecturers.map(lec => {
    const assignedStudents = students.filter(s => s.lecturerId === lec.uid).length;
    const pendingReports = reports.filter(r => r.lecturerId === lec.uid && r.status === 'Pending').length;
    
    return {
      name: lec.fullName.split(' ').slice(0, 2).join(' '), // First 2 names
      students: assignedStudents,
      pending: pendingReports,
    };
  }).filter(l => l.students > 0).sort((a, b) => b.students - a.students).slice(0, 10);

  // System activity over time (audit logs)
  const systemActivityTrend = (() => {
    const dailyData = new Map<string, { date: string; actions: number }>();
    
    auditLogs.forEach(log => {
      if (log.timestamp) {
        const date = new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = dailyData.get(date) || { date, actions: 0 };
        existing.actions++;
        dailyData.set(date, existing);
      }
    });
    
    return Array.from(dailyData.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days
  })();

  // Statistical summaries
  const statistics = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalReports: reports.length,
    avgReportsPerStudent: students.length > 0 ? (reports.length / students.length).toFixed(2) : '0',
    approvalRate: reports.length > 0 
      ? ((reports.filter(r => r.status === 'Approved').length / reports.filter(r => r.status !== 'Pending').length) * 100).toFixed(1)
      : '0',
    activeInternships: profiles.filter(p => p.status === 'active').length,
    internshipPlacementRate: students.length > 0
      ? ((profiles.filter(p => p.status === 'active').length / students.length) * 100).toFixed(1)
      : '0',
    avgStudentsPerLecturer: lecturers.length > 0 
      ? (students.length / lecturers.length).toFixed(1)
      : '0',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-2xl">Analytics & Data Science</CardTitle>
          </div>
          <CardDescription>
            Comprehensive insights and statistical analysis of the internship management system
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Statistical Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((statistics.activeUsers / statistics.totalUsers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Reports/Student</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.avgReportsPerStudent}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.totalReports} total reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              of processed reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{statistics.internshipPlacementRate}%</div>
            <p className="text-xs text-muted-foreground">
              {statistics.activeInternships} active internships
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Analytics Views */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* User Registration Trend */}
            <Card>
              <CardHeader>
                <CardTitle>User Registration Trends</CardTitle>
                <CardDescription>New user registrations over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                {userRegistrationTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={userRegistrationTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="students" stackId="1" stroke={COLORS[0]} fill={COLORS[0]} name="Students" />
                      <Area type="monotone" dataKey="lecturers" stackId="1" stroke={COLORS[1]} fill={COLORS[1]} name="Lecturers" />
                      <Area type="monotone" dataKey="supervisors" stackId="1" stroke={COLORS[2]} fill={COLORS[2]} name="Supervisors" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-20">No registration data available</p>
                )}
              </CardContent>
            </Card>

            {/* Report Submission Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Report Submission Trends</CardTitle>
                <CardDescription>Monthly report submissions and status</CardDescription>
              </CardHeader>
              <CardContent>
                {reportSubmissionTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportSubmissionTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} name="Total" />
                      <Line type="monotone" dataKey="approved" stroke="#10b981" name="Approved" />
                      <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Pending" />
                      <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-20">No report data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* System Activity Trend */}
          <Card>
            <CardHeader>
              <CardTitle>System Activity Trend</CardTitle>
              <CardDescription>Daily system actions over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {systemActivityTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={systemActivityTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="actions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Actions" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-20">No activity data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Role Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
                <CardDescription>Breakdown of users by role</CardDescription>
              </CardHeader>
              <CardContent>
                {roleDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={roleDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-20">No user data available</p>
                )}
              </CardContent>
            </Card>

            {/* Report Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Report Status Distribution</CardTitle>
                <CardDescription>Current report statuses</CardDescription>
              </CardHeader>
              <CardContent>
                {reportStatusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={reportStatusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportStatusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-20">No report data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Company Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Top Partner Companies</CardTitle>
              <CardDescription>Companies hosting the most interns</CardDescription>
            </CardHeader>
            <CardContent>
              {companyDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={companyDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="company" type="category" width={150} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS[2]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-20">No company data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {/* Department Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Overview</CardTitle>
              <CardDescription>Comparative metrics across all departments</CardDescription>
            </CardHeader>
            <CardContent>
              {departmentMetrics.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={departmentMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill={COLORS[0]} name="Students" />
                    <Bar dataKey="lecturers" fill={COLORS[1]} name="Lecturers" />
                    <Bar dataKey="activeInternships" fill={COLORS[2]} name="Active Internships" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-20">No department data available</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Reports per Student by Department */}
            <Card>
              <CardHeader>
                <CardTitle>Reports Productivity by Department</CardTitle>
                <CardDescription>Average reports per student</CardDescription>
              </CardHeader>
              <CardContent>
                {departmentMetrics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgReportsPerStudent" fill={COLORS[5]} name="Avg Reports" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-20">No data available</p>
                )}
              </CardContent>
            </Card>

            {/* Lecturer Workload Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Lecturer Workload Distribution</CardTitle>
                <CardDescription>Top 10 lecturers by students and pending reviews</CardDescription>
              </CardHeader>
              <CardContent>
                {lecturerWorkloadDist.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={lecturerWorkloadDist}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="students" fill={COLORS[1]} name="Assigned Students" />
                      <Bar dataKey="pending" fill={COLORS[2]} name="Pending Reports" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-20">No lecturer data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4">
            {/* Statistical Summary Cards */}
            <Card>
              <CardHeader>
                <CardTitle>System Statistics Summary</CardTitle>
                <CardDescription>Key performance indicators and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">User Statistics</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Users:</span>
                        <Badge variant="secondary">{statistics.totalUsers}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Users:</span>
                        <Badge variant="default">{statistics.activeUsers}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Students:</span>
                        <Badge variant="outline">{students.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Lecturers:</span>
                        <Badge variant="outline">{lecturers.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Students/Lecturer:</span>
                        <Badge variant="outline">{statistics.avgStudentsPerLecturer}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Report Statistics</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Reports:</span>
                        <Badge variant="secondary">{statistics.totalReports}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Approved:</span>
                        <Badge className="bg-green-600">{reports.filter(r => r.status === 'Approved').length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Pending:</span>
                        <Badge className="bg-yellow-600">{reports.filter(r => r.status === 'Pending').length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Rejected:</span>
                        <Badge variant="destructive">{reports.filter(r => r.status === 'Rejected').length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Approval Rate:</span>
                        <Badge variant="outline">{statistics.approvalRate}%</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Internship Statistics</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Active Internships:</span>
                        <Badge variant="default">{statistics.activeInternships}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Placement Rate:</span>
                        <Badge variant="secondary">{statistics.internshipPlacementRate}%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Partner Companies:</span>
                        <Badge variant="outline">{new Set(profiles.map(p => p.companyName)).size}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Departments:</span>
                        <Badge variant="outline">{departments.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Faculties:</span>
                        <Badge variant="outline">{faculties.length}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional insights */}
            <Card>
              <CardHeader>
                <CardTitle>System Health Indicators</CardTitle>
                <CardDescription>Overall system performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User Engagement Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${(statistics.activeUsers / statistics.totalUsers) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">
                        {((statistics.activeUsers / statistics.totalUsers) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Internship Placement Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${statistics.internshipPlacementRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{statistics.internshipPlacementRate}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Report Approval Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${statistics.approvalRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{statistics.approvalRate}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Lecturer Utilization</span>
                    <div className="flex items-center gap-2">
                      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500" 
                          style={{ width: `${Math.min((parseFloat(statistics.avgStudentsPerLecturer) / 15) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{statistics.avgStudentsPerLecturer} avg</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
