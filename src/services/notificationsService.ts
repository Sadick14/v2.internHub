

'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { getSettings } from './settingsService';
import { sendMail } from '@/lib/email';
import { getUserById } from './userService';

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
    | 'ABUSE_REPORT_SUBMITTED';

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
        
        if (!settings) { // If settings can't be loaded, default to not sending emails for safety
            if(notificationData.type === 'NEW_INVITE') {
                 // Invites should always go out if the service is called
                 shouldSendEmail = true;
            } else {
                 console.error("System settings not found. Halting email dispatch.");
                 return;
            }
        } else {
            // For critical alerts, we might want to bypass settings, but we will make them configurable.
             switch(notificationData.type) {
                case 'NEW_INVITE': // Invite emails are handled by invitesService
                    break;
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
                // Explicitly check reminder settings
                case 'EVALUATION_REMINDER':
                case 'TERM_ENDING_REMINDER':
                case 'ABUSE_REPORT_SUBMITTED':
                    shouldSendEmail = true; // These are critical and should likely always send.
                    break;
            }
        }
        

        if (shouldSendEmail) {
            const user = await getUserById(notificationData.userId);
            if (user?.email) {
                try {
                    await sendMail({
                        to: user.email,
                        subject: notificationData.title,
                        text: notificationData.message,
                        html: `<p>${notificationData.message}</p><p>You can view this notification in the app: <a href="https://internshiptrack-iru7j.web.app${notificationData.href || '/'}">View Details</a></p>`,
                    });
                } catch(emailError) {
                    console.error(`[CRITICAL] Email sending failed for user ${user.email} for notification type ${notificationData.type}:`, emailError);
                }
            }
        }

    } catch (error) {
        console.error("Failed to create notification:", error);
    }
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
    const q = query(
        notificationsCollectionRef, 
        where('userId', '==', userId)
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

    // Sort in code to avoid composite index
    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
        isRead: true,
    });
}
