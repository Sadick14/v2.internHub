
'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { getAllTerms, createTerm, updateTerm, type InternshipTerm } from '@/services/internshipTermsService';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Archive, CheckCircle, MoreHorizontal } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const termSchema = z.object({
  name: z.string().min(1, "A name is required."),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date({ required_error: "An end date is required." }),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date.",
  path: ["endDate"],
});

type TermFormValues = z.infer<typeof termSchema>;

export default function InternshipTermsPage() {
    const { toast } = useToast();
    const [terms, setTerms] = useState<InternshipTerm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<TermFormValues>({
        resolver: zodResolver(termSchema),
        defaultValues: {
            name: '',
            startDate: new Date(),
            endDate: new Date(),
        }
    });

    async function fetchTerms() {
        setIsLoading(true);
        const termsData = await getAllTerms();
        setTerms(termsData);
        setIsLoading(false);
    }

    useEffect(() => {
        fetchTerms();
    }, []);

    async function onSubmit(data: TermFormValues) {
        setIsSubmitting(true);
        try {
            await createTerm(data);
            toast({
                title: 'Term Created',
                description: 'The new internship term has been created successfully.',
            });
            fetchTerms();
            setIsDialogOpen(false);
            form.reset();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Failed to create term: ${error.message}`,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleSetStatus = async (id: string, status: InternshipTerm['status']) => {
        try {
            if (status === 'Active') {
                // Ensure only one term is active at a time
                const activeTerm = terms.find(t => t.status === 'Active');
                if (activeTerm && activeTerm.id !== id) {
                    await updateTerm(activeTerm.id, { status: 'Upcoming' });
                }
            }
            await updateTerm(id, { status });
            toast({
                title: 'Status Updated',
                description: `Term status has been set to ${status}.`,
            });
            fetchTerms();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Failed to update status: ${error.message}`,
                variant: 'destructive',
            });
        }
    };
    
    const getStatusVariant = (status: InternshipTerm['status']) => {
        switch (status) {
            case 'Active': return 'default';
            case 'Archived': return 'secondary';
            case 'Upcoming': return 'outline';
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                             <CardTitle className="font-headline">Internship Terms</CardTitle>
                             <CardDescription>Manage internship periods, set the active term, and archive past sessions.</CardDescription>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                 <Button><PlusCircle className="mr-2 h-4 w-4" /> Create New Term</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Internship Term</DialogTitle>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                         <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Term Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. 2024-2025 Session" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="startDate"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>Start Date</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="endDate"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>End Date</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                         <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Term'}</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Term Name</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {terms.map((term) => (
                                <TableRow key={term.id}>
                                    <TableCell className="font-medium">{term.name}</TableCell>
                                    <TableCell>{format(term.startDate, 'PPP')}</TableCell>
                                    <TableCell>{format(term.endDate, 'PPP')}</TableCell>
                                    <TableCell><Badge variant={getStatusVariant(term.status)}>{term.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleSetStatus(term.id, 'Active')} disabled={term.status === 'Active'}>
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Set as Active
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSetStatus(term.id, 'Archived')} disabled={term.status === 'Archived'}>
                                                    <Archive className="mr-2 h-4 w-4" /> Archive Term
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                               ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Global Settings</CardTitle>
                    <CardDescription>System-wide notification settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Notification settings will be managed here in a future update.</p>
                </CardContent>
             </Card>
        </div>
    );
}
