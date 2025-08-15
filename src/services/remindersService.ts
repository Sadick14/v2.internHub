
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { createNotification } from './notificationsService';
import { createAuditLog } from './auditLogService';
import { auth } from '@/lib/firebase';
import type { InternshipTerm } from './internshipTermsService';
import type { InternshipProfile } from './internshipProfileService';
import type { Evaluation } from './evaluationsService';
import { getAllUsers, updateUserStatus, type UserProfile } from './userService';

// This is a server-only file for handling system-wide reminders and triggers.

export async function sendEvaluationReminders(): Promise<{ success: boolean; message: string; remindersSent: number }> {
    const adminUser = auth.currentUser;
    if (!adminUser) {
        return { success: false, message: 'Authentication required. Only admins can perform this action.', remindersSent: 0 };
    }

    try {
        // 1. Find the active internship term
        const termsRef = collection(db, 'internship_terms');
        const activeTermQuery = query(termsRef, where('status', '==', 'Active'));
        const activeTermSnapshot = await getDocs(activeTermQuery);

        if (activeTermSnapshot.empty) {
            return { success: false, message: 'No active internship term found. Please set an active term first.', remindersSent: 0 };
        }
        const activeTerm = activeTermSnapshot.docs[0].data() as InternshipTerm;

        // 2. Get all internship profiles active during this term
        // For simplicity, we get all profiles. A more robust query would filter by date.
        const profilesRef = collection(db, 'internship_profiles');
        const profilesSnapshot = await getDocs(profilesRef);
        const allProfiles = profilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InternshipProfile));

        // 3. Get all evaluations
        const evaluationsRef = collection(db, 'evaluations');
        const evaluationsSnapshot = await getDocs(evaluationsRef);
        const allEvaluations = evaluationsSnapshot.docs.map(doc => doc.data() as Evaluation);

        let remindersSent = 0;
        const supervisorsToNotify = new Set<string>();

        // 4. Determine which supervisors need reminders
        for (const profile of allProfiles) {
            // Check if this student has an evaluation from their assigned supervisor
            const hasEvaluation = allEvaluations.some(
                (evaluation) =>
                    evaluation.studentId === profile.studentId &&
                    evaluation.evaluatorId === profile.supervisorId &&
                    evaluation.evaluatorRole === 'supervisor'
            );

            if (!hasEvaluation && profile.supervisorId) {
                // If no evaluation exists, add the supervisor to the notification list.
                // Using a Set prevents sending duplicate notifications to a supervisor with multiple interns.
                supervisorsToNotify.add(profile.supervisorId);
            }
        }
        
        // 5. Send notifications
        for (const supervisorId of supervisorsToNotify) {
            await createNotification({
                userId: supervisorId,
                title: 'Evaluation Reminder',
                message: "You have pending intern evaluations to complete. Please submit them as soon as possible.",
                href: '/supervisor/evaluate-student',
            });
            remindersSent++;
        }

        // 6. Create an audit log
        await createAuditLog({
            userId: adminUser.uid,
            userName: adminUser.displayName || 'Admin',
            userEmail: adminUser.email || 'N/A',
            action: 'Send Evaluation Reminders',
            details: `Sent ${remindersSent} evaluation reminders to supervisors for the active term "${activeTerm.name}".`
        });

        return { success: true, message: 'Reminders sent successfully.', remindersSent };

    } catch (error: any) {
        console.error('Error sending evaluation reminders:', error);
        return { success: false, message: `An unexpected error occurred: ${error.message}`, remindersSent: 0 };
    }
}


export async function sendTermEndingReminders(): Promise<{ success: boolean, message: string, notificationsSent: number}> {
    const adminUser = auth.currentUser;
     if (!adminUser) {
        return { success: false, message: 'Authentication required. Only admins can perform this action.', notificationsSent: 0 };
    }

    try {
        const termsRef = collection(db, 'internship_terms');
        const activeTermQuery = query(termsRef, where('status', '==', 'Active'));
        const activeTermSnapshot = await getDocs(activeTermQuery);

        if (activeTermSnapshot.empty) {
            return { success: false, message: 'No active internship term found.', notificationsSent: 0 };
        }
        const activeTerm = activeTermSnapshot.docs[0].data() as InternshipTerm;
        
        const allUsers = await getAllUsers();
        const activeUsers = allUsers.filter(u => u.status === 'active');
        let notificationsSent = 0;

        for(const user of activeUsers) {
             await createNotification({
                userId: user.uid,
                title: 'Internship Term Ending Soon',
                message: `The current internship term '${activeTerm.name}' is ending. Please ensure all reports and evaluations are finalized.`,
            });
            notificationsSent++;
        }
        
         await createAuditLog({
            userId: adminUser.uid,
            userName: adminUser.displayName || 'Admin',
            userEmail: adminUser.email || 'N/A',
            action: 'Send End-of-Term Reminders',
            details: `Sent ${notificationsSent} end-of-term reminders for the active term "${activeTerm.name}".`
        });

        return { success: true, message: 'End-of-term reminders sent successfully.', notificationsSent };

    } catch (error: any) {
         console.error('Error sending end-of-term reminders:', error);
        return { success: false, message: `An unexpected error occurred: ${error.message}`, notificationsSent: 0 };
    }
}
