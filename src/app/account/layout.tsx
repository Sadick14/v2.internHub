
'use client';
import type { ReactNode } from 'react';
import { useRole } from '@/hooks/use-role';
import AdminLayout from '@/app/admin/layout';
import StudentLayout from '@/app/student/layout';
import LecturerLayout from '@/app/lecturer/layout';
import SupervisorLayout from '@/app/supervisor/layout';
import HODLayout from '@/app/hod/layout';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { role, loading } = useRole();

  if (loading) {
    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
           <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary animate-spin">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <p className="text-muted-foreground">Loading Account...</p>
            </div>
          </div>
        </main>
    );
  }

  // Choose the layout based on the user's role
  switch (role) {
    case 'admin':
      return <AdminLayout>{children}</AdminLayout>;
    case 'student':
      return <StudentLayout>{children}</StudentLayout>;
    case 'lecturer':
      return <LecturerLayout>{children}</LecturerLayout>;
    case 'supervisor':
      return <SupervisorLayout>{children}</SupervisorLayout>;
    case 'hod':
      return <HODLayout>{children}</HODLayout>;
    default:
      // Fallback for when role is not determined yet or is null
      return (
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Skeleton className="h-full w-full" />
        </main>
      );
  }
}
