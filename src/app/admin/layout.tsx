
'use client';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Building,
  Send,
  CalendarClock,
  Shield,
  UserCheck,
  User,
  FileText,
  GraduationCap
} from 'lucide-react';

import { UserNav } from '@/components/layout/user-nav';
import { useRole } from '@/hooks/use-role';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { NotificationBell } from '@/components/layout/notification-bell';

export default function AdminLayout({ children }: { children: ReactNode }) {
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
      } else if (role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, role, router, isMounted]);


  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/students', label: 'Students', icon: User },
    { href: '/admin/reports', label: 'Reports', icon: FileText },
    { href: '/admin/invite-user', label: 'Invite User', icon: Send },
    { href: '/admin/assign-lecturers', label: 'Assign Lecturers', icon: UserCheck },
    { href: '/admin/university-structure', label: 'University Structure', icon: Building },
    { href: '/admin/internship-terms', label: 'Internship Terms', icon: CalendarClock },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: Shield },
  ];

  if (!isMounted || loading || !user) {
    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
           <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary animate-spin">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <p className="text-muted-foreground">Loading Admin Dashboard...</p>
            </div>
          </div>
        </main>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href='/admin/dashboard' className="flex items-center">
            <div className="bg-primary p-2 rounded-lg">
                <GraduationCap className="text-white text-2xl logo-icon"/>
            </div>
            <h1 className="text-xl font-bold ml-3 text-gray-800 logo-text">Intern Hub</h1>
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
         <header className="bg-white shadow-sm z-30">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center">
                    <SidebarTrigger />
                    <h2 className="text-xl font-semibold text-gray-800 ml-4">Admin Dashboard</h2>
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
