
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudentDetails, type StudentDetails } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Briefcase, Calendar, Mail, Phone, User as UserIcon, Building2, Clock, FileText, Bot, MessageSquare, CheckCircle, ListTodo, CalendarCheck, Award, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/use-role';
import { createEvaluation, type EvaluationMetrics } from '@/services/evaluationsService';
import { Loader2 } from 'lucide-react';
import type { Report } from '@/services/reportsService';
import type { DailyTask } from '@/services/tasksService';
import type { CheckIn } from '@/services/checkInService';
import type { Evaluation } from '@/services/evaluationsService';
import { Progress } from '@/components/ui/progress';


function StudentDetailSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-7 w-48" />
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader className="items-center text-center">
                        <Skeleton className="w-24 h-24 rounded-full mb-4" />
                        <Skeleton className="h-7 w-40 mb-2" />
                        <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                    </CardContent>
                </Card>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                        <CardContent><Skeleton className="h-5 w-3/4" /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                        <CardContent><Skeleton className="h-5 w-3/4" /></CardContent>
                    </Card>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-10 w-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

const getStatusVariant = (status: Report['status'] | DailyTask['status']) => {
    switch (status) {
        case 'Approved': return 'default';
        case 'Pending': return 'secondary';
        case 'Completed': return 'outline'
        case 'Rejected': return 'destructive';
        default: return 'outline';
    }
};

const ProfileTab = ({ student, profile }: { student: StudentDetails['student'], profile: StudentDetails['profile']}) => (
     <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
            <CardHeader className="items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="person portrait" />
                    <AvatarFallback>{student.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <CardTitle className="font-headline">{student.fullName}</CardTitle>
                <CardDescription>{student.programOfStudy || 'Program not set'}</CardDescription>
                <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="mt-2 capitalize">{student.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    <span>{student.indexNumber || 'No Index Number'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${student.email}`} className="text-primary hover:underline">{student.email}</a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{student.departmentName}, {student.facultyName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Joined on: {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
            </CardContent>
        </Card>
        
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>Internship Details</CardTitle></CardHeader>
                <CardContent className="space-y-4 text-sm">
                    {profile ? (
                        <>
                            <div className="flex items-center gap-3"><Briefcase className="w-4 h-4 text-muted-foreground" /><span>Works at <span className="font-semibold">{profile.companyName}</span></span></div>
                            <div className="flex items-center gap-3"><UserIcon className="w-4 h-4 text-muted-foreground" /><span>Supervisor: <span className="font-semibold">{profile.supervisorName}</span> ({profile.supervisorEmail})</span></div>
                            <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-muted-foreground" /><span>Duration: {format(new Date(profile.startDate), 'PPP')} - {format(new Date(profile.endDate), 'PPP')}</span></div>
                        </>
                    ) : <p className="text-muted-foreground">Student has not set up their internship profile yet.</p>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Supervising Lecturer</CardTitle></CardHeader>
                <CardContent className="text-sm">
                    {student.assignedLecturerName ? <div className="flex items-center gap-3"><UserIcon className="w-4 h-4 text-muted-foreground" /><span className="font-semibold">{student.assignedLecturerName}</span></div> : <p className="text-muted-foreground">No supervising lecturer has been assigned yet.</p>}
                </CardContent>
            </Card>
        </div>
    </div>
)

const ReportsTab = ({ reports }: { reports: Report[] }) => (
    <Card>
        <CardHeader><CardTitle className="font-headline">Daily Reports</CardTitle><CardDescription>A complete log of all submitted daily reports.</CardDescription></CardHeader>
        <CardContent>
            {reports.length > 0 ? (
                <Accordion type="multiple" className="space-y-4">
                    {reports.map(report => (
                         <AccordionItem key={report.id} value={report.id} className="border rounded-lg px-4 bg-muted/20">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex justify-between w-full items-center pr-4">
                                    <div>
                                        <p className="font-semibold">Report for {format(report.reportDate, 'PPP')}</p>
                                        <p className="text-sm text-muted-foreground">Submitted on {format(report.createdAt, 'PPP')}</p>
                                    </div>
                                    <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                                <Separator />
                                <div className="space-y-3"><h4 className="font-semibold flex items-center"><FileText className="mr-2 h-4 w-4" />Work Accomplished</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.declaredTasks}</p></div>
                                <div className="space-y-3"><h4 className="font-semibold flex items-center"><FileText className="mr-2 h-4 w-4" />Detailed Report</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.fullReport}</p></div>
                                {report.summary && <div className="space-y-3"><h4 className="font-semibold flex items-center"><Bot className="mr-2 h-4 w-4 text-primary"/>AI Summary</h4><p className="text-sm text-muted-foreground italic">{report.summary}</p></div>}
                                {report.supervisorComment && <div className="space-y-3"><h4 className="font-semibold flex items-center"><MessageSquare className="mr-2 h-4 w-4"/>Supervisor Feedback</h4><p className="text-sm text-muted-foreground italic">"{report.supervisorComment}"</p></div>}
                                {report.lecturerComment && <div className="space-y-3"><h4 className="font-semibold flex items-center"><MessageSquare className="mr-2 h-4 w-4"/>Lecturer Feedback</h4><p className="text-sm text-muted-foreground italic">"{report.lecturerComment}"</p></div>}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : <p className="text-center text-muted-foreground py-10">This student has not submitted any reports yet.</p>}
        </CardContent>
    </Card>
);

const TasksTab = ({ tasks }: { tasks: DailyTask[] }) => (
    <Card>
        <CardHeader><CardTitle className="font-headline">Declared Tasks</CardTitle><CardDescription>A log of all tasks declared by the student.</CardDescription></CardHeader>
        <CardContent>
            {tasks.length > 0 ? (
                <Accordion type="multiple" className="space-y-4">
                    {tasks.map(task => (
                        <AccordionItem key={task.id} value={task.id} className="border rounded-lg px-4 bg-muted/20">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex justify-between w-full items-center pr-4">
                                     <div>
                                        <p className="font-semibold">{task.description}</p>
                                        <p className="text-sm text-muted-foreground">Declared for {format(task.date, 'PPP')}</p>
                                    </div>
                                    <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                                <Separator />
                                <div className="space-y-2"><h4 className="font-semibold flex items-center"><ListTodo className="mr-2 h-4 w-4" />Learning Objectives</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.learningObjectives}</p></div>
                                {task.supervisorFeedback && <div className="space-y-2"><h4 className="font-semibold flex items-center"><MessageSquare className="mr-2 h-4 w-4" />Supervisor Feedback</h4><p className="text-sm text-muted-foreground italic">"{task.supervisorFeedback}"</p></div>}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : <p className="text-center text-muted-foreground py-10">This student has not declared any tasks yet.</p>}
        </CardContent>
    </Card>
);

const AttendanceTab = ({ checkIns }: { checkIns: CheckIn[] }) => (
    <Card>
        <CardHeader><CardTitle className="font-headline">Attendance History</CardTitle><CardDescription>A log of all daily check-ins.</CardDescription></CardHeader>
        <CardContent>
            <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Method</TableHead><TableHead>Details</TableHead></TableRow></TableHeader>
                <TableBody>
                    {checkIns.length > 0 ? (
                        checkIns.map(checkIn => (
                            <TableRow key={checkIn.id}>
                                <TableCell className="font-medium">{format(checkIn.timestamp, 'PPP')}</TableCell>
                                <TableCell>{format(checkIn.timestamp, 'p')}</TableCell>
                                <TableCell><Badge variant={checkIn.isGpsVerified ? 'default' : 'secondary'}>{checkIn.isGpsVerified ? 'GPS Verified' : 'Manual'}</Badge></TableCell>
                                <TableCell className="text-muted-foreground">{checkIn.isGpsVerified ? checkIn.address_resolved : checkIn.manualReason}</TableCell>
                            </TableRow>
                        ))
                    ) : <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No check-ins have been recorded.</TableCell></TableRow>}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const MetricDisplay = ({ label, value }: { label: string; value: number }) => (
    <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
            <Progress value={value * 10} className="w-32 h-2" />
            <span className="font-semibold text-sm">{value.toFixed(1)}/10</span>
        </div>
    </div>
);


const EvaluationCard = ({ title, icon: Icon, evaluation }: { title: string, icon: React.ElementType, evaluation: Evaluation }) => {
    const { metrics, comments, evaluatorName } = evaluation;
    const overallScore = (metrics.overall * 2).toFixed(1);
    
    return (
        <Card>
            <CardHeader><div className="flex items-center gap-3"><Icon className="w-6 h-6 text-primary" /><div><CardTitle className="font-headline text-xl">{title}</CardTitle><CardDescription>Feedback from {evaluatorName}</CardDescription></div></div></CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                    <MetricDisplay label="Technical Skills" value={metrics.technicalSkills * 2} />
                    <MetricDisplay label="Problem Solving" value={metrics.problemSolving * 2} />
                    <MetricDisplay label="Communication" value={metrics.communication * 2} />
                    <MetricDisplay label="Teamwork" value={metrics.teamwork * 2} />
                    <MetricDisplay label="Proactiveness" value={metrics.proactiveness * 2} />
                </div>
                 <div><h4 className="font-semibold mb-2 flex items-center gap-2"><MessageSquare className="w-4 h-4"/>Comments</h4><p className="text-sm text-muted-foreground italic p-3 rounded-md border">"{comments}"</p></div>
                <Separator />
                <div className="flex justify-end items-center gap-3"><p className="font-bold text-lg">Overall Score:</p><Badge variant="default" className="text-lg px-4 py-1">{overallScore} / 10</Badge></div>
            </CardContent>
        </Card>
    )
};

const evaluationSchema = z.object({
    metrics: z.object({
        technicalSkills: z.number().min(0).max(5), problemSolving: z.number().min(0).max(5),
        communication: z.number().min(0).max(5), teamwork: z.number().min(0).max(5), proactiveness: z.number().min(0).max(5),
    }),
    comments: z.string().min(10, 'Please provide some detailed comments.'),
});
type EvaluationFormValues = z.infer<typeof evaluationSchema>;

const LecturerEvaluationDialog = ({ studentId, onEvaluationSubmit }: { studentId: string, onEvaluationSubmit: () => void }) => {
    const { user } = useRole();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

     const form = useForm<EvaluationFormValues>({
        resolver: zodResolver(evaluationSchema),
        defaultValues: { metrics: { technicalSkills: 3, problemSolving: 3, communication: 3, teamwork: 3, proactiveness: 3 }, comments: '' },
    });
    
    const calculateOverall = (metrics: Omit<EvaluationMetrics, 'overall'>): number => (Object.values(metrics).reduce((a, b) => a + b, 0)) / Object.values(metrics).length;

    async function onSubmit(data: EvaluationFormValues) {
        if (!user?.uid || !user.role || !user.name) { toast({ title: 'Error', description: 'Could not identify evaluator.', variant: 'destructive' }); return; }
        setIsSubmitting(true);
        try {
            await createEvaluation({ studentId, evaluatorId: user.uid, evaluatorRole: user.role, evaluatorName: user.name, metrics: { ...data.metrics, overall: calculateOverall(data.metrics) }, comments: data.comments });
            toast({ title: 'Evaluation Submitted', description: 'Your final review has been recorded.' });
            form.reset();
            setIsOpen(false);
            onEvaluationSubmit();
        } catch (error: any) { toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
        } finally { setIsSubmitting(false); }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild><Button><Award className="mr-2 h-4 w-4" /> Submit Your Evaluation</Button></DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader><DialogTitle>Lecturer Evaluation</DialogTitle><DialogDescription>Provide your final assessment for this student.</DialogDescription></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <FormField control={form.control} name="metrics.technicalSkills" render={({ field }) => (<FormItem><FormLabel>Technical Skills - {field.value}/5</FormLabel><FormControl><Slider defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={5} step={1} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="metrics.problemSolving" render={({ field }) => (<FormItem><FormLabel>Problem Solving - {field.value}/5</FormLabel><FormControl><Slider defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={5} step={1} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="metrics.communication" render={({ field }) => (<FormItem><FormLabel>Communication - {field.value}/5</FormLabel><FormControl><Slider defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={5} step={1} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="metrics.teamwork" render={({ field }) => (<FormItem><FormLabel>Teamwork / Collaboration - {field.value}/5</FormLabel><FormControl><Slider defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={5} step={1} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="metrics.proactiveness" render={({ field }) => (<FormItem><FormLabel>Proactiveness / Initiative - {field.value}/5</FormLabel><FormControl><Slider defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={5} step={1} /></FormControl></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="comments" render={({ field }) => (<FormItem><FormLabel>Overall Comments</FormLabel><FormControl><Textarea rows={5} placeholder="Provide final remarks..." {...field} /></FormControl></FormItem>)} />
                        <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit Evaluation</Button></DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

const EvaluationsTab = ({ evaluations, studentId, refreshData }: { evaluations: Evaluation[], studentId: string, refreshData: () => void }) => {
    const supervisorEval = evaluations.find(e => e.evaluatorRole === 'supervisor');
    const lecturerEval = evaluations.find(e => e.evaluatorRole === 'lecturer');
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline">Performance Evaluations</CardTitle>
                            <CardDescription>Consolidated feedback from all stakeholders.</CardDescription>
                        </div>
                        {!lecturerEval && <LecturerEvaluationDialog studentId={studentId} onEvaluationSubmit={refreshData} />}
                    </div>
                </CardHeader>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {supervisorEval ? <EvaluationCard title="Supervisor Evaluation" icon={Briefcase} evaluation={supervisorEval} /> : <Card className="flex items-center justify-center flex-col min-h-[300px] text-center"><CardContent className="pt-6"><p className="text-muted-foreground">Supervisor evaluation has not been submitted yet.</p></CardContent></Card>}
                {lecturerEval ? <EvaluationCard title="Your Evaluation" icon={Award} evaluation={lecturerEval} /> : <Card className="flex items-center justify-center flex-col min-h-[300px] text-center"><CardContent className="pt-6"><p className="text-muted-foreground">You have not submitted your evaluation for this student yet.</p></CardContent></Card>}
            </div>
        </div>
    )
};


export default function LecturerStudentDetailPage({ params }: { params: { studentId: string } }) {
    const [details, setDetails] = useState<StudentDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const studentDetails = await getStudentDetails(params.studentId);
            if (!studentDetails) throw new Error("Student not found.");
            setDetails(studentDetails);
        } catch (e: any) {
            console.error("Failed to fetch student details:", e);
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [params.studentId]);

    if (isLoading) return <StudentDetailSkeleton />;

    if (error || !details) {
        return (
            <Card>
                <CardHeader><CardTitle>Student Not Found</CardTitle><CardDescription>{error || "The requested student could not be found."}</CardDescription></CardHeader>
                <CardContent><Button asChild variant="outline" className="mt-4"><Link href="/lecturer/students"><ArrowLeft className="mr-2 h-4 w-4" />Back to Students</Link></Button></CardContent>
            </Card>
        );
    }

    const { student, profile, reports, tasks, checkIns, evaluations } = details;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon"><Link href="/lecturer/students"><ArrowLeft className="h-4 w-4" /></Link></Button>
                <h1 className="text-2xl font-bold font-headline">Student Details: {student.fullName}</h1>
            </div>
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="mt-6"><ProfileTab student={student} profile={profile} /></TabsContent>
                <TabsContent value="reports" className="mt-6"><ReportsTab reports={reports} /></TabsContent>
                <TabsContent value="tasks" className="mt-6"><TasksTab tasks={tasks} /></TabsContent>
                <TabsContent value="attendance" className="mt-6"><AttendanceTab checkIns={checkIns} /></TabsContent>
                <TabsContent value="evaluations" className="mt-6"><EvaluationsTab evaluations={evaluations} studentId={student.uid} refreshData={fetchAllData} /></TabsContent>
            </Tabs>
        </div>
    );
}
