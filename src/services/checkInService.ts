
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp, doc } from 'firebase/firestore';
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

export async function createCheckIn(checkInData: NewCheckIn): Promise<CheckIn> {
    
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
    
    const newDocRef = doc(checkInCollectionRef);
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

    return {
        id: newDocRef.id,
        ...checkInData,
        timestamp: new Date(), // return current time as placeholder until fetched
        address_resolved: dataToSave.address_resolved
    } as CheckIn;
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


export async function getCheckInsByStudentId(studentId: string): Promise<CheckIn[]> {
    const q = query(checkInCollectionRef, where('studentId', '==', studentId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            timestamp: (data.timestamp as Timestamp).toDate(),
        } as CheckIn;
    });
}

export async function getTodayCheckInsForInterns(internIds: string[]): Promise<CheckIn[]> {
    if (internIds.length === 0) {
        return [];
    }

    const now = new Date();
    const startOfToday = startOfDay(now);

    const q = query(
        checkInCollectionRef,
        where('studentId', 'in', internIds),
        where('timestamp', '>=', startOfToday)
    );
    
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            timestamp: (data.timestamp as Timestamp).toDate(),
        } as CheckIn;
    });
}

export async function getCheckInsForInterns(internIds: string[]): Promise<CheckIn[]> {
    if (internIds.length === 0) {
        return [];
    }
    
    const q = query(checkInCollectionRef, where('studentId', 'in', internIds));
    const snapshot = await getDocs(q);

    const checkIns = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            timestamp: (data.timestamp as Timestamp).toDate(),
        } as CheckIn;
    });

    return checkIns.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
