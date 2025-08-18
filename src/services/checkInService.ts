
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

async function reverseGeocodeNominatim(lat: number, lng: number): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'InternHubApp/1.0 (For HTU Internship Management)',
                'Accept-Language': 'en',
            },
        });

        if (!response.ok) {
            throw new Error(`Nominatim API failed with status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data && data.address) {
            const addr = data.address;
            const addressParts = [
                addr.road || addr.pedestrian,
                addr.neighbourhood || addr.suburb,
                addr.city || addr.town || addr.village,
                addr.country,
            ];
            
            const constructedAddress = addressParts.filter(Boolean).join(', ');
            
            // Return the detailed display_name if address construction is too sparse.
            if (constructedAddress.split(',').length < 2 && data.display_name) {
                return data.display_name;
            }

            return constructedAddress || `Unknown Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        } else {
            console.warn('Geocoding response did not contain address details.', data);
            return data.display_name || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    } catch (error) {
        console.error('Error during reverse geocoding:', error);
        return `Failed to resolve address (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }
}


export async function createCheckIn(checkInData: NewCheckIn): Promise<CheckIn> {
    
    // Check if user already checked in today
    const todayCheckIn = await getTodayCheckIn(checkInData.studentId);
    if (todayCheckIn) {
        throw new Error("You have already checked in for today.");
    }

    const dataToSave: any = {
        studentId: checkInData.studentId,
        isGpsVerified: checkInData.isGpsVerified,
        timestamp: serverTimestamp(),
    };

    if (checkInData.isGpsVerified && checkInData.latitude && checkInData.longitude) {
        // Reverse geocode the coordinates to get a human-readable address.
        dataToSave.latitude = checkInData.latitude;
        dataToSave.longitude = checkInData.longitude;
        dataToSave.address_resolved = await reverseGeocodeNominatim(checkInData.latitude, checkInData.longitude);
    } else {
        dataToSave.manualReason = checkInData.manualReason;
    }
    
    const newDocRef = await addDoc(checkInCollectionRef, dataToSave);

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
        ...dataToSave,
        timestamp: new Date(), // return current time as placeholder until fetched
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
    const todayInterval = {
        start: startOfDay(now),
        end: endOfDay(now),
    };

    const q = query(
        checkInCollectionRef,
        where('studentId', 'in', internIds)
    );
    
    const snapshot = await getDocs(q);

    const allCheckins = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            timestamp: (data.timestamp as Timestamp).toDate(),
        } as CheckIn;
    });

    // Filter for today's check-ins in the application code
    return allCheckins.filter(checkin => isWithinInterval(checkin.timestamp, todayInterval));
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
