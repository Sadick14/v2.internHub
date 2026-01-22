'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  Clock,
  FileText,
  Shield,
  Users,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getAllUsers, type UserProfile } from '@/services/userService';
import { getPendingInvites, type Invite } from '@/services/invitesService';
import { getFaculties, getDepartments, type Faculty, type Department } from '@/services/universityService';
import { getAuditLogs, type AuditLog } from '@/services/auditLogService';
import { getAllReports, type Report } from '@/services/reportsService';
import { getInternshipProfiles, type InternshipProfile } from '@/services/internshipProfileService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [profiles, setProfiles] = useState<InternshipProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Real-time listeners for all data
    const unsubUsers = onSnapshot(collection(db, 'users'), async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error loading users:', err);
      }
    });

    const unsubInvites = onSnapshot(collection(db, 'invites'), async () => {
      try {
        const data = await getPendingInvites();
        setPendingInvites(data);
      } catch (err) {
        console.error('Error loading invites:', err);
      }
    });

    const unsubFaculties = onSnapshot(collection(db, 'faculties'), async () => {
      try {
        const data = await getFaculties();
        setFaculties(data);
      } catch (err) {
        console.error('Error loading faculties:', err);
      }
    });

    const unsubAuditLogs = onSnapshot(
      query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(10)),
      async () => {
        try {
          const data = await getAuditLogs();
          setAuditLogs(data.slice(0, 10));
        } catch (err) {
          console.error('Error loading audit logs:', err);
        }
      }
    );

    // Initial load
    Promise.all([
      getAllUsers(),
      getPendingInvites(),
      getFaculties(),
      getDepartments(),
      getAuditLogs(),
      getAllReports(),
      getInternshipProfiles()
    ]).then(([usersData, invitesData, facultiesData, deptsData, logsData, reportsData, profilesData]) => {
      setUsers(usersData);
      setPendingInvites(invitesData);
      setFaculties(facultiesData);
      setDepartments(deptsData);
      setAuditLogs(logsData.slice(0, 10));
      setReports(reportsData);
      setProfiles(profilesData);
      setLoading(false);
    }).catch((err) => {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubInvites();
      unsubFaculties();
      unsubAuditLogs();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 lg:gap-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  const getActionVariant = (action: string) => {
      if (action.includes('create') || action.includes('add') || action.includes('invite')) return 'default';
      if (action.includes('update') || action.includes('edit') || action.includes('assign')) return 'secondary';
      if (action.includes('delete') || action.includes('remove') || action.includes('deactivate')) return 'destructive';
      return 'outline';
  }

  const LogCard = ({ log }: { log: AuditLog }) => (
        <Card>
            <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-medium">{log.userName}</div>
                        <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                    </div>
                    <Badge variant={getActionVariant(log.action.toLowerCase())} className="capitalize">
                        {log.action}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{log.details}</p>
                <p className="text-xs text-muted-foreground mt-2 text-right">
                    {format(log.timestamp, 'Pp')}
                </p>
            </CardContent>
        </Card>
    );

  // Analytics calculations
  const students = users.filter(u => u.role === 'student' && u.status === 'active');
  const lecturers = users.filter(u => u.role === 'lecturer' && u.status === 'active');
  const supervisors = users.filter(u => u.role === 'supervisor' && u.status === 'active');
  const hods = users.filter(u => u.role === 'hod' && u.status === 'active');
  const admins = users.filter(u => u.role === 'admin' && u.status === 'active');
  
  const activeInternships = profiles.filter(p => p.status === 'active').length;
  const uniqueCompanies = new Set(profiles.map(p => p.companyName)).size;
  
  const pendingReports = reports.filter(r => r.status === 'Pending').length;
  const approvedReports = reports.filter(r => r.status === 'Approved').length;
  const rejectedReports = reports.filter(r => r.status === 'Rejected').length;
  
  // Department distribution
  const deptDistribution = departments.map(dept => ({
    name: dept.name,
    studentCount: students.filter(s => s.departmentId === dept.id).length,
    lecturerCount: lecturers.filter(l => l.departmentId === dept.id).length
  })).sort((a, b) => b.studentCount - a.studentCount);

  // Top active lecturers by assigned students
  const lecturerWorkload = lecturers.map(lec => ({
    name: lec.fullName,
    studentCount: students.filter(s => s.lecturerId === lec.uid).length
  })).filter(l => l.studentCount > 0).sort((a, b) => b.studentCount - a.studentCount).slice(0, 5);

  // Report approval rate
  const totalProcessedReports = approvedReports + rejectedReports;
  const approvalRate = totalProcessedReports > 0 ? Math.round((approvedReports / totalProcessedReports) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <Card>
       <CardHeader>
        <CardTitle className="font-headline">Administrator Dashboard</CardTitle>
        <CardDescription>
          Global oversight and management of the entire internship program.
        </CardDescription>
      </CardHeader>
      </Card>
      
      {/* Primary Metrics */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">{students.length} students, {lecturers.length} lecturers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{activeInternships}</div>
              <p className="text-xs text-muted-foreground">across {uniqueCompanies} companies</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculties</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{faculties.length}</div>
              <p className="text-xs text-muted-foreground">{departments.length} departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">+{pendingInvites.length}</div>
              <p className="text-xs text-muted-foreground">to be verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Supervisors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{supervisors.length}</div>
              <p className="text-xs text-muted-foreground">company mentors</p>
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
        </div>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">User Role Distribution</CardTitle>
            <CardDescription>Active users by role across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Students</span>
                  <Badge variant="default">{students.length}</Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${users.length > 0 ? (students.length / users.length) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lecturers</span>
                  <Badge variant="secondary">{lecturers.length}</Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${users.length > 0 ? (lecturers.length / users.length) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Supervisors</span>
                  <Badge variant="outline">{supervisors.length}</Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${users.length > 0 ? (supervisors.length / users.length) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">HODs</span>
                  <Badge variant="outline">{hods.length}</Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${users.length > 0 ? (hods.length / users.length) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Admins</span>
                  <Badge variant="outline">{admins.length}</Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${users.length > 0 ? (admins.length / users.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Analytics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Department Distribution</CardTitle>
              <CardDescription>Students and lecturers by department</CardDescription>
            </CardHeader>
            <CardContent>
              {deptDistribution.length > 0 ? (
                <div className="space-y-4">
                  {deptDistribution.slice(0, 6).map((dept, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate">{dept.name}</span>
                        <span className="text-muted-foreground">{dept.studentCount} students, {dept.lecturerCount} lecturers</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${students.length > 0 ? (dept.studentCount / students.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No departments configured</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Lecturer Workload</CardTitle>
              <CardDescription>Top 5 lecturers by assigned students</CardDescription>
            </CardHeader>
            <CardContent>
              {lecturerWorkload.length > 0 ? (
                <div className="space-y-4">
                  {lecturerWorkload.map((lec, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate">{lec.name}</span>
                        <Badge variant="secondary">{lec.studentCount} students</Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${students.length > 0 ? (lec.studentCount / students.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No student assignments yet</p>
              )}
            </CardContent>
          </Card>
        </div>

      <Card>
        <CardHeader className="flex items-center">
          <CardTitle className="font-headline">Recent System Activity</CardTitle>
           <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/admin/audit-logs">
              View All Logs
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {auditLogs.slice(0, 5).map((log) => <LogCard key={log.id} log={log}/>)}
          </div>
          {/* Desktop View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.slice(0, 5).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                        <div className="font-medium">{log.userName}</div>
                        <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={getActionVariant(log.action.toLowerCase())} className="capitalize">
                            {log.action}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-sm">{log.details}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(log.timestamp, 'Pp')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
