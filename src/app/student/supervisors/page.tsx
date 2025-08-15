
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole, type AppUser } from '@/hooks/use-role';
import { getInternshipProfileByStudentId, type InternshipProfile } from '@/services/internshipProfileService';
import { getUserById, type UserProfile } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Phone, Building2, User, University } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const SupervisorInfoCard = ({ title, description, user, companyName }: { title: string, description: string, user: UserProfile | AppUser | null, companyName?: string }) => {
    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Information not available. Please ensure your profile is fully set up and a supervisor has been assigned.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
             <CardHeader>
                <CardTitle className="font-headline">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                     <Avatar className="w-16 h-16">
                        <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="person portrait" />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-xl font-semibold">{user.name}</h3>
                         {companyName ? (
                            <p className="text-muted-foreground flex items-center gap-2"><Building2 className="w-4 h-4" />{companyName}</p>
                         ) : (
                            <p className="text-muted-foreground flex items-center gap-2"><University className="w-4 h-4" />{ (user as UserProfile).departmentName || 'University Staff'}</p>
                         )}
                    </div>
                </div>
                 <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${user.email}`} className="text-primary hover:underline">{user.email}</a>
                    </div>
                     <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{user.phoneNumber || 'Not provided'}</span>
                    </div>
                 </div>
            </CardContent>
        </Card>
    );
};


export default function SupervisorsPage() {
    const { user } = useRole();
    const [profile, setProfile] = useState<InternshipProfile | null>(null);
    const [lecturer, setLecturer] = useState<UserProfile | null>(null);
    const [industrialSupervisor, setIndustrialSupervisor] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user?.uid) return;
            setIsLoading(true);

            // Fetch internship profile to get supervisor details
            const profileData = await getInternshipProfileByStudentId(user.uid);
            setProfile(profileData);

            if (profileData?.supervisorId) {
                const supervisorData = await getUserById(profileData.supervisorId);
                setIndustrialSupervisor(supervisorData);
            }

            // Fetch assigned lecturer details
            if (user.lecturerId) {
                const lecturerData = await getUserById(user.lecturerId);
                setLecturer(lecturerData);
            }
            
            setIsLoading(false);
        }
        fetchData();
    }, [user]);

     if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }
    
    if (!profile) {
        return (
             <Card className="text-center">
                <CardHeader>
                <CardTitle className="font-headline">Setup Required</CardTitle>
                <CardDescription>You need to set up your internship profile to view supervisor information.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <p>Please go to your profile page and provide your internship details.</p>
                    <Button asChild>
                        <Link href="/student/internship-setup">
                            Setup Internship Profile
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Tabs defaultValue="industrial">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="industrial">Industrial Supervisor</TabsTrigger>
                <TabsTrigger value="lecturer">Assigned Lecturer</TabsTrigger>
            </TabsList>
            <TabsContent value="industrial" className="mt-4">
                <SupervisorInfoCard 
                    title="Industrial Supervisor"
                    description="Your main point of contact at your internship company."
                    user={industrialSupervisor}
                    companyName={profile?.companyName}
                />
            </TabsContent>
            <TabsContent value="lecturer" className="mt-4">
                <SupervisorInfoCard 
                    title="Assigned Lecturer"
                    description="Your academic supervisor from the university."
                    user={lecturer}
                />
            </TabsContent>
        </Tabs>
    );
}
