
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

  const renderLoading = () => (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Skeleton className="h-full w-full" />
    </main>
  );

  if (loading) {
    return renderLoading();
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
      // Fallback for when role is not determined yet or is null.
      // This also handles the initial render before the role is available.
      return renderLoading();
  }
}
