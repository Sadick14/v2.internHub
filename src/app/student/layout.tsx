
'use client';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  Home,
  Briefcase,
  CalendarCheck,
  MapPin,
  ClipboardList,
  FileText,
  TrendingUp,
  ListTodo,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/layout/user-nav';
import { useRole } from '@/hooks/use-role';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from '@/components/ui/sidebar';

export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, role } = useRole();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && isMounted) {
      if (!user) {
        router.push('/login');
      } else if (role !== 'student') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, role, router, isMounted]);


  const navItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: Home },
    { href: '/student/internship-setup', label: 'Internship Profile', icon: Briefcase },
    { type: 'separator', label: 'Daily Activities' },
    { href: '/student/daily-check-in', label: 'Daily Check-in', icon: MapPin },
    { href: '/student/daily-tasks', label: 'Declare Daily Tasks', icon: ListTodo },
    { href: '/student/submit-report', label: 'Submit Daily Report', icon: FileText },
    { type: 'separator', label: 'History & Progress' },
    { href: '/student/attendance', label: 'Attendance History', icon: CalendarCheck },
    { href: '/student/reports', label: 'Report History', icon: ClipboardList },
    { href: '/student/progress-evaluation', label: 'Progress Evaluation', icon: TrendingUp },
  ];

  if (loading || !isMounted || !user) {
    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
           <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary animate-spin">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <p className="text-muted-foreground">Loading Student Dashboard...</p>
            </div>
          </div>
        </main>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href='/student/dashboard' className="flex items-center gap-2 font-semibold text-primary-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <span className="font-headline group-data-[collapsible=icon]:hidden">InternshipTrack</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item, index) => (
              item.type === 'separator' ? 
              <SidebarSeparator key={index} className="my-1" /> :
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href!)} tooltip={item.label}>
                  <Link href={item.href!}>
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
                <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Toggle notifications</span>
                </Button>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
