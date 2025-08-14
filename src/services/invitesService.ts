
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, Timestamp, writeBatch, documentId } from 'firebase/firestore';
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
    verificationCode?: string; // OTP
}

export async function createInvite(inviteData: Omit<Invite, 'status' | 'createdAt' | 'id' | 'verificationCode'>): Promise<void> {
    const invitesCol = collection(db, 'invites');
    
    // Generate a simple 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await addDoc(invitesCol, {
        ...inviteData,
        status: 'pending',
        verificationCode,
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
    console.log(`An invite has been created for ${inviteData.email} with code ${verificationCode}`);
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

export async function verifyInvite(email: string, code: string): Promise<Invite | null> {
    const invitesCol = collection(db, 'invites');
    const q = query(
        invitesCol, 
        where('email', '==', email), 
        where('verificationCode', '==', code),
        where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null; // No matching, pending invite found
    }

    const inviteDoc = snapshot.docs[0];
    return { id: inviteDoc.id, ...inviteDoc.data() } as Invite;
}


export async function acceptInvite(inviteId: string, userId: string, userProfile: any) {
    const batch = writeBatch(db);

    // 1. Create the user document
    const userRef = doc(db, 'users', userId);
    batch.set(userRef, userProfile);

    // 2. Update the invite status to 'accepted'
    const inviteRef = doc(db, 'invites', inviteId);
    batch.update(inviteRef, { status: 'accepted' });

    await batch.commit();
}
