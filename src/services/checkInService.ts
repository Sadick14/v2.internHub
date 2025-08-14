
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp, startOfDay, endOfDay } from 'firebase/firestore';
import { createAuditLog } from './auditLogService';
import { auth } from '@/lib/firebase';
import { getUserById } from './userService';

export interface CheckIn {
    id: string;
    studentId: string;
    timestamp: Date;
    isGpsVerified: boolean;
    latitude?: number;
    longitude?: number;
    manualReason?: string;
}

export interface NewCheckIn {
    studentId: string;
    isGpsVerified: boolean;
    latitude?: number;
    longitude?: number;
    manualReason?: string;
}

const checkInCollectionRef = collection(db, 'check_ins');

export async function createCheckIn(checkInData: NewCheckIn): Promise<void> {
    
    // Check if user already checked in today
    const todayCheckIn = await getTodayCheckIn(checkInData.studentId);
    if (todayCheckIn) {
        throw new Error("You have already checked in for today.");
    }
    
    await addDoc(checkInCollectionRef, {
        ...checkInData,
        timestamp: serverTimestamp(),
    });

    const student = await getUserById(checkInData.studentId);
     if (student) {
        await createAuditLog({
            userId: student.uid!,
            userName: student.fullName,
            userEmail: student.email,
            action: 'Daily Check-in',
            details: `Student ${student.fullName} checked in ${checkInData.isGpsVerified ? 'with GPS' : 'manually'}.`,
        });
    }
}

export async function getTodayCheckIn(studentId: string): Promise<CheckIn | null> {
    const now = new Date();
    const start = startOfDay(now);
    const end = endOfDay(now);

    const q = query(
        checkInCollectionRef, 
        where('studentId', '==', studentId),
        where('timestamp', '>=', start),
        where('timestamp', '<=', end)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        timestamp: (data.timestamp as Timestamp).toDate(),
    } as CheckIn;
}

