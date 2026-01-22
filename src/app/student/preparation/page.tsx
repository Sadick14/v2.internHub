'use client';

import { useRole } from '@/hooks/use-role';
import { useInternshipAccess } from '@/hooks/use-internship-access';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Target,
  Briefcase,
  Users,
  FileText,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Shield,
  MessageSquare,
  Award
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function PreparationPage() {
  const { user } = useRole();
  const access = useInternshipAccess(user?.uid);

  if (access.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!access.profile) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Internship Profile</AlertTitle>
        <AlertDescription>
          Please complete your internship setup before accessing preparation materials.
        </AlertDescription>
      </Alert>
    );
  }

  const preparationTips = [
    {
      icon: Target,
      title: "Set Clear Goals",
      description: "Define what you want to achieve during your internship. Set specific, measurable objectives.",
      items: [
        "Learn specific technical skills",
        "Build professional network",
        "Complete assigned projects successfully",
        "Understand industry best practices"
      ]
    },
    {
      icon: Users,
      title: "Professional Etiquette",
      description: "Learn workplace norms and professional behavior expectations.",
      items: [
        "Arrive on time (or join virtual meetings promptly)",
        "Dress appropriately for the workplace",
        "Communicate clearly and professionally",
        "Respect company policies and confidentiality"
      ]
    },
    {
      icon: Clock,
      title: "Time Management",
      description: "Develop strategies to manage your time effectively during the internship.",
      items: [
        "Prioritize tasks based on urgency and importance",
        "Break large projects into smaller tasks",
        "Use daily check-ins to track progress",
        "Balance learning with productivity"
      ]
    },
    {
      icon: FileText,
      title: "Documentation Habits",
      description: "Build good documentation practices for your daily work.",
      items: [
        "Keep detailed daily reports of your activities",
        "Document problems and solutions",
        "Track your learning and growth",
        "Maintain a portfolio of completed work"
      ]
    }
  ];

  const platformFeatures = [
    {
      icon: CheckCircle2,
      title: "Daily Check-in",
      description: "Mark your attendance and log your work hours each day."
    },
    {
      icon: FileText,
      title: "Daily Reports",
      description: "Submit detailed reports of your daily tasks and accomplishments."
    },
    {
      icon: Target,
      title: "Task Management",
      description: "Track assigned tasks from your supervisor and lecturer."
    },
    {
      icon: TrendingUp,
      title: "Progress Evaluation",
      description: "Receive feedback and evaluations on your performance."
    },
    {
      icon: Award,
      title: "Analytics Dashboard",
      description: "Monitor your progress with comprehensive analytics and achievements."
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="font-headline text-2xl">Internship Preparation</CardTitle>
              <CardDescription>
                Get ready for your upcoming internship at {access.profile.companyName}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Calendar className="h-4 w-4 mr-2" />
              {access.daysUntilStart} {access.daysUntilStart === 1 ? 'day' : 'days'} until start
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Internship Details</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1">
                <p><strong>Company:</strong> {access.profile.companyName}</p>
                <p><strong>Location:</strong> {access.profile.companyAddress}</p>
                <p><strong>Supervisor:</strong> {access.profile.supervisorName}</p>
                <p><strong>Start Date:</strong> {format(new Date(access.profile.startDate), 'MMMM dd, yyyy')}</p>
                <p><strong>End Date:</strong> {format(new Date(access.profile.endDate), 'MMMM dd, yyyy')}</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Time until start</span>
              <span className="font-medium">{access.daysUntilStart} days remaining</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="preparation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preparation">Preparation Tips</TabsTrigger>
          <TabsTrigger value="platform">Platform Guide</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Preparation Tips */}
        <TabsContent value="preparation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Essential Preparation Tips</CardTitle>
              <CardDescription>
                Key areas to focus on before your internship begins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {preparationTips.map((tip, index) => (
                <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <tip.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{tip.title}</h3>
                      <p className="text-muted-foreground mb-3">{tip.description}</p>
                      <ul className="space-y-2">
                        {tip.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Guide */}
        <TabsContent value="platform" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How to Use InternHub</CardTitle>
              <CardDescription>
                Learn about the features you'll use during your internship
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {platformFeatures.map((feature, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <feature.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert className="mt-6">
                <Shield className="h-4 w-4" />
                <AlertTitle>Important Note</AlertTitle>
                <AlertDescription>
                  All features will be accessible once your internship start date arrives. 
                  Use this time to familiarize yourself with the platform and prepare for success.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Daily Workflow Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Typical Daily Workflow</CardTitle>
              <CardDescription>What to expect during a normal internship day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Morning Check-in</h4>
                    <p className="text-sm text-muted-foreground">
                      Start your day by checking in on InternHub. Log your arrival time.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Review Tasks</h4>
                    <p className="text-sm text-muted-foreground">
                      Check your assigned tasks from supervisor and lecturer.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Work & Learn</h4>
                    <p className="text-sm text-muted-foreground">
                      Focus on your internship tasks while documenting your work.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold">End of Day Report</h4>
                    <p className="text-sm text-muted-foreground">
                      Submit your daily report detailing what you accomplished and learned.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Resources</CardTitle>
              <CardDescription>
                Recommended materials to help you prepare
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Professional Development
                </h3>
                <ul className="space-y-2 ml-7">
                  <li className="text-sm">
                    <strong>Communication Skills:</strong> Practice clear, concise written and verbal communication
                  </li>
                  <li className="text-sm">
                    <strong>Problem-Solving:</strong> Develop analytical thinking and solution-oriented mindset
                  </li>
                  <li className="text-sm">
                    <strong>Collaboration:</strong> Learn to work effectively in team environments
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Technical Preparation
                </h3>
                <ul className="space-y-2 ml-7">
                  <li className="text-sm">
                    Review fundamental concepts in your field of study
                  </li>
                  <li className="text-sm">
                    Research the company's industry and technologies they use
                  </li>
                  <li className="text-sm">
                    Prepare questions to ask your supervisor
                  </li>
                  <li className="text-sm">
                    Set up necessary development tools or software
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Communication Tips
                </h3>
                <ul className="space-y-2 ml-7">
                  <li className="text-sm">
                    Don't hesitate to ask questions when you don't understand something
                  </li>
                  <li className="text-sm">
                    Keep your supervisor and lecturer informed of your progress
                  </li>
                  <li className="text-sm">
                    Request feedback regularly to improve your performance
                  </li>
                  <li className="text-sm">
                    Document challenges and how you overcame them
                  </li>
                </ul>
              </div>

              <Alert>
                <Award className="h-4 w-4" />
                <AlertTitle>Success Mindset</AlertTitle>
                <AlertDescription>
                  Approach your internship with enthusiasm, curiosity, and professionalism. 
                  Every day is an opportunity to learn and grow. Make the most of this experience!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
