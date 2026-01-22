'use client';

import { ReactNode } from 'react';
import { useRole } from '@/hooks/use-role';
import { useInternshipAccess } from '@/hooks/use-internship-access';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar, Lock, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface InternshipGuardProps {
  children: ReactNode;
  requireInternship?: boolean;
}

export function InternshipGuard({ children, requireInternship = true }: InternshipGuardProps) {
  const { user } = useRole();
  const access = useInternshipAccess(user?.uid);

  if (access.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // No profile - needs to set up internship
  if (!access.profile) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <CardTitle>Internship Setup Required</CardTitle>
          </div>
          <CardDescription>
            You need to complete your internship setup before accessing this feature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Please set up your internship profile to access daily activities and tracking features.
            </AlertDescription>
          </Alert>
          <Link href="/student/internship-setup">
            <Button className="mt-4">
              Complete Internship Setup
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Internship ended
  if (access.hasEnded) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <CardTitle>Internship Completed</CardTitle>
          </div>
          <CardDescription>
            Your internship at {access.profile.companyName} has ended.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p>Internship ended on: <strong>{format(new Date(access.profile.endDate), 'MMMM dd, yyyy')}</strong></p>
                <p>You can view your past reports and performance in the Analytics section.</p>
              </div>
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Link href="/student/reports">
              <Button variant="outline">View Reports</Button>
            </Link>
            <Link href="/student/progress">
              <Button variant="outline">View Analytics</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Internship not started yet
  if (!access.hasStarted && requireInternship) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-6 w-6 text-primary" />
            <CardTitle>Internship Not Started</CardTitle>
          </div>
          <CardDescription>
            Your internship activities will be available once your start date arrives.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertTitle>Upcoming Internship</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                <p><strong>Company:</strong> {access.profile.companyName}</p>
                <p><strong>Start Date:</strong> {format(new Date(access.profile.startDate), 'MMMM dd, yyyy')}</p>
                <p className="text-lg font-semibold text-primary">
                  Starting in {access.daysUntilStart} {access.daysUntilStart === 1 ? 'day' : 'days'}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-2">Prepare for Success</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Use this time to prepare for your internship. Learn about professional expectations, 
                  time management, and how to use InternHub effectively.
                </p>
                <Link href="/student/preparation">
                  <Button>
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Preparation Guide
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // All checks passed - render children
  return <>{children}</>;
}
