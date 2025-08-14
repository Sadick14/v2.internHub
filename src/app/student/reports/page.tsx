
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";

export default function DailyReportHistoryPage() {
  // This will be replaced with actual data fetching
  const reports = [
    { id: '1', date: '2024-07-22', status: 'Approved', supervisorComment: 'Great work on the UI components.' },
    { id: '2', date: '2024-07-21', status: 'Rejected', supervisorComment: 'Please provide more detail on the challenges you faced.' },
    { id: '3', date: '2024-07-20', status: 'Approved', supervisorComment: 'Well done.' },
    { id: '4', date: '2024-07-19', status: 'Pending', supervisorComment: '' },
  ];

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'Approved': return 'default';
      case 'Pending': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">My Report History</CardTitle>
        <CardDescription>A log of all your submitted daily reports and their statuses.</CardDescription>
      </CardHeader>
      <CardContent>
         <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Supervisor Comment</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {reports.map((report) => (
                    <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.date}</TableCell>
                        <TableCell><Badge variant={getStatusVariant(report.status)}>{report.status}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{report.supervisorComment || 'No feedback yet.'}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
