
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getAuditLogs, type AuditLog } from '@/services/auditLogService';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLogs() {
            setIsLoading(true);
            const logsData = await getAuditLogs();
            setLogs(logsData);
            setIsLoading(false);
        }
        fetchLogs();
    }, []);

    const getActionVariant = (action: string) => {
        if (action.includes('create') || action.includes('add') || action.includes('invite')) return 'default';
        if (action.includes('update') || action.includes('edit')) return 'secondary';
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
                    {format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                </p>
            </CardContent>
        </Card>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Audit Logs</CardTitle>
                <CardDescription>Review a log of all significant actions taken within the system.</CardDescription>
            </CardHeader>
            <CardContent>
                 {/* Mobile View */}
                 <div className="md:hidden">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : logs.length > 0 ? (
                        <div className="space-y-4">
                            {logs.map(log => <LogCard key={log.id} log={log} />)}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-10">No audit logs found.</p>
                    )}
                 </div>
                 {/* Desktop View */}
                 <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            {format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{log.userName}</div>
                                            <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getActionVariant(log.action.toLowerCase())} className="capitalize">
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No audit logs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
        </Card>
    )
}
