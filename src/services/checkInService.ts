
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';
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
    address_resolved?: string;
    manualReason?: string;
}

export interface NewCheckIn {
    studentId: string;
    isGpsVerified: boolean;
    latitude?: number;
    longitude?: number;
    address_resolved?: string;
    manualReason?: string;
}

const checkInCollectionRef = collection(db, 'check_ins');

export async function createCheckIn(checkInData: NewCheckIn): Promise<void> {
    
    // Check if user already checked in today
    const todayCheckIn = await getTodayCheckIn(checkInData.studentId);
    if (todayCheckIn) {
        throw new Error("You have already checked in for today.");
    }

    const dataToSave: any = {
        ...checkInData,
        timestamp: serverTimestamp(),
    };

    if (checkInData.isGpsVerified && checkInData.latitude && checkInData.longitude) {
        // In a real app, you would call a reverse geocoding API here.
        // For now, we'll use a placeholder.
        dataToSave.address_resolved = `Location at ${checkInData.latitude.toFixed(4)}, ${checkInData.longitude.toFixed(4)}`;
    }
    
    await addDoc(checkInCollectionRef, dataToSave);

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
    const todayInterval = {
        start: startOfDay(now),
        end: endOfDay(now),
    };

    // Query for all check-ins for the student
    const q = query(
        checkInCollectionRef, 
        where('studentId', '==', studentId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }
    
    // Filter the results on the server
    const todayCheckInDoc = snapshot.docs.find(doc => {
        const timestamp = (doc.data().timestamp as Timestamp).toDate();
        return isWithinInterval(timestamp, todayInterval);
    });

    if (!todayCheckInDoc) {
        return null;
    }
    
    const data = todayCheckInDoc.data();
    return {
        id: todayCheckInDoc.id,
        ...data,
        timestamp: (data.timestamp as Timestamp).toDate(),
    } as CheckIn;
}
