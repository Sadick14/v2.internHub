
'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/use-role';
import { getInternsBySupervisor, type UserProfile } from '@/services/userService';
import { createEvaluation, type EvaluationMetrics } from '@/services/evaluationsService';
import { Loader2 } from 'lucide-react';

const evaluationSchema = z.object({
    studentId: z.string().min(1, 'You must select a student.'),
    metrics: z.object({
        technicalSkills: z.number().min(0).max(5),
        problemSolving: z.number().min(0).max(5),
        communication: z.number().min(0).max(5),
        teamwork: z.number().min(0).max(5),
        proactiveness: z.number().min(0).max(5),
    }),
    comments: z.string().min(10, 'Please provide some detailed comments.'),
});

type EvaluationFormValues = z.infer<typeof evaluationSchema>;

export default function EvaluateStudentPage() {
    const { user } = useRole();
    const { toast } = useToast();
    const [interns, setInterns] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchInterns() {
            if (!user?.uid) return;
            setIsLoading(true);
            try {
                const internsData = await getInternsBySupervisor(user.uid);
                setInterns(internsData);
            } catch (error) {
                toast({ title: 'Error', description: 'Failed to fetch your interns.', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        }
        fetchInterns();
    }, [user, toast]);

    const form = useForm<EvaluationFormValues>({
        resolver: zodResolver(evaluationSchema),
        defaultValues: {
            studentId: '',
            metrics: {
                technicalSkills: 3,
                problemSolving: 3,
                communication: 3,
                teamwork: 3,
                proactiveness: 3,
            },
            comments: '',
        },
    });
    
    const calculateOverall = (metrics: Omit<EvaluationMetrics, 'overall'>): number => {
        const values = Object.values(metrics);
        const sum = values.reduce((acc, val) => acc + val, 0);
        return sum / values.length;
    };

    async function onSubmit(data: EvaluationFormValues) {
        if (!user?.uid || !user.role || !user.name) {
            toast({ title: 'Error', description: 'Could not identify evaluator. Please log in again.', variant: 'destructive' });
            return;
        }
        setIsSubmitting(true);
        try {
            const overallScore = calculateOverall(data.metrics);
            await createEvaluation({
                studentId: data.studentId,
                evaluatorId: user.uid,
                evaluatorRole: user.role,
                evaluatorName: user.name,
                metrics: { ...data.metrics, overall: overallScore },
                comments: data.comments,
            });
            toast({
                title: 'Evaluation Submitted',
                description: 'Thank you for providing your feedback.',
            });
            form.reset();
        } catch (error: any) {
            toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    }

    const MetricSlider = ({ name, label }: { name: `metrics.${keyof Omit<EvaluationMetrics, 'overall'>}`, label: string }) => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label} - {field.value}/5</FormLabel>
                    <FormControl>
                        <Slider
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            max={5}
                            step={1}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    );


    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Intern Evaluation Form</CardTitle>
                <CardDescription>Provide your assessment of the intern's performance. This will be shared with the student and the university.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="studentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Intern</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isLoading ? 'Loading interns...' : 'Select an intern to evaluate'} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {interns.length > 0 ? interns.map((intern) => (
                                                <SelectItem key={intern.uid} value={intern.uid}>{intern.fullName}</SelectItem>
                                            )) : <div className="p-4 text-center text-sm text-muted-foreground">No interns found.</div>}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <MetricSlider name="metrics.technicalSkills" label="Technical Skills" />
                             <MetricSlider name="metrics.problemSolving" label="Problem Solving" />
                             <MetricSlider name="metrics.communication" label="Communication" />
                             <MetricSlider name="metrics.teamwork" label="Teamwork / Collaboration" />
                             <MetricSlider name="metrics.proactiveness" label="Proactiveness / Initiative" />
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="comments"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Overall Comments</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={6}
                                            placeholder="Provide specific examples and constructive feedback..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isSubmitting || isLoading}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Evaluation
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
