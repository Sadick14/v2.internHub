'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  Briefcase,
  Users,
  FileText,
  ArrowUpRight,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useRole } from '@/hooks/use-role';
import { getAllUsers, type UserProfile } from '@/services/userService';
import { getAllReports, type Report } from '@/services/reportsService';
import { getInternshipProfiles, type InternshipProfile } from '@/services/internshipProfileService';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HODDashboardPage() {
  const { user, loading } = useRole();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [lecturers, setLecturers] = useState<UserProfile[]>([]);
  const [profiles, setProfiles] = useState<InternshipProfile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.departmentId) return;
      
      setDataLoading(true);
      try {
        const [allUsers, allProfiles, allReports] = await Promise.all([
          getAllUsers(),
          getInternshipProfiles(),
          getAllReports()
        ]);

        // Filter users by department
        const deptStudents = allUsers.filter(u => u.role === 'student' && u.departmentId === user.departmentId && u.status === 'active');
        const deptLecturers = allUsers.filter(u => u.role === 'lecturer' && u.departmentId === user.departmentId && u.status === 'active');
        
        setStudents(deptStudents);
        setLecturers(deptLecturers);

        // Filter profiles for department students
        const studentIds = deptStudents.map(s => s.uid);
        const deptProfiles = allProfiles.filter(p => studentIds.includes(p.studentId));
        setProfiles(deptProfiles);

        // Filter reports for department students
        const deptReports = allReports.filter(r => studentIds.includes(r.studentId));
        setReports(deptReports);
      } catch (error) {
        console.error('Error fetching HOD dashboard data:', error);
      } finally {
        setDataLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading || dataLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
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

  // Core metrics (ALL FILTERED BY DEPARTMENT)
  const activeInternships = profiles.filter(p => p.status === 'active').length;
  const uniqueCompanies = new Set(profiles.map(p => p.companyName)).size;
  const pendingReports = reports.filter(r => r.status === 'Pending').length;
  const approvedReports = reports.filter(r => r.status === 'Approved').length;
  const rejectedReports = reports.filter(r => r.status === 'Rejected').length;
  
  // Report approval metrics
  const totalProcessedReports = approvedReports + rejectedReports;
  const approvalRate = totalProcessedReports > 0 
    ? Math.round((approvedReports / totalProcessedReports) * 100)
    : 0;

  // Lecturer workload (only department lecturers)
  const lecturerWorkload = lecturers.map(lec => ({
    name: lec.fullName,
    studentCount: students.filter(s => s.lecturerId === lec.uid).length,
    pendingReports: reports.filter(r => r.lecturerId === lec.uid && r.status === 'Pending').length
  })).sort((a, b) => b.studentCount - a.studentCount);

  // Student performance distribution
  const studentsWithProfiles = students.filter(s => 
    profiles.some(p => p.studentId === s.uid && p.status === 'active')
  ).length;
  const studentsWithoutProfiles = students.length - studentsWithProfiles;

  // Top companies hosting students
  const companyDistribution = Array.from(
    profiles.reduce((acc, p) => {
      acc.set(p.companyName, (acc.get(p.companyName) || 0) + 1);
      return acc;
    }, new Map<string, number>())
  ).map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Report status breakdown
  const reportStatusBreakdown = [
    { status: 'Approved', count: approvedReports, color: 'bg-green-500' },
    { status: 'Pending', count: pendingReports, color: 'bg-yellow-500' },
    { status: 'Rejected', count: rejectedReports, color: 'bg-red-500' }
  ];

  // Students per lecturer distribution
  const avgStudentsPerLecturer = lecturers.length > 0 
    ? Math.round(students.length / lecturers.length) 
    : 0;

  // Recent activity
  const recentReports = reports
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Head of Department Dashboard</CardTitle>
          <CardDescription>
            Department-level oversight and analytics for {user?.departmentName || 'your department'}.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Primary Metrics - ALL DEPARTMENT SCOPED */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              {studentsWithProfiles} with active internships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeInternships}</div>
            <p className="text-xs text-muted-foreground">
              across {uniqueCompanies} companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingReports}</div>
            <p className="text-xs text-muted-foreground">awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              {approvedReports} approved, {rejectedReports} rejected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department Lecturers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lecturers.length}</div>
            <p className="text-xs text-muted-foreground">
              Avg {avgStudentsPerLecturer} students each
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">
              {students.length > 0 ? `Avg ${Math.round(reports.length / students.length)} per student` : 'No students'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Without Setup</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{studentsWithoutProfiles}</div>
            <p className="text-xs text-muted-foreground">need internship setup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Companies</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCompanies}</div>
            <p className="text-xs text-muted-foreground">hosting your students</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Report Status Overview</CardTitle>
          <CardDescription>Department-wide report submission status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportStatusBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.status}</span>
                  <Badge variant={item.status === 'Approved' ? 'default' : item.status === 'Pending' ? 'secondary' : 'destructive'}>
                    {item.count} reports
                  </Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color}`} 
                    style={{ width: `${reports.length > 0 ? (item.count / reports.length) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lecturer Workload & Company Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Lecturer Workload</CardTitle>
            <CardDescription>Student assignment and pending reviews</CardDescription>
          </CardHeader>
          <CardContent>
            {lecturerWorkload.length > 0 ? (
              <div className="space-y-4">
                {lecturerWorkload.map((lec, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{lec.name}</span>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{lec.studentCount} students</Badge>
                        {lec.pendingReports > 0 && (
                          <Badge variant="outline">{lec.pendingReports} pending</Badge>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${students.length > 0 ? (lec.studentCount / students.length) * 100 : 0}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No lecturers assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Top Partner Companies</CardTitle>
            <CardDescription>Companies hosting the most students</CardDescription>
          </CardHeader>
          <CardContent>
            {companyDistribution.length > 0 ? (
              <div className="space-y-4">
                {companyDistribution.map((company, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{company.company}</span>
                      <Badge variant="outline">{company.count} students</Badge>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${activeInternships > 0 ? (company.count / activeInternships) * 100 : 0}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No company placements yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center">
          <CardTitle className="font-headline">Recent Report Activity</CardTitle>
          <Button asChild size="sm" variant="outline" className="ml-auto">
            <Link href="/admin/reports">
              View All Reports
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentReports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReports.map((report) => {
                  const student = students.find(s => s.uid === report.studentId);
                  return (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{student?.fullName || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant={report.status === 'Pending' ? 'secondary' : report.status === 'Approved' ? 'default' : 'destructive'}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {report.reportDate.toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No recent reports</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
