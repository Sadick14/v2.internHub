
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  Clock,
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
import { getAllUsers } from '@/services/userService';
import { getPendingInvites } from '@/services/invitesService';
import { getFaculties } from '@/services/universityService';
import { getAuditLogs, type AuditLog } from '@/services/auditLogService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default async function AdminDashboardPage() {
  const [users, pendingInvites, faculties, auditLogs] = await Promise.all([
    getAllUsers(),
    getPendingInvites(),
    getFaculties(),
    getAuditLogs()
  ]);

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
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">{users.filter(u => u.role === 'student').length} students, {users.filter(u => u.role === 'lecturer').length} lecturers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">+{pendingInvites.length}</div>
              <p className="text-xs text-muted-foreground">users to be verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculties</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{faculties.length}</div>
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
