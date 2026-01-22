

'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, writeBatch, serverTimestamp, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { createInvite } from './invitesService';
import { createAuditLog } from './auditLogService';
import { auth } from '@/lib/firebase';
import { getUserByEmail } from './userService';

export interface InternshipProfile {
    id: string;
    studentId: string;
    companyId: string;
    companyName: string;
    companyAddress: string;
    supervisorId: string;
    supervisorName: string;
    supervisorEmail: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'pending';
    createdAt: string;
    updatedAt?: string;
}

export interface InternshipProfileDetails extends Omit<InternshipProfile, 'id' | 'companyId' | 'supervisorId' | 'status' | 'createdAt' | 'startDate' | 'endDate'> {
    studentName: string;
    studentEmail: string;
    startDate: Date;
    endDate: Date;
}

// Helper function to serialize Firestore data for server components
function serializeProfile(data: any): InternshipProfile {
    const plainObject: any = { id: data.id };

    for (const key in data) {
        if (key === 'id') continue;
        if (data[key] instanceof Timestamp) {
            // Convert to ISO string for serialization
            plainObject[key] = data[key].toDate().toISOString();
        } else {
            plainObject[key] = data[key];
        }
    }

    return plainObject as InternshipProfile;
}

export async function createInternshipProfile(details: InternshipProfileDetails): Promise<{ success: boolean; message: string }> {
    if (!details.studentId || !details.studentName) {
        return { success: false, message: 'Authentication required. User details are missing.' };
    }

    const batch = writeBatch(db);
    const usersCol = collection(db, 'users');
    const studentQuery = query(usersCol, where("uid", "==", details.studentId));

    try {
        const studentQuerySnapshot = await getDocs(studentQuery);
        if (studentQuerySnapshot.empty) {
            throw new Error("Student user document not found.");
        }
        const studentDocRef = studentQuerySnapshot.docs[0].ref;

        // 1. Check if company exists, otherwise create it
        const companiesCol = collection(db, 'companies');
        const companyQuery = query(companiesCol, where('name', '==', details.companyName));
        const companySnapshot = await getDocs(companyQuery);
        
        let companyId: string;
        if (companySnapshot.empty) {
            const companyRef = doc(companiesCol);
            batch.set(companyRef, {
                name: details.companyName,
                address: details.companyAddress,
                createdAt: serverTimestamp(),
            });
            companyId = companyRef.id;
        } else {
            companyId = companySnapshot.docs[0].id;
        }

        // 2. Check if supervisor exists, if not, invite them.
        let supervisorId: string; // This will be the Firestore Document ID
        const existingSupervisor = await getUserByEmail(details.supervisorEmail);

        if (existingSupervisor && existingSupervisor.firestoreId) {
             // Supervisor already exists (active or pending), use their Firestore document ID.
            supervisorId = existingSupervisor.firestoreId;
        } else {
            // Supervisor does not exist, invite them.
            // createInvite creates a 'pending' user and returns its document ID.
            const supervisorInviteResult = await createInvite({
                email: details.supervisorEmail,
                firstName: details.supervisorName.split(' ')[0],
                lastName: details.supervisorName.split(' ').slice(1).join(' ') || details.supervisorName.split(' ')[0],
                role: 'supervisor',
                invitedBy: {
                    id: details.studentId,
                    name: details.studentName,
                }
            });
            // The pendingUserId from createInvite IS the firestoreId of the new user doc
            supervisorId = supervisorInviteResult.pendingUserId;
        }


        // 3. Create the internship profile record
        const profileCol = collection(db, 'internship_profiles');
        const profileRef = doc(profileCol);
        batch.set(profileRef, {
            studentId: details.studentId,
            companyId: companyId,
            companyName: details.companyName,
            companyAddress: details.companyAddress,
            supervisorId: supervisorId, // Use the determined supervisor Firestore ID
            supervisorName: details.supervisorName,
            supervisorEmail: details.supervisorEmail,
            startDate: details.startDate,
            endDate: details.endDate,
            status: 'active', // Can be changed to 'pending_approval' later
            createdAt: serverTimestamp(),
        });
        
        // 4. Update the student's user profile with the new internship profile ID
        batch.update(studentDocRef, { internshipId: profileRef.id });

        // 5. Commit all database writes
        await batch.commit();

        // 6. Create an audit log for this action
        await createAuditLog({
            userId: details.studentId,
            userName: details.studentName,
            userEmail: details.studentEmail,
            action: 'Setup Internship Profile',
            details: `Student ${details.studentName} created an internship profile for ${details.companyName}. Supervisor: ${details.supervisorEmail}.`,
        });

        return { success: true, message: 'Internship profile created successfully!' };

    } catch (error: any) {
        console.error("Error creating internship profile:", error);
        return { success: false, message: `Failed to create internship profile: ${error.message}` };
    }
}


export async function getInternshipProfileByStudentId(studentId: string): Promise<InternshipProfile | null> {
    const profilesCol = collection(db, 'internship_profiles');
    // This query now correctly uses the studentId (auth UID) to find the profile
    const q = query(profilesCol, where('studentId', '==', studentId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    const profileDoc = snapshot.docs[0];
    const data = profileDoc.data();
    
    return serializeProfile({ id: profileDoc.id, ...data });
}

export async function updateInternshipProfile(profileId: string, details: Partial<InternshipProfile>): Promise<{ success: boolean; message: string }> {
    const profileRef = doc(db, 'internship_profiles', profileId);
    
    // In a real app, you would get the current user from the session
    const currentUser = auth.currentUser; 
    
    try {
        await updateDoc(profileRef, {
            ...details,
            updatedAt: serverTimestamp(),
        });

        if (currentUser?.uid) {
             await createAuditLog({
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Student',
                userEmail: currentUser.email || 'N/A',
                action: 'Update Internship Profile',
                details: `Updated internship profile for ${details.companyName}.`,
            });
        }

        return { success: true, message: 'Profile updated successfully!' };
    } catch (error: any) {
        console.error("Error updating internship profile:", error);
        return { success: false, message: `Failed to update profile: ${error.message}` };
    }
}

export async function getInternshipProfiles(): Promise<InternshipProfile[]> {
    const profilesCol = collection(db, 'internship_profiles');
    const snapshot = await getDocs(profilesCol);
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return serializeProfile({ id: doc.id, ...data });
    });
}
