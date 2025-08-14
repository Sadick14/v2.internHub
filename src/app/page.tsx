import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, FileText, LineChart } from 'lucide-react';
import Image from 'next/image';

export default function WelcomePage() {
  const features = [
    {
      icon: <Briefcase className="w-8 h-8 text-primary" />,
      title: 'Streamlined Intern Management',
      description: 'Easily track, manage, and supervise interns from a centralized dashboard.',
    },
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: 'Automated Reporting',
      description: 'Students submit daily reports with ease, and supervisors get notified instantly.',
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: 'Seamless Communication',
      description: 'Facilitate clear communication between students, lecturers, and company supervisors.',
    },
    {
      icon: <LineChart className="w-8 h-8 text-primary" />,
      title: 'Data-Driven Insights',
      description: 'Gain valuable insights into intern performance and program effectiveness.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <span className="font-headline text-lg">InternshipTrack</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-12 md:py-24 lg:py-32 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
              The Future of Internship Management
            </h1>
            <p className="mt-4 text-muted-foreground md:text-xl">
              A comprehensive platform to connect students, lecturers, and companies. Fostering accountability, communication, and growth.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/login">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="container py-12 md:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Why Choose InternshipTrack?</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground md:text-lg">
              Our platform is built to solve the real-world challenges of managing internship programs.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-card py-12 md:py-24">
            <div className="container grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
                <Image
                src="https://placehold.co/600x400.png"
                alt="Feature"
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                data-ai-hint="team collaboration"
                />
                <div className="flex flex-col justify-center space-y-4">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">For Universities</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Academic Oversight, Simplified</h2>
                        <p className="max-w-[600px] text-muted-foreground md:text-lg">
                            Empower your lecturers, Heads of Department, and administrators with powerful dashboards. Monitor student progress, manage workloads, and gain insights across faculties and departments with ease.
                        </p>
                    </div>
                     <Button asChild className="w-fit">
                        <Link href="#">Request a Demo</Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>

      <footer className="bg-card border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <p className="text-sm text-muted-foreground">
            © 2024 InternshipTrack. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm hover:underline underline-offset-4">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm hover:underline underline-offset-4">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
