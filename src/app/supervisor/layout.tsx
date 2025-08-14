
'use client';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  Home,
  Users,
  ListChecks,
  Award,
  GraduationCap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/layout/user-nav';
import { useRole } from '@/hooks/use-role';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

export default function SupervisorLayout({ children }: { children: ReactNode }) {
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
      } else if (role !== 'supervisor') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, role, router, isMounted]);


  const navItems = [
    { href: '/supervisor/dashboard', label: 'Dashboard', icon: Home },
    { href: '/supervisor/tasks', label: 'Daily Tasks', icon: ListChecks, badge: '2' },
    { href: '/supervisor/interns', label: 'My Interns', icon: Users },
    { href: '/supervisor/evaluate-student', label: 'Evaluate Interns', icon: Award },
  ];

  if (!isMounted || loading || !user) {
    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
           <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary animate-spin">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <p className="text-muted-foreground">Loading Supervisor Dashboard...</p>
            </div>
          </div>
        </main>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
           <Link href='/supervisor/dashboard' className="flex items-center gap-2 font-bold text-2xl text-primary bg-white p-2 rounded-lg justify-center group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10">
                <GraduationCap className="h-8 w-8 text-primary group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" />
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
                     {item.badge && <Badge className="ml-auto bg-background text-primary hover:bg-background/90">{item.badge}</Badge>}
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
