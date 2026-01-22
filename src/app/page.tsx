'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, FileText, LineChart, CheckCircle, GraduationCap, Building, Search, ChartBar, MessageSquare, Calendar, Shield, Check } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="p-2 md:p-4 text-center">
    <div className="text-2xl md:text-4xl font-bold text-primary">{value}</div>
    <div className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">{label}</div>
  </div>
);

const Feature = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg p-4 md:p-8 transition duration-300 h-full">
    <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg bg-blue-100 flex items-center justify-center">
      {icon}
    </div>
    <h3 className="mt-4 md:mt-6 text-lg md:text-xl font-bold">{title}</h3>
    <p className="mt-2 md:mt-3 text-sm md:text-base text-gray-600">
      {description}
    </p>
  </div>
);

export default function WelcomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu when resizing to larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-primary w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-white text-lg md:text-xl" />
                </div>
                <span className="ml-2 md:ml-3 text-lg md:text-xl font-bold text-dark">Intern<span className="text-primary">Hub</span></span>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link href="#home" className="text-primary border-b-2 border-primary px-1 pt-1 text-sm font-medium">Home</Link>
                <Link href="#features" className="text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300 border-b-2 px-1 pt-1 text-sm font-medium">Features</Link>
                <Link href="#how-it-works" className="text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300 border-b-2 px-1 pt-1 text-sm font-medium">How It Works</Link>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm font-medium">Sign In</Link>
              <Link href="/login" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary transition duration-300">Portal Login</Link>
            </div>
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="#home" 
              className="text-primary block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="#features" 
              className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <Link 
                  href="/login" 
                  className="text-gray-500 hover:text-gray-700 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link 
                  href="/login" 
                  className="block w-full text-left bg-primary text-white px-3 py-2 rounded-md text-base font-medium hover:bg-secondary transition duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Portal Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-light pt-16">
        {/* Hero Section */}
        <section 
          id="home" 
          className="relative min-h-screen flex items-center justify-center bg-cover bg-center pt-16"
          style={{backgroundImage: "url('/IMG-20250228-WA0051.jpg')"}}
        >
          <div className="absolute inset-0 bg-black opacity-60"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 py-12">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-12 text-white text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Streamline Your <span className="text-success">Internship</span> Management
                </h1>
                <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-200 max-w-lg mx-auto md:mx-0">
                  Ho Technical University's comprehensive internship management system. Connect students with industry partners, track progress in real-time, and ensure successful outcomes for every intern.
                </p>
                <div className="mt-6 md:mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                  <Link 
                    href="/login" 
                    className="bg-primary hover:bg-secondary text-white font-medium py-2 px-6 md:py-3 md:px-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300 text-center"
                  >
                    Access Portal
                  </Link>
                  <Link 
                    href="#features" 
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium py-2 px-6 md:py-3 md:px-8 rounded-lg border-2 border-white/30 shadow-lg hover:shadow-xl transition duration-300 text-center"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="mt-8 md:mt-0 md:w-1/2 flex justify-center">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 md:p-6 w-full">
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                      <div className="text-sm font-medium">Student Dashboard</div>
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-red-400 rounded-full"></div>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      <div className="bg-white bg-opacity-30 h-3 md:h-4 rounded"></div>
                      <div className="bg-white bg-opacity-30 h-3 md:h-4 rounded w-3/4"></div>
                    </div>
                    <div className="mt-4 md:mt-6 grid grid-cols-3 gap-2 md:gap-3">
                      <div className="bg-white bg-opacity-20 rounded-lg p-1 md:p-2 h-16 md:h-20 flex flex-col items-center justify-center">
                        <Briefcase className="text-sm md:text-lg mb-1" />
                        <span className="text-xs">Interns</span>
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-lg p-1 md:p-2 h-16 md:h-20 flex flex-col items-center justify-center">
                        <LineChart className="text-sm md:text-lg mb-1" />
                        <span className="text-xs">Progress</span>
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-lg p-1 md:p-2 h-16 md:h-20 flex flex-col items-center justify-center">
                        <FileText className="text-sm md:text-lg mb-1" />
                        <span className="text-xs">Tasks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Ho Technical University at a Glance</h2>
              <p className="mt-2 text-blue-100 text-sm md:text-base">Empowering our students with world-class internship management</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition duration-300">
                <div className="text-3xl md:text-5xl font-bold text-white">500+</div>
                <div className="mt-2 text-blue-100 text-sm md:text-base">Active Students</div>
                <p className="mt-1 text-xs text-blue-200">Currently enrolled in internships</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition duration-300">
                <div className="text-3xl md:text-5xl font-bold text-white">50+</div>
                <div className="mt-2 text-blue-100 text-sm md:text-base">Partner Companies</div>
                <p className="mt-1 text-xs text-blue-200">Industry leaders collaborating</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition duration-300">
                <div className="text-3xl md:text-5xl font-bold text-white">95%</div>
                <div className="mt-2 text-blue-100 text-sm md:text-base">Success Rate</div>
                <p className="mt-1 text-xs text-blue-200">Students completing internships</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold">Built for Ho Technical University</h2>
              <p className="mt-2 md:mt-4 text-sm md:text-lg text-gray-600">
                A complete internship management solution tailored to our university's needs, from student onboarding to final evaluation
              </p>
            </div>
            <div className="mt-8 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              <Feature 
                icon={<Users className="text-primary text-lg md:text-2xl" />} 
                title="Multi-Role Dashboard" 
                description="Tailored interfaces for students, lecturers, supervisors, HODs, and administrators with role-specific features and analytics." 
              />
              <Feature 
                icon={<ChartBar className="text-primary text-lg md:text-2xl" />} 
                title="Real-Time Analytics" 
                description="Live performance metrics, progress tracking, and data visualization for informed decision-making and continuous improvement." 
              />
              <Feature 
                icon={<CheckCircle className="text-primary text-lg md:text-2xl" />} 
                title="Daily Check-ins" 
                description="GPS-verified attendance tracking with manual override options, ensuring accurate location-based monitoring of interns." 
              />
              <Feature 
                icon={<FileText className="text-primary text-lg md:text-2xl" />} 
                title="Smart Reporting" 
                description="AI-powered report summarization, automated submission workflows, and comprehensive evaluation tools for all stakeholders." 
              />
              <Feature 
                icon={<MessageSquare className="text-primary text-lg md:text-2xl" />} 
                title="Instant Notifications" 
                description="Real-time alerts for report submissions, approvals, tasks, and system updates keeping everyone informed and engaged." 
              />
              <Feature 
                icon={<Shield className="text-primary text-lg md:text-xl" />} 
                title="Security & Privacy" 
                description="Enterprise-grade security with Firebase authentication, encrypted data storage, and comprehensive audit logging system." 
              />
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-12 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-xs md:text-base font-semibold text-primary uppercase tracking-wide">Process</h2>
              <h3 className="mt-1 md:mt-2 text-xl md:text-3xl font-bold text-gray-900">
                How InternHub Works
              </h3>
              <p className="mt-2 md:mt-4 max-w-2xl mx-auto text-sm md:text-xl text-gray-500">
                A simple three-step process to streamline your internship management.
              </p>
            </div>

            <div className="mt-8 md:mt-20 space-y-8 md:space-y-16">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                <div className="w-full md:w-1/2">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg md:text-xl">1</div>
                    <h4 className="text-lg md:text-2xl font-bold text-gray-900">Setup & Integration</h4>
                  </div>
                  <p className="mt-2 md:mt-4 text-sm md:text-base text-gray-600">
                    Admins kick things off by configuring the university's structure, including faculties and departments. They then invite students, lecturers, and company supervisors to the platform, ensuring everyone is connected from day one.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-6 md:gap-12">
                <div className="w-full md:w-1/2">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg md:text-xl">2</div>
                    <h4 className="text-lg md:text-2xl font-bold text-gray-900">Daily Tracking & Engagement</h4>
                  </div>
                  <p className="mt-2 md:mt-4 text-sm md:text-base text-gray-600">
                    Students check in daily, declare their tasks, and submit detailed reports. This creates a transparent record of their work. Supervisors and lecturers can monitor this progress in real-time, providing feedback and guidance to keep students on track.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                <div className="w-full md:w-1/2">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg md:text-xl">3</div>
                    <h4 className="text-lg md:text-2xl font-bold text-gray-900">Evaluation & Reporting</h4>
                  </div>
                  <p className="mt-2 md:mt-4 text-sm md:text-base text-gray-600">
                    At the end of the term, all stakeholders evaluate student performance based on the data collected. The system consolidates this feedback, generating comprehensive reports and analytics for university oversight and continuous program improvement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-xs md:text-base font-semibold text-primary uppercase tracking-wide">Testimonials</h2>
              <h3 className="mt-1 md:mt-2 text-2xl md:text-4xl font-bold text-gray-900">
                What Our Users Say
              </h3>
              <p className="mt-2 md:mt-4 max-w-2xl mx-auto text-sm md:text-lg text-gray-600">
                Hear from our HTU community - students, lecturers, and supervisors using InternHub every day
              </p>
            </div>
            <div className="mt-8 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold">AS</div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">Abena Serwaa</div>
                    <div className="text-sm text-gray-600">Computer Science Student</div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">
                  "InternHub made tracking my internship progress so easy! The daily check-in and report features helped me stay organized, and my lecturer could monitor my work in real-time."
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">KA</div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">Dr. Kwame Asante</div>
                    <div className="text-sm text-gray-600">Lecturer & Coordinator</div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">
                  "As a lecturer managing 50+ students, InternHub's analytics dashboard gives me instant visibility into everyone's progress. The automated reporting saves me hours every week!"
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">EB</div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">Emmanuel Boateng</div>
                    <div className="text-sm text-gray-600">Company Supervisor</div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">
                  "The platform streamlined our intern management process. We can easily evaluate performance, assign tasks, and communicate with the university - all in one place."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900">Your Campus Internship Solution</h2>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                Designed and deployed exclusively for Ho Technical University students, faculty, and administrative staff
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="text-green-600 w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Easy Setup & Onboarding</h4>
                  <p className="mt-1 text-sm text-gray-600">Get started in minutes with our intuitive setup wizard and comprehensive user guides.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="text-green-600 w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Mobile-First Design</h4>
                  <p className="mt-1 text-sm text-gray-600">Fully responsive interface that works seamlessly on phones, tablets, and desktops.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="text-green-600 w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Comprehensive Analytics</h4>
                  <p className="mt-1 text-sm text-gray-600">Data-driven insights with charts, trends, and performance metrics for better decision-making.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="text-green-600 w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">24/7 Support</h4>
                  <p className="mt-1 text-sm text-gray-600">Dedicated support team ready to help with any questions or technical issues.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Part of the HTU Community?
              </h2>
              <p className="mt-4 md:mt-6 max-w-2xl mx-auto text-base md:text-xl text-blue-100">
                Access your InternHub account to manage internships, submit reports, track progress, and collaborate with your supervisors and lecturers.
              </p>
              <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/login" 
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-xl hover:shadow-2xl hover:bg-gray-50 transition duration-300 inline-block text-base"
                >
                  Sign In to Your Account
                </Link>
                <Link 
                  href="/register" 
                  className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg shadow-xl hover:bg-blue-400 border-2 border-white/30 transition duration-300 inline-block text-base"
                >
                  Register (Students Only)
                </Link>
              </div>
              <p className="mt-6 text-sm text-blue-200">✓ HTU Students, Lecturers & Staff  ✓ Secure university authentication  ✓ Available 24/7</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="bg-primary w-10 h-10 rounded-lg flex items-center justify-center">
                    <GraduationCap className="text-white text-xl" />
                  </div>
                  <span className="ml-3 text-xl font-bold text-white">Intern<span className="text-primary">Hub</span></span>
                </div>
                <p className="text-sm text-gray-400 max-w-md">
                  Ho Technical University's official internship management platform. Connecting students, lecturers, supervisors, and industry partners for successful internship experiences.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="#features" className="hover:text-primary transition">Features</Link></li>
                  <li><Link href="#how-it-works" className="hover:text-primary transition">How It Works</Link></li>
                  <li><Link href="/login" className="hover:text-primary transition">Sign In</Link></li>
                  <li><Link href="/register" className="hover:text-primary transition">Register</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Contact</h4>
                <ul className="space-y-2 text-sm">
                  <li>Ho Technical University</li>
                  <li>Ho, Volta Region</li>
                  <li>Ghana</li>
                  <li className="mt-4"><a href="mailto:support@internhub.edu.gh" className="hover:text-primary transition">support@internhub.edu.gh</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
              <p>&copy; {new Date().getFullYear()} InternHub. All rights reserved. Developed for Ho Technical University.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}