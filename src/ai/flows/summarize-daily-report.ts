'use server';
/**
 * @fileOverview A daily report summarization AI agent.
 *
 * - summarizeDailyReport - A function that summarizes a daily report.
 * - SummarizeDailyReportInput - The input type for the summarizeDailyReport function.
 * - SummarizeDailyReportOutput - The return type for the summarizeDailyReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDailyReportInputSchema = z.object({
  dailyReport: z.string().describe('The full text of the daily report to summarize.'),
  declaredTasks: z.string().describe('A list of the declared tasks for the day.'),
  studentName: z.string().describe('The name of the student.'),
  internshipCompany: z.string().describe('The name of the internship company.'),
});
export type SummarizeDailyReportInput = z.infer<typeof SummarizeDailyReportInputSchema>;

const SummarizeDailyReportOutputSchema = z.object({
  summary: z.string().describe('A summary of the daily report, highlighting key accomplishments and learning outcomes.'),
});
export type SummarizeDailyReportOutput = z.infer<typeof SummarizeDailyReportOutputSchema>;

export async function summarizeDailyReport(input: SummarizeDailyReportInput): Promise<SummarizeDailyReportOutput> {
  return summarizeDailyReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDailyReportPrompt',
  input: {schema: SummarizeDailyReportInputSchema},
  output: {schema: SummarizeDailyReportOutputSchema},
  prompt: `You are an AI assistant that summarizes daily work reports for interns. Your goal is to provide a concise and informative summary that highlights the intern's key accomplishments and learning outcomes.

  Student Name: {{{studentName}}}
  Internship Company: {{{internshipCompany}}}
  Declared Tasks: {{{declaredTasks}}}

  Please provide a summary of the following daily report:
  {{{dailyReport}}}

  Focus on extracting the most important information and presenting it in a clear and easy-to-understand manner. The summary should be no more than 200 words.
`,
});

const summarizeDailyReportFlow = ai.defineFlow(
  {
    name: 'summarizeDailyReportFlow',
    inputSchema: SummarizeDailyReportInputSchema,
    outputSchema: SummarizeDailyReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
