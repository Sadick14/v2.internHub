
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getAuditLogs, type AuditLog } from '@/services/auditLogService';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown } from 'lucide-react';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
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

    useEffect(() => {
        let filtered = logs;
        
        if (searchTerm) {
            filtered = filtered.filter(l => 
                l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.details.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (actionFilter !== 'all') {
            filtered = filtered.filter(l => l.action.toLowerCase().includes(actionFilter.toLowerCase()));
        }
        
        setFilteredLogs(filtered);
        setCurrentPage(1);
    }, [logs, searchTerm, actionFilter]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLogs = filteredLogs.slice(startIndex, endIndex);

    const handleExportCSV = () => {
        const headers = 'Timestamp,User,Email,Action,Details';
        const rows = filteredLogs.map(log => {
            const timestamp = format(log.timestamp, 'yyyy-MM-dd HH:mm:ss');
            return `"${timestamp}","${log.userName}","${log.userEmail}","${log.action}","${log.details}"`;
        });
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">Audit Logs</CardTitle>
                        <CardDescription>Review a log of all significant actions taken within the system.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={filteredLogs.length === 0}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Input
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            <SelectItem value="create">Create</SelectItem>
                            <SelectItem value="update">Update</SelectItem>
                            <SelectItem value="delete">Delete</SelectItem>
                            <SelectItem value="invite">Invite</SelectItem>
                            <SelectItem value="assign">Assign</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="ml-auto flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Per page:</Label>
                        <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 {/* Mobile View */}
                 <div className="md:hidden">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : currentLogs.length > 0 ? (
                        <div className="space-y-4">
                            {currentLogs.map(log => <LogCard key={log.id} log={log} />)}
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
                            ) : currentLogs.length > 0 ? (
                                currentLogs.map((log) => (
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
                 {filteredLogs.length > 0 && (
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-sm text-muted-foreground">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} logs
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
