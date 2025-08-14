

'use server';

import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, Timestamp, writeBatch, documentId, doc, updateDoc } from 'firebase/firestore';
import type { Role } from '@/hooks/use-role';
import { createAuditLog } from './auditLogService';
import { sendMail } from '@/lib/email';

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
    createdAt?: string; // Serialized date
    verificationCode: string; // OTP
}

function generateSecureCode(): string {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomValue = array[0];
    return (randomValue % 900000 + 100000).toString();
}

export async function createInvite(inviteData: Omit<Invite, 'status' | 'createdAt' | 'id' | 'verificationCode'>): Promise<void> {
    const invitesCol = collection(db, 'invites');
    
    // Generate a simple 6-digit verification code
    const verificationCode = generateSecureCode();
    
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
}


export async function sendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    const invitesCol = collection(db, 'invites');
    const q = query(invitesCol, where('email', '==', email), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        return { success: false, error: "No pending invite found for this email address." };
    }
    
    const inviteDoc = snapshot.docs[0];
    let invite = inviteDoc.data() as Invite;
    let verificationCode = invite.verificationCode;

    // If verification code is missing, generate, save, and use it.
    if (!verificationCode) {
        verificationCode = generateSecureCode();
        await updateDoc(inviteDoc.ref, { verificationCode });
    }
    
    try {
        await sendMail({
            to: email,
            subject: 'Verify Your InternshipTrack Account',
            text: `Your verification code is ${verificationCode}`,
            html: `<p>Your verification code is <strong>${verificationCode}</strong></p>`,
        });
        return { success: true };
    } catch (error: any) {
        console.error("Failed to send verification email:", error);
        return { success: false, error: "Could not send verification email. Please try again later." };
    }
}


export async function getPendingInvites(): Promise<Invite[]> {
    const invitesCol = collection(db, 'invites');
    const q = query(invitesCol, where('status', '==', 'pending'));
    const inviteSnapshot = await getDocs(q);
    const inviteList = inviteSnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to JS Date if it exists
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
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
    const data = inviteDoc.data();
    // Ensure timestamp is serialized for client component props
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();

    return { id: inviteDoc.id, ...data, createdAt } as Invite;
}


export async function acceptInvite(inviteId: string, userId: string, userProfile: any) {
    const batch = writeBatch(db);

    // 1. Create the user document with a server-side timestamp
    const userRef = doc(db, 'users', userId);
    batch.set(userRef, {
        ...userProfile,
        createdAt: serverTimestamp()
    });

    // 2. Update the invite status to 'accepted'
    const inviteRef = doc(db, 'invites', inviteId);
    batch.update(inviteRef, { status: 'accepted' });

    await batch.commit();
}
