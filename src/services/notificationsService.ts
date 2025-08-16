

'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { getSettings } from './settingsService';
import { getUserById } from './userService';
import { sendGenericNotificationEmail, sendInviteEmail, sendVerificationCodeEmail } from './emailService';


export type NotificationType = 
    | 'NEW_INVITE'
    | 'NEW_REPORT_SUBMITTED'
    | 'REPORT_APPROVED'
    | 'REPORT_REJECTED'
    | 'TASK_APPROVED'
    | 'TASK_REJECTED'
    | 'TASK_DECLARED'
    | 'LECTURER_ASSIGNED'
    | 'EVALUATION_REMINDER'
    | 'TERM_ENDING_REMINDER'
    | 'ABUSE_REPORT_SUBMITTED'
    | 'ANNOUNCEMENT';

export interface AppNotification {
    id: string;
    userId: string; // The user who should receive the notification
    title: string;
    message: string;
    href?: string; // Optional link to navigate to
    isRead: boolean;
    createdAt: Date;
    type: NotificationType;
}

export interface NewAppNotification extends Omit<AppNotification, 'id' | 'isRead' | 'createdAt'> {}

const notificationsCollectionRef = collection(db, 'notifications');

export async function createNotification(notificationData: NewAppNotification): Promise<void> {
    try {
        // 1. Create the in-app notification
        await addDoc(notificationsCollectionRef, {
            ...notificationData,
            isRead: false,
            createdAt: serverTimestamp(),
        });

        // 2. Check settings to see if an email should be sent
        const settings = await getSettings();
        
        let shouldSendEmail = false;

        // NEW_INVITE is handled directly by invitesService now.
        if (notificationData.type === 'NEW_INVITE' || notificationData.type === 'ANNOUNCEMENT') {
            // Emailing for these types is handled by their respective services (invites, announcements)
            return;
        }
        
        if (!settings) { 
             console.error("System settings not found. Halting email dispatch for notifications.");
             return;
        }
        
        switch(notificationData.type) {
            case 'NEW_REPORT_SUBMITTED':
                shouldSendEmail = settings.notifications.newReportToLecturer;
                break;
            case 'REPORT_APPROVED':
                shouldSendEmail = settings.notifications.reportApprovedToStudent;
                break;
            case 'REPORT_REJECTED':
                shouldSendEmail = settings.notifications.reportRejectedToStudent;
                break;
            case 'TASK_DECLARED':
                shouldSendEmail = settings.notifications.taskDeclaredToSupervisor;
                break;
            case 'TASK_APPROVED':
                shouldSendEmail = settings.notifications.taskApprovedToStudent;
                break;
            case 'TASK_REJECTED':
                shouldSendEmail = settings.notifications.taskRejectedToStudent;
                break;
            case 'LECTURER_ASSIGNED':
                shouldSendEmail = settings.notifications.lecturerAssignedToStudent;
                break;
            // For reminders and alerts, we assume they should always send if the service is called.
            case 'EVALUATION_REMINDER':
            case 'TERM_ENDING_REMINDER':
            case 'ABUSE_REPORT_SUBMITTED':
                shouldSendEmail = true;
                break;
        }
        

        if (shouldSendEmail) {
            const user = await getUserById(notificationData.userId);
            if (user?.email) {
                try {
                    await sendGenericNotificationEmail(user.email, {
                        title: notificationData.title,
                        message: notificationData.message,
                        href: notificationData.href
                    });
                } catch(emailError) {
                    console.error(`[CRITICAL] Email sending failed for user ${user.email} for notification type ${notificationData.type}:`, emailError);
                }
            } else {
                 console.warn(`[EMAIL] Could not send email for notification type ${notificationData.type} because user ${notificationData.userId} has no email address.`);
            }
        }

    } catch (error) {
        console.error("[NOTIFICATION] Failed to create notification:", error);
    }
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
    const q = query(
        notificationsCollectionRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    const notifications = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as AppNotification;
    });

    return notifications;
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
        isRead: true,
    });
}
