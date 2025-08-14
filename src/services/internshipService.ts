
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, writeBatch, serverTimestamp, doc } from 'firebase/firestore';
import { createInvite } from './invitesService';
import { createAuditLog } from './auditLogService';

export interface InternshipDetails {
    studentId: string;
    studentName: string;
    companyName: string;
    companyAddress: string;
    supervisorName: string;
    supervisorEmail: string;
    startDate: Date;
    endDate: Date;
}

export async function setupInternship(details: InternshipDetails): Promise<{ success: boolean; message: string }> {
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

        // 2. Invite the supervisor (this will also create a 'pending' user for them)
        const supervisorInviteResult = await createInvite({
            email: details.supervisorEmail,
            firstName: details.supervisorName.split(' ')[0],
            lastName: details.supervisorName.split(' ').slice(1).join(' ') || details.supervisorName.split(' ')[0],
            role: 'supervisor',
            // Pass inviting user details for the audit log inside createInvite
            invitedBy: {
                id: details.studentId,
                name: details.studentName,
            }
        });
        
        // 3. Create the internship record
        const internshipCol = collection(db, 'internships');
        const internshipRef = doc(internshipCol);
        batch.set(internshipRef, {
            studentId: details.studentId,
            companyId: companyId,
            supervisorId: supervisorInviteResult.pendingUserId, // Link to the supervisor's user document
            supervisorEmail: details.supervisorEmail,
            startDate: details.startDate,
            endDate: details.endDate,
            status: 'active',
            createdAt: serverTimestamp(),
        });
        
        // 4. Update the student's user profile with the new internship ID
        const studentRef = doc(db, 'users', details.studentId);
        batch.update(studentRef, { internshipId: internshipRef.id });

        // 5. Commit all database writes
        await batch.commit();

        // 6. Create an audit log for this specific action
        await createAuditLog({
            userId: details.studentId,
            userName: details.studentName,
            userEmail: 'N/A', // Student email not available here, can be enriched later if needed
            action: 'Setup Internship',
            details: `Student ${details.studentName} set up internship at ${details.companyName}. Supervisor: ${details.supervisorEmail}.`,
        });

        return { success: true, message: 'Internship profile created successfully!' };

    } catch (error: any) {
        console.error("Error setting up internship:", error);
        return { success: false, message: `Failed to set up internship: ${error.message}` };
    }
}
