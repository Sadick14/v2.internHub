'use client';

import { useEffect, useState } from 'react';
import { getInternshipProfileByStudentId, type InternshipProfile } from '@/services/internshipProfileService';

export interface InternshipAccess {
  hasStarted: boolean;
  hasEnded: boolean;
  daysUntilStart: number | null;
  daysRemaining: number | null;
  profile: InternshipProfile | null;
  isLoading: boolean;
  canAccessActivities: boolean;
}

export function useInternshipAccess(studentId: string | undefined): InternshipAccess {
  const [access, setAccess] = useState<InternshipAccess>({
    hasStarted: false,
    hasEnded: false,
    daysUntilStart: null,
    daysRemaining: null,
    profile: null,
    isLoading: true,
    canAccessActivities: false,
  });

  useEffect(() => {
    if (!studentId) {
      setAccess(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const checkAccess = async () => {
      try {
        const profile = await getInternshipProfileByStudentId(studentId);
        
        if (!profile) {
          setAccess({
            hasStarted: false,
            hasEnded: false,
            daysUntilStart: null,
            daysRemaining: null,
            profile: null,
            isLoading: false,
            canAccessActivities: false,
          });
          return;
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0); // Reset time for accurate date comparison
        
        const startDate = new Date(profile.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(profile.endDate);
        endDate.setHours(0, 0, 0, 0);

        const hasStarted = now >= startDate;
        const hasEnded = now > endDate;
        
        const daysUntilStart = hasStarted ? 0 : Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = hasEnded ? 0 : Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        setAccess({
          hasStarted,
          hasEnded,
          daysUntilStart,
          daysRemaining,
          profile,
          isLoading: false,
          canAccessActivities: hasStarted && !hasEnded,
        });
      } catch (error) {
        console.error('Error checking internship access:', error);
        setAccess(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAccess();
  }, [studentId]);

  return access;
}
