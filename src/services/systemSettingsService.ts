
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface SystemSettings {
    termStartDate?: Date;
    termEndDate?: Date;
    notifications: {
        dailyReportReminder: boolean;
        reportApproved: boolean;
        reportRejected: boolean;
    };
    updatedAt?: Date;
}

const settingsDocRef = doc(db, 'system_settings', 'global');

export async function getSystemSettings(): Promise<SystemSettings> {
    const docSnap = await getDoc(settingsDocRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert Firestore Timestamps to JS Dates
        return {
            ...data,
            termStartDate: data.termStartDate instanceof Timestamp ? data.termStartDate.toDate() : undefined,
            termEndDate: data.termEndDate instanceof Timestamp ? data.termEndDate.toDate() : undefined,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
        } as SystemSettings;
    } else {
        // Return default settings if document doesn't exist
        return {
            notifications: {
                dailyReportReminder: true,
                reportApproved: true,
                reportRejected: true,
            },
        };
    }
}

export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<void> {
    await setDoc(settingsDocRef, {
        ...settings,
        updatedAt: serverTimestamp(),
    }, { merge: true });
}
