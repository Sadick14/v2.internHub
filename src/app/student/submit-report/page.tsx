
'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summarizeDailyReport, type SummarizeDailyReportInput } from "@/ai/flows/summarize-daily-report";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/hooks/use-role";
import { createReport, type NewReportData } from "@/services/reportsService";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getInternshipProfileByStudentId, type InternshipProfile } from "@/services/internshipProfileService";
import { InternshipGuard } from '@/components/guards/internship-guard';


export default function SubmitReportPage() {
  const { user } = useRole();
  const { toast } = useToast();
  const [profile, setProfile] = useState<InternshipProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  const [reportDate, setReportDate] = useState<Date | undefined>(new Date());
  
  const [formData, setFormData] = useState({
    declaredTasks: '',
    fullReport: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      if(user?.uid) {
        try {
           const profileData = await getInternshipProfileByStudentId(user.uid);
           setProfile(profileData);
        } catch (error) {
            toast({ title: "Error", description: "Could not load internship profile.", variant: "destructive"})
        }
      }
    }
    fetchProfile();
  }, [user, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateSummary = async () => {
    if (!formData.fullReport || !formData.declaredTasks) {
      toast({
        title: "Missing Information",
        description: "Please fill out declared tasks and the daily report.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    setSummary('');
    try {
      const input: SummarizeDailyReportInput = {
         dailyReport: formData.fullReport,
         declaredTasks: formData.declaredTasks,
         studentName: user?.name || 'Student',
         internshipCompany: profile?.companyName || 'N/A'
      };
      const result = await summarizeDailyReport(input);
      setSummary(result.summary);
      toast({ title: "Summary Generated!", description: "AI summary has been created below."})
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!user || !profile || !reportDate) {
       toast({ title: "Error", description: "Cannot submit report. User profile or internship details are missing.", variant: "destructive"});
       return;
    }
     if(!formData.fullReport || !formData.declaredTasks) {
        toast({ title: "Missing Information", description: "Please fill out the 'Work Accomplished' and 'Detailed Report' fields.", variant: "destructive"});
       return;
    }

    setIsSubmitting(true);
    try {
        const reportData: Omit<NewReportData, 'lecturerId'> = {
            studentId: user.uid,
            internshipId: profile.id,
            reportDate: reportDate,
            declaredTasks: formData.declaredTasks,
            fullReport: formData.fullReport,
            summary: summary, // Pass summary, even if it's empty
        };
        await createReport(reportData);
        toast({ title: "Report Submitted!", description: "Your daily report has been sent for review."});
        // Reset form
        setFormData({ declaredTasks: '', fullReport: '' });
        setSummary('');
        setReportDate(new Date());

    } catch (error: any) {
         toast({ title: "Submission Failed", description: error.message, variant: "destructive"});
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <InternshipGuard>
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Submit Daily Report to Lecturer</CardTitle>
            <CardDescription>
              Fill in your tasks and report for the day. This will be sent to your assigned university lecturer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reportDate">Report Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !reportDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {reportDate ? format(reportDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center" side="bottom">
                      <Calendar mode="single" selected={reportDate} onSelect={setReportDate} initialFocus />
                  </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="declaredTasks">Work Accomplished Today</Label>
              <Textarea
                id="declaredTasks"
                name="declaredTasks"
                placeholder="e.g., - Implemented the new login UI&#x0a;- Attended the team sync meeting"
                value={formData.declaredTasks}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullReport">Detailed Report</Label>
              <Textarea
                id="fullReport"
                name="fullReport"
                placeholder="Provide a detailed account of the work you've done today, including challenges and learnings for your lecturer."
                value={formData.fullReport}
                onChange={handleInputChange}
                rows={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments (Optional)</Label>
              <Input id="attachments" type="file" />
            </div>
            <Button type="submit" disabled={isSubmitting || isGenerating}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline">AI Report Summary</CardTitle>
                  <CardDescription>
                    (Optional) Generate a summary of your report to assist you.
                  </CardDescription>
                </div>
                <Button type="button" onClick={handleGenerateSummary} disabled={isGenerating || !formData.fullReport || !formData.declaredTasks} variant="outline" size="icon">
                  <Wand2 className="h-5 w-5" />
                  <span className="sr-only">Generate Summary</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="min-h-[200px]">
              {isGenerating ? (
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : summary ? (
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
                  <p>{summary}</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground pt-12">
                  <Wand2 className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">Click the magic wand to generate a summary.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
    </InternshipGuard>
  );
}
