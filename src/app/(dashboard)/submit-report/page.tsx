'use client'
import { useState } from "react";
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

export default function SubmitReportPage() {
  const { user } = useRole();
  const [formData, setFormData] = useState<SummarizeDailyReportInput>({
    dailyReport: '',
    declaredTasks: '',
    studentName: user?.name || '',
    internshipCompany: 'Innovate LLC',
  });
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateSummary = async () => {
    if (!formData.dailyReport || !formData.declaredTasks) {
      toast({
        title: "Missing Information",
        description: "Please fill out declared tasks and the daily report.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setSummary('');
    try {
      const result = await summarizeDailyReport({...formData, studentName: user?.name || 'Student'});
      setSummary(result.summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Submit Daily Report</CardTitle>
          <CardDescription>
            Fill in your tasks and report for the day. Use the AI tool to generate a summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="declaredTasks">Declared Tasks for Today</Label>
            <Textarea
              id="declaredTasks"
              name="declaredTasks"
              placeholder="e.g., - Implemented the new login UI&#x0a;- Attended the team sync meeting"
              value={formData.declaredTasks}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dailyReport">Full Daily Report</Label>
            <Textarea
              id="dailyReport"
              name="dailyReport"
              placeholder="Provide a detailed account of the work you've done today, including challenges and learnings."
              value={formData.dailyReport}
              onChange={handleInputChange}
              rows={8}
            />
          </div>
          <div className="space-y-2">
             <Label htmlFor="attachments">Attachments (Optional)</Label>
             <Input id="attachments" type="file" />
          </div>
          <Button disabled={isLoading}>Submit Report</Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline">AI Report Summary</CardTitle>
                <CardDescription>
                  Generate a summary of your report.
                </CardDescription>
              </div>
              <Button onClick={handleGenerateSummary} disabled={isLoading || !formData.dailyReport || !formData.declaredTasks} variant="outline" size="icon">
                <Wand2 className="h-5 w-5" />
                <span className="sr-only">Generate Summary</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="min-h-[200px]">
            {isLoading ? (
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
  );
}
