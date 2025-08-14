
'use client'
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Users,
} from 'lucide-react'
import Link from 'next/link'

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
import { useRole } from '@/hooks/use-role'

export default function DashboardPage() {
  const { role } = useRole()

  const renderStudentDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Internship Status</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Active</div>
            <p className="text-xs text-muted-foreground">at Innovate LLC</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Submitted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+25</div>
            <p className="text-xs text-muted-foreground">3 pending approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">For today</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Today</div>
            <p className="text-xs text-muted-foreground">Submitted daily report</p>
          </CardContent>
        </Card>
      </div>
       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Reports</CardTitle>
           <CardDescription>A log of your recent daily report submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { date: '2024-07-20', status: 'Approved' },
                { date: '2024-07-19', status: 'Approved' },
                { date: '2024-07-18', status: 'Pending' },
                { date: '2024-07-17', status: 'Pending' },
                { date: '2024-07-16', status: 'Rejected' },
              ].map((report) => (
                <TableRow key={report.date}>
                  <TableCell>
                    <div className="font-medium">{report.date}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={report.status === 'Approved' ? 'default' : report.status === 'Pending' ? 'secondary' : 'destructive'} className={report.status === 'Approved' ? `bg-primary/20 text-primary-foreground border-primary/20 hover:bg-primary/30` : ''}>{report.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )

  const renderLecturerDashboard = () => (
     <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">from 3 departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports to Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">+5</div>
            <p className="text-xs text-muted-foreground">pending your feedback</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">across all students</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">report submission rate</p>
          </CardContent>
        </Card>
      </div>
       <Card>
        <CardHeader className="flex items-center">
          <CardTitle className="font-headline">My Students</CardTitle>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/students">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               <TableRow>
                  <TableCell>
                    <div className="font-medium">Liam Johnson</div>
                    <div className="text-sm text-muted-foreground">liam@university.edu</div>
                  </TableCell>
                  <TableCell>Computer Science</TableCell>
                  <TableCell>Innovate LLC</TableCell>
                  <TableCell>
                    <Badge variant="outline">Active</Badge>
                  </TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>
                    <div className="font-medium">Olivia Smith</div>
                     <div className="text-sm text-muted-foreground">olivia@university.edu</div>
                  </TableCell>
                  <TableCell>Marketing</TableCell>
                  <TableCell>Solutions Inc.</TableCell>
                   <TableCell>
                    <Badge variant="destructive">Overdue</Badge>
                  </TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )

  const renderSupervisorDashboard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Company Supervisor Dashboard</CardTitle>
        <CardDescription>
          Review and manage your assigned interns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Interns</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                from University of Example
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">+2</div>
              <p className="text-xs text-muted-foreground">
                awaiting your approval
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6">
          <CardTitle className="text-lg font-headline">Recent Activity</CardTitle>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               <TableRow>
                  <TableCell>
                    <div className="font-medium">John Doe</div>
                  </TableCell>
                  <TableCell>Submitted a daily report</TableCell>
                  <TableCell>2024-07-21</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Review</Button>
                  </TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>
                    <div className="font-medium">Jane Smith</div>
                  </TableCell>
                   <TableCell>Completed all tasks for the day</TableCell>
                  <TableCell>2024-07-21</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" disabled>No Action</Button>
                  </TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )

  const renderHODDashboard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Head of Department Dashboard</CardTitle>
        <CardDescription>
          Oversight for the Computer Science department.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interns</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">in your department</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Supervising Lecturers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">assigned</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partner Companies</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">22</div>
              <p className="text-xs text-muted-foreground">hosting your students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">
                daily report submissions
              </p>
            </CardContent>
          </Card>
        </div>
         <div className="mt-6">
          <p>More detailed departmental analytics and reporting tools will be available here.</p>
        </div>
      </CardContent>
    </Card>
  )

  const renderAdminDashboard = () => (
    <Card>
       <CardHeader>
        <CardTitle className="font-headline">Administrator Dashboard</CardTitle>
        <CardDescription>
          Global oversight and management of the entire internship program.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,254</div>
              <p className="text-xs text-muted-foreground">students, lecturers, staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">+150</div>
              <p className="text-xs text-muted-foreground">students to be verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculties</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">across the university</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Operational</div>
              <p className="text-xs text-muted-foreground">
                All systems running normally
              </p>
            </CardContent>
          </Card>
        </div>
        <div>
          <CardTitle className="font-headline text-lg">Quick Actions</CardTitle>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild>
              <Link href="/invite-student">Invite Student</Link>
            </Button>
            <Button variant="secondary">Manage Users</Button>
            <Button variant="secondary">System Settings</Button>
             <Button variant="secondary">View Audit Logs</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderDashboard = () => {
    switch (role) {
      case 'student':
        return renderStudentDashboard()
      case 'lecturer':
        return renderLecturerDashboard()
      case 'hod':
        return renderHODDashboard()
      case 'supervisor':
        return renderSupervisorDashboard()
      case 'admin':
        return renderAdminDashboard()
      default:
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Welcome</CardTitle>
                    <CardDescription>Please select a role to view the appropriate dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Use the role switcher to get started.</p>
                </CardContent>
            </Card>
        )
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
        {renderDashboard()}
    </div>
  )
}
