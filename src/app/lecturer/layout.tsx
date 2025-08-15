
'use client';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  FileText,
  Home,
  Users,
  LogIn,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { UserNav } from '@/components/layout/user-nav';
import { useRole } from '@/hooks/use-role';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { NotificationBell } from '@/components/layout/notification-bell';
import { getReportsByLecturer } from '@/services/reportsService';

export default function LecturerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, role } = useRole();

  useEffect(() => {
    if (loading) {
      return; // Wait for the auth state to be determined
    }

    if (!user) {
      router.push('/login');
    } else if (role !== 'lecturer') {
      // If role is determined and it's not lecturer, redirect
      router.push('/dashboard');
    }
  }, [user, loading, role, router]);

  const navItems = [
    { href: '/lecturer/dashboard', label: 'Dashboard', icon: Home },
    { href: '/lecturer/students', label: 'My Students', icon: Users },
    { href: '/lecturer/check-ins', label: 'Check-ins', icon: LogIn },
  ];

  if (loading || !user || role !== 'lecturer') {
    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
           <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary animate-spin">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <p className="text-muted-foreground">Loading Lecturer Dashboard...</p>
            </div>
          </div>
        </main>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href='/lecturer/dashboard' className="flex items-center gap-2 font-semibold text-primary-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <span className="font-headline group-data-[collapsible=icon]:hidden">InternshipTrack</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map(item => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <UserNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
         <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-card px-4 sm:px-6">
            <SidebarTrigger className="md:hidden" />
             <div className="flex w-full items-center gap-4 justify-end">
                <NotificationBell />
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
