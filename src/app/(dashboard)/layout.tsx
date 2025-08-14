'use client';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserNav } from '@/components/layout/user-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { RoleSwitcher } from '@/components/layout/role-switcher';
import { useRole } from '@/hooks/use-role';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, role } = useRole();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && !user && isClient) {
      router.push('/login');
    }
  }, [user, loading, router, isClient]);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['student', 'lecturer', 'hod', 'supervisor', 'admin'] },
    { href: '/reports', label: 'Reports', icon: FileText, badge: '6', roles: ['lecturer', 'hod', 'supervisor', 'admin'] },
    { href: '/students', label: 'Students', icon: Users, roles: ['lecturer', 'hod', 'admin'] },
    { href: '/invite-student', label: 'Invite Student', icon: UserPlus, roles: ['admin'] },
    { href: '/submit-report', label: 'Submit Report', icon: Package, roles: ['student'] },
    { href: '/analytics', label: 'Analytics', icon: LineChart, roles: ['hod', 'admin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

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

  if (!isClient || loading) {
    return renderLoading();
  }

   if (!user) {
    return renderLoading(); // or a login prompt, though the effect will redirect
  }


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <span className="font-headline">InternshipTrack</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {filteredNavItems.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname.startsWith(item.href) && item.href !== '/dashboard' ? "bg-muted text-primary" : pathname === '/dashboard' && item.href === '/dashboard' ? "bg-muted text-primary" : ""
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.badge && <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">{item.badge}</Badge>}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle className="font-headline">Need Help?</CardTitle>
                <CardDescription>
                  Contact support for assistance with the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 md:p-4">
                <Button variant="secondary" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Sheet>
        <SheetTrigger className="md:hidden">
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
                <span className="font-headline">InternshipTrack</span>
              </Link>
              <UserNav />
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {filteredNavItems.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      pathname.startsWith(item.href) && item.href !== '/dashboard' ? "bg-muted text-primary" : pathname === '/dashboard' && item.href === '/dashboard' ? "bg-muted text-primary" : ""
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.badge && <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">{item.badge}</Badge>}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="mt-auto p-4">
              <Card>
                <CardHeader className="p-2 pt-0 md:p-4">
                  <CardTitle className="font-headline">Need Help?</CardTitle>
                  <CardDescription>
                    Contact support for assistance with the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2 md:p-4">
                  <Button variant="secondary" className="w-full">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <main className="flex w-full flex-col overflow-y-auto">
        <div className="container pt-6 md:pt-10">
          {isClient && user ? (
            <>
              <div className="flex items-center justify-between">
                <h1 className="font-semibold text-2xl">
                  {pathname === '/dashboard' ? 'Dashboard' : pathname.slice(1).split('/')[0].replace('-', ' ')}
                </h1>
                <UserNav />
              </div>
              <RoleSwitcher />
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[80vh]">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          )}
          <div className="mt-4">{children}</div>
        </div>
      </main>
    </div>
  );
}
