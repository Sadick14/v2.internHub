'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface SystemSettings {
    notifications: {
        newReportToLecturer: boolean;
        reportApprovedToStudent: boolean;
        reportRejectedToStudent: boolean;
        newInviteToUser: boolean;
        // New settings
        taskDeclaredToSupervisor: boolean;
        taskApprovedToStudent: boolean;
        taskRejectedToStudent: boolean;
        lecturerAssignedToStudent: boolean;
    }
}

// There will only be one settings document, with a fixed ID.
const settingsDocRef = doc(db, 'settings', 'global');

export async function getSettings(): Promise<SystemSettings | null> {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as SystemSettings;
    } else {
        // If no settings doc exists, return default settings
        return {
            notifications: {
                newReportToLecturer: true,
                reportApprovedToStudent: true,
                reportRejectedToStudent: true,
                newInviteToUser: true,
                taskDeclaredToSupervisor: true,
                taskApprovedToStudent: true,
                taskRejectedToStudent: true,
                lecturerAssignedToStudent: true,
            }
        }; 
    }
}

export async function updateSettings(data: SystemSettings): Promise<void> {
    await setDoc(settingsDocRef, { 
        ...data,
        updatedAt: serverTimestamp() 
    }, { merge: true });
}
