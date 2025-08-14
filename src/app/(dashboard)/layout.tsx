
'use client';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  FileText,
  Home,
  LineChart,
  Package,
  UserPlus,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/layout/user-nav';
import { cn } from '@/lib/utils';
import { RoleSwitcher } from '@/components/layout/role-switcher';
import { useRole } from '@/hooks/use-role';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, role } = useRole();

  useEffect(() => {
    if (!loading && !user) {
      if (pathname !== '/login' && pathname !== '/register' && pathname !== '/verify' && pathname !== '/forgot-password' && pathname !== '/') {
        router.push('/login');
      }
    }
  }, [user, loading, router, pathname]);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['student', 'lecturer', 'hod', 'supervisor', 'admin'] },
    { href: '/reports', label: 'Reports', icon: FileText, badge: '6', roles: ['lecturer', 'hod', 'supervisor', 'admin'] },
    { href: '/students', label: 'Students', icon: Users, roles: ['lecturer', 'hod', 'admin'] },
    { href: '/invite-student', label: 'Invite Student', icon: UserPlus, roles: ['admin'] },
    { href: '/submit-report', label: 'Submit Report', icon: Package, roles: ['student'] },
    { href: '/analytics', label: 'Analytics', icon: LineChart, roles: ['hod', 'admin'] },
  ];

  const getDashboardHomeLink = () => {
    if (!role) return '/dashboard';
    return `/${role}/dashboard`;
  };

  const filteredNavItems = navItems.filter(item => {
    if (!role) return false;
    if (item.href === '/dashboard') return true;
    return item.roles.includes(role);
  });

  const renderLoading = () => (
     <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary animate-spin">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
     </div>
  );

  if (loading) {
    return renderLoading();
  }

  if (!user && (pathname.startsWith('/dashboard') || (role && pathname.startsWith(`/${role}`)))) {
    return renderLoading();
  }
  
  // For public pages, we don't want to render the dashboard layout.
  if (!user) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href={getDashboardHomeLink()} className="flex items-center gap-2 font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <span className="font-headline group-data-[collapsible=icon]:hidden">InternshipTrack</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {filteredNavItems.map(item => {
              const href = item.href === '/dashboard' ? getDashboardHomeLink() : item.href;
              return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(href)} tooltip={item.label}>
                  <Link href={href}>
                    <item.icon />
                    <span>{item.label}</span>
                    {item.badge && <Badge className="ml-auto">{item.badge}</Badge>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )})}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <UserNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
         <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="md:hidden" />
             <div className="flex w-full items-center gap-4 justify-end">
                <RoleSwitcher />
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
