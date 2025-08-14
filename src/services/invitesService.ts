
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, Timestamp } from 'firebase/firestore';
import type { Role } from '@/hooks/use-role';
import { createAuditLog } from './auditLogService';

export interface Invite {
    id?: string;
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
    indexNumber?: string;
    programOfStudy?: string;
    facultyId?: string;
    departmentId?: string;
    status: 'pending' | 'accepted';
    createdAt?: Date;
}

export async function createInvite(inviteData: Omit<Invite, 'status' | 'createdAt' | 'id'>): Promise<void> {
    const invitesCol = collection(db, 'invites');
    const docRef = await addDoc(invitesCol, {
        ...inviteData,
        status: 'pending',
        createdAt: serverTimestamp(),
    });

    const currentUser = auth.currentUser;
    if (currentUser) {
         await createAuditLog({
            action: 'Create Invite',
            details: `Invited ${inviteData.firstName} ${inviteData.lastName} (${inviteData.email}) as a ${inviteData.role}.`,
            userId: currentUser.uid,
            userName: currentUser.displayName || 'Admin',
            userEmail: currentUser.email || 'N/A'
        });
    }

    // In a real application, this would also trigger an email to be sent.
    console.log(`An invite has been created for ${inviteData.email}.`);
}

export async function getPendingInvites(): Promise<Invite[]> {
    const invitesCol = collection(db, 'invites');
    const q = query(invitesCol, where('status', '==', 'pending'));
    const inviteSnapshot = await getDocs(q);
    const inviteList = inviteSnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to JS Date if it exists
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
        return { 
            id: doc.id,
            ...data,
            createdAt,
        } as Invite
    });
    return inviteList;
}
