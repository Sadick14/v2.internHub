
'use client';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  Briefcase,
  CalendarCheck,
  MapPin,
  ClipboardList,
  FileText,
  TrendingUp,
  ListTodo,
  Users,
  GraduationCap
} from 'lucide-react';

import { UserNav } from '@/components/layout/user-nav';
import { useRole } from '@/hooks/use-role';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from '@/components/ui/sidebar';
import { NotificationBell } from '@/components/layout/notification-bell';

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
    { href: '/student/supervisors', label: 'Supervisors', icon: Users },
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
      <Sidebar>
        <SidebarHeader>
           <Link href='/student/dashboard' className="flex items-center">
             <div className="bg-primary p-2 rounded-lg">
                <GraduationCap className="text-white text-2xl logo-icon"/>
            </div>
            <h1 className="text-xl font-bold ml-3 text-gray-800 logo-text">Intern Hub</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item, index) => (
              item.type === 'separator' ? 
              <SidebarSeparator key={index} /> :
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
         <header className="bg-white shadow-sm z-30">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center">
                    <SidebarTrigger />
                    <h2 className="text-xl font-semibold text-gray-800 ml-4">Student Dashboard</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <NotificationBell />
                </div>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
