
import {
  Clock,
  Users,
} from 'lucide-react'
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

export default function SupervisorDashboardPage() {
  return (
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
}
