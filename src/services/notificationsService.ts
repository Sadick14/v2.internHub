
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
    | 'TERM_ENDING_REMINDER';

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
        if (!settings) return; // If no settings, no emails.

        let shouldSendEmail = false;
        switch(notificationData.type) {
            case 'NEW_INVITE':
                shouldSendEmail = settings.notifications.newInviteToUser;
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
            // Add other cases here if more email settings are added
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
