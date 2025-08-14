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

  const renderGenericDashboard = (title: string) => (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{title} Dashboard</CardTitle>
          <CardDescription>Overview of activities and metrics for your role.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>More specific widgets and data for the {title} role will be displayed here.</p>
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
        return renderGenericDashboard('Head of Department')
      case 'supervisor':
        return renderGenericDashboard('Company Supervisor')
      case 'admin':
        return renderGenericDashboard('Administrator')
      default:
        return <p>Select a role to view the dashboard.</p>
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
        {renderDashboard()}
    </div>
  )
}
