
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, writeBatch, serverTimestamp, doc } from 'firebase/firestore';
import { createInvite } from './invitesService';
import { createAuditLog } from './auditLogService';

export interface InternshipProfileDetails {
    studentId: string;
    studentName: string;
    studentEmail: string;
    companyName: string;
    companyAddress: string;
    supervisorName: string;
    supervisorEmail: string;
    startDate: Date;
    endDate: Date;
}

export async function createInternshipProfile(details: InternshipProfileDetails): Promise<{ success: boolean; message: string }> {
    if (!details.studentId || !details.studentName) {
        return { success: false, message: 'Authentication required. User details are missing.' };
    }

    const batch = writeBatch(db);

    try {
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

        // 2. Invite the supervisor
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

        // 3. Create the internship profile record
        const profileCol = collection(db, 'internship_profiles');
        const profileRef = doc(profileCol);
        batch.set(profileRef, {
            studentId: details.studentId,
            companyId: companyId,
            supervisorId: supervisorInviteResult.pendingUserId,
            supervisorEmail: details.supervisorEmail,
            startDate: details.startDate,
            endDate: details.endDate,
            status: 'active', // Can be changed to 'pending_approval' later
            createdAt: serverTimestamp(),
        });
        
        // 4. Update the student's user profile with the new internship profile ID
        const studentRef = doc(db, 'users', details.studentId);
        batch.update(studentRef, { internshipId: profileRef.id });

        // 5. Commit all database writes
        await batch.commit();

        // 6. Create an audit log for this action
        await createAuditLog({
            userId: details.studentId, // This should be the auth UID, but doc ID is ok for now
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
