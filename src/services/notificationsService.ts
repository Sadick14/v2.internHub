
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp, updateDoc, doc } from 'firebase/firestore';

export interface AppNotification {
    id: string;
    userId: string; // The user who should receive the notification
    title: string;
    message: string;
    href?: string; // Optional link to navigate to
    isRead: boolean;
    createdAt: Date;
}

export interface NewAppNotification extends Omit<AppNotification, 'id' | 'isRead' | 'createdAt'> {}

const notificationsCollectionRef = collection(db, 'notifications');

export async function createNotification(notificationData: NewAppNotification): Promise<void> {
    try {
        await addDoc(notificationsCollectionRef, {
            ...notificationData,
            isRead: false,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Failed to create notification:", error);
        // Depending on the use case, you might want to re-throw the error
    }
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
    const q = query(
        notificationsCollectionRef, 
        where('userId', '==', userId), 
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as AppNotification;
    });
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
        isRead: true,
    });
}
