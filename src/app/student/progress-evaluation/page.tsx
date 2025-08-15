
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from '@/hooks/use-role';
import { getInternshipProfileByStudentId, type InternshipProfile } from '@/services/internshipProfileService';
import { getCheckInsByStudentId, type CheckIn } from '@/services/checkInService';
import { getReportsByStudentId, type Report } from '@/services/reportsService';
import { getAllTasksByStudentId, type DailyTask } from '@/services/tasksService';
import { getEvaluationsForStudent, type Evaluation, type EvaluationMetrics } from '@/services/evaluationsService';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { differenceInBusinessDays } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Award, Briefcase, UserCheck, MessageSquare, CheckCircle, ClipboardList, CalendarCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle className="font-headline text-xl">{title}</CardTitle>
                        <CardDescription>Feedback from {evaluatorName}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                    <MetricDisplay label="Technical Skills" value={metrics.technicalSkills * 2} />
                    <MetricDisplay label="Problem Solving" value={metrics.problemSolving * 2} />
                    <MetricDisplay label="Communication" value={metrics.communication * 2} />
                    <MetricDisplay label="Teamwork" value={metrics.teamwork * 2} />
                    <MetricDisplay label="Proactiveness" value={metrics.proactiveness * 2} />
                </div>
                 <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><MessageSquare className="w-4 h-4"/>Comments</h4>
                    <p className="text-sm text-muted-foreground italic p-3 rounded-md border">"{comments}"</p>
                </div>
                <Separator />
                <div className="flex justify-end items-center gap-3">
                     <p className="font-bold text-lg">Overall Score:</p>
                    <Badge variant="default" className="text-lg px-4 py-1">{overallScore} / 10</Badge>
                </div>
            </CardContent>
        </Card>
    )
};


export default function ProgressEvaluationPage() {
    const { user } = useRole();
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<InternshipProfile | null>(null);
    const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [tasks, setTasks] = useState<DailyTask[]>([]);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

    useEffect(() => {
        async function fetchData() {
            if (!user?.uid) return;
            setIsLoading(true);

            try {
                const [profileData, checkInData, reportsData, tasksData, evaluationsData] = await Promise.all([
                    getInternshipProfileByStudentId(user.uid),
                    getCheckInsByStudentId(user.uid),
                    getReportsByStudentId(user.uid),
                    getAllTasksByStudentId(user.uid),
                    getEvaluationsForStudent(user.uid)
                ]);

                setProfile(profileData);
                setCheckIns(checkInData);
                setReports(reportsData);
                setTasks(tasksData);
                setEvaluations(evaluationsData);

            } catch (error) {
                console.error("Failed to fetch evaluation data", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [user]);
    
    if (isLoading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }
    
    if (!profile) {
        return (
            <Card>
                <CardHeader><CardTitle>Profile Not Found</CardTitle></CardHeader>
                <CardContent><p>Your internship profile could not be loaded. Please complete it on the 'Internship Profile' page.</p></CardContent>
            </Card>
        )
    }

    const totalDays = differenceInBusinessDays(new Date(profile.endDate), new Date(profile.startDate));
    const attendanceScore = totalDays > 0 ? (checkIns.length / totalDays) * 100 : 0;
    const reportsScore = totalDays > 0 ? (reports.length / totalDays) * 100 : 0;
    const approvedTasks = tasks.filter(t => t.status === 'Approved').length;
    const taskCompletionScore = tasks.length > 0 ? (approvedTasks / tasks.length) * 100 : 0;

    const supervisorEval = evaluations.find(e => e.evaluatorRole === 'supervisor');
    const lecturerEval = evaluations.find(e => e.evaluatorRole === 'lecturer');
    const adminEval = evaluations.find(e => e.evaluatorRole === 'admin');

    const StatCard = ({ icon: Icon, title, value, description }: {icon: React.ElementType, title: string, value: string, description: string}) => (
        <Card className="text-center">
            <CardContent className="pt-6">
                <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-r from-primary/80 to-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Your Performance Summary</CardTitle>
                    <CardDescription className="text-primary-foreground/90">An overview of your performance throughout the internship.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <StatCard icon={CalendarCheck} title="Attendance" value={`${attendanceScore.toFixed(0)}%`} description={`${checkIns.length} / ${totalDays} days`} />
                 <StatCard icon={ClipboardList} title="Report Submission" value={`${reportsScore.toFixed(0)}%`} description={`${reports.length} / ${totalDays} reports`} />
                 <StatCard icon={CheckCircle} title="Task Completion" value={`${taskCompletionScore.toFixed(0)}%`} description={`${approvedTasks} / ${tasks.length} tasks approved`} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {supervisorEval ? (
                    <EvaluationCard title="Supervisor Evaluation" icon={Briefcase} evaluation={supervisorEval} />
                ) : (
                    <Card className="flex items-center justify-center flex-col min-h-[300px] text-center"><CardContent className="pt-6"><p className="text-muted-foreground">Supervisor evaluation has not been submitted yet.</p></CardContent></Card>
                )}

                {lecturerEval ? (
                    <EvaluationCard title="Lecturer Evaluation" icon={UserCheck} evaluation={lecturerEval} />
                ) : (
                     <Card className="flex items-center justify-center flex-col min-h-[300px] text-center"><CardContent className="pt-6"><p className="text-muted-foreground">Lecturer evaluation has not been submitted yet.</p></CardContent></Card>
                )}
            </div>

            {adminEval &&
                <EvaluationCard title="Final Admin Review" icon={Award} evaluation={adminEval} />
            }
        </div>
    )
}
