
'use client';
import {
  Activity,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight
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

export default function StudentDashboardPage() {
  const { user, loading } = useRole();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // If user has no internshipId, show the setup prompt.
  if (user && !user.internshipId) {
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

  return (
     <div className="flex flex-col gap-4 lg:gap-6">
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
    </div>
  )
}
