
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, FileText, LineChart, CheckCircle, GraduationCap, Building, Search, ChartBar, MessageSquare, Calendar, Shield, Check } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

const Stat = ({ value, label }: { value: string, label: string }) => (
    <div className="p-4 text-center">
        <div className="text-3xl md:text-4xl font-bold text-primary">{value}</div>
        <div className="mt-2 text-gray-600">{label}</div>
    </div>
);

const Feature = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-white rounded-2xl shadow-lg p-8 feature-card transition duration-300">
        <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center">
            {icon}
        </div>
        <h3 className="mt-6 text-xl font-bold">{title}</h3>
        <p className="mt-3 text-gray-600">
            {description}
        </p>
    </div>
);

const HowItWorksStep = ({ number, title, description }: { number: string, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center mb-10 md:mb-0">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold pulse">
            {number}
        </div>
        <h4 className="mt-6 text-xl font-bold text-gray-900">{title}</h4>
        <p className="mt-2 text-gray-600 max-w-xs">
            {description}
        </p>
    </div>
);

const Testimonial = ({ name, role, text, img }: { name: string, role: string, text: string, img: string }) => (
    <div className="testimonial-card bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                <Image src={img} alt={name} width={64} height={64} className="w-full h-full object-cover" />
            </div>
            <div className="ml-4">
                <h4 className="font-bold text-gray-900">{name}</h4>
                <p className="text-gray-600">{role}</p>
            </div>
        </div>
        <p className="mt-6 text-gray-600 italic">
            {text}
        </p>
        <div className="mt-6 flex text-yellow-400">
            <StarIcon /> <StarIcon /> <StarIcon /> <StarIcon /> <StarIcon />
        </div>
    </div>
);

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);


export default function WelcomePage() {

    useEffect(() => {
        const mobileMenuButton = document.querySelector('#mobile-menu-button');
        const mobileMenu = document.querySelector('#mobile-menu');

        const handleMobileMenuToggle = () => {
             const expanded = mobileMenuButton?.getAttribute('aria-expanded') === 'true';
             mobileMenuButton?.setAttribute('aria-expanded', String(!expanded));
             mobileMenu?.classList.toggle('hidden');
        };

        mobileMenuButton?.addEventListener('click', handleMobileMenuToggle);

        return () => {
             mobileMenuButton?.removeEventListener('click', handleMobileMenuToggle);
        }
    }, []);


  return (
    <div className="bg-light text-dark">
      {/* Navigation */}
      <nav className="fixed w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-primary w-10 h-10 rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-white text-xl" />
                </div>
                <span className="ml-3 text-xl font-bold text-dark">Intern<span className="text-primary">Hub</span></span>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link href="#home" className="text-primary border-b-2 border-primary px-1 pt-1 text-sm font-medium">Home</Link>
                <Link href="#features" className="text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300 border-b-2 px-1 pt-1 text-sm font-medium">Features</Link>
                <Link href="#how-it-works" className="text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300 border-b-2 px-1 pt-1 text-sm font-medium">How It Works</Link>
                <Link href="#testimonials" className="text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300 border-b-2 px-1 pt-1 text-sm font-medium">Testimonials</Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="hidden md:ml-4 md:flex md:items-center space-x-4">
                <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm font-medium">Sign In</Link>
                <Link href="/dashboard" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary transition duration-300">Get Started</Link>
              </div>
            </div>
            <div className="-mr-2 flex items-center md:hidden">
              <button id="mobile-menu-button" type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none" aria-expanded="false">
                <span className="sr-only">Open main menu</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
            </div>
          </div>
          <div id="mobile-menu" className="md:hidden hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link href="#home" className="text-primary block px-3 py-2 rounded-md text-base font-medium">Home</Link>
                <Link href="#features" className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">Features</Link>
                <Link href="#how-it-works" className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">How It Works</Link>
                <Link href="#testimonials" className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">Testimonials</Link>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-5">
                    <Link href="/login" className="text-gray-500 hover:text-gray-700 text-base font-medium">Sign In</Link>
                </div>
                <div className="mt-3 px-2 space-y-1">
                    <Link href="/dashboard" className="block w-full text-left bg-primary text-white px-3 py-2 rounded-md text-base font-medium hover:bg-secondary transition duration-300">Get Started</Link>
                </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 pb-16 md:pt-32 md:pb-24 hero-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Streamline Your <span className="gradient-text">Internship</span> Management
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-lg">
                InternHub simplifies internship management for technical universities. Connect students with industry partners, track progress, and ensure successful outcomes.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/dashboard" className="bg-primary hover:bg-secondary text-white font-medium py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300 text-center">
                  Get Started
                </Link>
                <Link href="#" className="bg-white hover:bg-gray-50 text-primary font-medium py-3 px-8 rounded-lg shadow border border-gray-200 hover:border-gray-300 transition duration-300 text-center flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  Watch Demo
                </Link>
              </div>
              <div className="mt-10 flex items-center">
                <div className="flex -space-x-2">
                  <Image className="w-10 h-10 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" width={40} height={40}/>
                  <Image className="w-10 h-10 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" width={40} height={40}/>
                  <Image className="w-10 h-10 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/women/68.jpg" alt="User" width={40} height={40}/>
                  <Image className="w-10 h-10 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/men/12.jpg" alt="User" width={40} height={40}/>
                </div>
                <p className="ml-4 text-gray-600">
                  <span className="font-semibold">200+</span> universities trust InternHub
                </p>
              </div>
            </div>
            <div className="mt-12 md:mt-0 md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="bg-primary rounded-2xl w-80 h-80 md:w-96 md:h-96 overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-90"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 w-full">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm font-medium">Student Dashboard</div>
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white bg-opacity-30 h-4 rounded"></div>
                        <div className="bg-white bg-opacity-30 h-4 rounded w-3/4"></div>
                      </div>
                      <div className="mt-6 grid grid-cols-3 gap-3">
                        <div className="bg-white bg-opacity-20 rounded-lg p-2 h-20 flex flex-col items-center justify-center">
                          <Briefcase className="text-lg mb-1" />
                          <span className="text-xs">Applications</span>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-lg p-2 h-20 flex flex-col items-center justify-center">
                          <LineChart className="text-lg mb-1" />
                          <span className="text-xs">Progress</span>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-lg p-2 h-20 flex flex-col items-center justify-center">
                          <FileText className="text-lg mb-1" />
                          <span className="text-xs">Tasks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 w-64">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="text-green-500 text-xl" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">34 Internships Active</p>
                      <p className="text-sm text-gray-500">This week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Stat value="500+" label="Universities" />
            <Stat value="50K+" label="Students" />
            <Stat value="5K+" label="Companies" />
            <Stat value="98%" label="Success Rate" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Powerful Features for Seamless Management</h2>
            <p className="mt-4 text-lg text-gray-600">
              Designed specifically for technical universities to manage internship programs effectively
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <Feature icon={<Search className="text-primary text-xl" />} title="Smart Matching" description="AI-powered matching connects students with companies based on skills, interests, and career goals." />
            <Feature icon={<ChartBar className="text-primary text-xl" />} title="Progress Tracking" description="Real-time tracking of student progress with milestone completion and performance metrics." />
            <Feature icon={<Building className="text-primary text-xl" />} title="Company Partnerships" description="Manage relationships with industry partners and track internship opportunities." />
            <Feature icon={<MessageSquare className="text-primary text-xl" />} title="Communication Hub" description="Integrated messaging system for seamless communication between students, mentors, and coordinators." />
            <Feature icon={<Calendar className="text-primary text-xl" />} title="Automated Reporting" description="Generate comprehensive reports on student performance and program success." />
            <Feature icon={<Shield className="text-primary text-xl" />} title="Secure & Compliant" description="Ensure data privacy and compliance with university and industry regulations." />
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                  <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Process</h2>
                  <h3 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                      How Intern Hub Works
                  </h3>
                  <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                      A simple three-step process to streamline your internship management.
                  </p>
              </div>

              <div className="mt-16">
                  <div className="flex flex-col md:flex-row justify-between items-center relative">
                      <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
                      <HowItWorksStep number="1" title="Setup & Integration" description="Universities integrate with Intern Hub and configure their internship programs." />
                      <HowItWorksStep number="2" title="Student & Company Onboarding" description="Students apply for internships and companies post opportunities through our platform." />
                      <HowItWorksStep number="3" title="Management & Tracking" description="Monitor progress, evaluate performance, and manage all aspects of internships in one place." />
                  </div>
              </div>
          </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Testimonials</h2>
                <h3 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                    What Our Users Say
                </h3>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Testimonial name="Dr. Emily Carter" role="Dean of Engineering" text="InternHub has transformed our internship program. The efficiency and insights we've gained are remarkable." img="https://randomuser.me/api/portraits/women/65.jpg" />
                <Testimonial name="Johnathan Lee" role="Final Year Student" text="Finding an internship that matched my skills was so easy. The platform guided me through the entire process." img="https://randomuser.me/api/portraits/men/31.jpg" />
                <Testimonial name="Maria Rodriguez" role="HR Manager, TechCorp" text="We've found exceptional talent through InternHub. It's our go-to platform for recruiting top-tier interns." img="https://randomuser.me/api/portraits/women/31.jpg" />
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                  <h2 className="text-3xl font-bold text-white sm:text-4xl">
                      Ready to Transform Your Internship Program?
                  </h2>
                  <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100">
                      Join hundreds of universities and companies using Intern Hub to streamline internship management.
                  </p>
                  <div className="mt-10">
                      <Link href="/dashboard" className="px-8 py-4 bg-white text-primary font-bold rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 inline-block">
                          Get Started Today
                      </Link>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-dark text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                  <div>
                      <div className="flex items-center">
                           <div className="bg-primary w-10 h-10 rounded-lg flex items-center justify-center">
                               <GraduationCap className="text-white text-xl" />
                           </div>
                           <span className="ml-3 text-2xl font-bold text-white">Intern<span className="text-primary">Hub</span></span>
                      </div>
                      <p className="mt-4 text-gray-400">
                        The all-in-one platform for universities to manage, track, and optimize student internship experiences.
                      </p>
                  </div>

                  <div>
                      <h3 className="text-lg font-bold">Product</h3>
                      <ul className="mt-4 space-y-3">
                          <li><Link href="#" className="text-gray-400 hover:text-white">Features</Link></li>
                          <li><Link href="#" className="text-gray-400 hover:text-white">Pricing</Link></li>
                          <li><Link href="#" className="text-gray-400 hover:text-white">Integrations</Link></li>
                      </ul>
                  </div>

                  <div>
                      <h3 className="text-lg font-bold">Resources</h3>
                      <ul className="mt-4 space-y-3">
                          <li><Link href="#" className="text-gray-400 hover:text-white">Blog</Link></li>
                          <li><Link href="#" className="text-gray-400 hover:text-white">Support</Link></li>
                      </ul>
                  </div>

                  <div>
                      <h3 className="text-lg font-bold">Contact Us</h3>
                      <ul className="mt-4 space-y-3">
                          <li className="flex items-start">
                              <span className="text-gray-400">123 University Avenue, Tech City, TC 10001</span>
                          </li>
                          <li className="flex items-center">
                              <span className="text-gray-400">(123) 456-7890</span>
                          </li>
                          <li className="flex items-center">
                              <span className="text-gray-400">info@internhub.edu</span>
                          </li>
                      </ul>
                  </div>
              </div>

              <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-400">
                  <p>&copy; 2024 Intern Hub. All rights reserved.</p>
              </div>
          </div>
      </footer>
    </div>
  );
}

