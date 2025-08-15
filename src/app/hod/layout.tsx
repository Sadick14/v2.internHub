
'use client';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  FileText,
  Home,
  LineChart,
  Users,
  GraduationCap
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { UserNav } from '@/components/layout/user-nav';
import { useRole } from '@/hooks/use-role';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { NotificationBell } from '@/components/layout/notification-bell';

export default function HODLayout({ children }: { children: ReactNode }) {
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
      } else if (role !== 'hod') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, role, router, isMounted]);


  const navItems = [
    { href: '/hod/dashboard', label: 'Dashboard', icon: Home },
    { href: '/hod/reports', label: 'Reports', icon: FileText, badge: '6' },
    { href: '/hod/students', label: 'Students', icon: Users },
    { href: '/hod/analytics', label: 'Analytics', icon: LineChart },
  ];

  if (!isMounted || loading || !user) {
    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
           <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <GraduationCap className="h-10 w-10 text-primary animate-spin"/>
              <p className="text-muted-foreground">Loading HOD Dashboard...</p>
              <svg width="200" height="40" viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg" className="text-primary/20">
                    <circle cx="25" cy="20" r="4" >
                        <animate attributeName="r" from="4" to="8" dur="0.8s" begin="0s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="1" to="0.5" dur="0.8s" begin="0s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="75" cy="20" r="4">
                        <animate attributeName="r" from="4" to="8" dur="0.8s" begin="0.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="1" to="0.5" dur="0.8s" begin="0.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="125" cy="20" r="4">
                        <animate attributeName="r" from="4" to="8" dur="0.8s" begin="0.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="1" to="0.5" dur="0.8s" begin="0.4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="175" cy="20" r="4">
                        <animate attributeName="r" from="4" to="8" dur="0.8s" begin="0.6s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="1" to="0.5" dur="0.8s" begin="0.6s" repeatCount="indefinite" />
                    </circle>
                </svg>
            </div>
          </div>
        </main>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href='/hod/dashboard' className="flex items-center">
             <div className="bg-white/20 p-2 rounded-lg">
                <GraduationCap className="text-white text-2xl logo-icon"/>
            </div>
            <h1 className="text-xl font-bold ml-3 text-white logo-text">Intern Hub</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map(item => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                  <Link href={item.href}>
                    <item.icon className="text-lg" />
                    <span className="ml-3">{item.label}</span>
                    {item.badge && <Badge className="ml-auto bg-destructive text-destructive-foreground">{item.badge}</Badge>}
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
                    <h2 className="text-xl font-semibold text-gray-800 ml-4">HOD Dashboard</h2>
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
