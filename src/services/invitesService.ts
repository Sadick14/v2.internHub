

'use server';

import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, Timestamp, writeBatch, documentId, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import type { Role } from '@/hooks/use-role';
import { createAuditLog } from './auditLogService';
import { sendMail } from '@/lib/email';
import type { UserProfile } from './userService';

export interface Invite {
    id?: string;
    email: string;
    role: Role;
    firstName: string;
    lastName:string;
    indexNumber?: string;
    programOfStudy?: string;
    facultyId?: string;
    departmentId?: string;
    status: 'pending' | 'accepted';
    createdAt: string; // Serialized date
    verificationCode: string; // OTP
    pendingUserId: string; // ID of the document in the 'users' collection
}

function generateSecureCode(): string {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomValue = array[0];
    return (randomValue % 900000 + 100000).toString();
}

export async function createInvite(inviteData: Omit<Invite, 'status' | 'createdAt' | 'id' | 'verificationCode' | 'pendingUserId'>): Promise<void> {
    const invitesCol = collection(db, 'invites');
    const usersCol = collection(db, 'users');
    
    // 1. Create the user document with a 'pending' status
    const pendingUserRef = await addDoc(usersCol, {
        fullName: `${inviteData.firstName} ${inviteData.lastName}`,
        email: inviteData.email,
        role: inviteData.role,
        status: 'pending',
        indexNumber: inviteData.indexNumber || '',
        programOfStudy: inviteData.programOfStudy || '',
        facultyId: inviteData.facultyId || '',
        departmentId: inviteData.departmentId || '',
        createdAt: serverTimestamp(),
    });

    // 2. Create the invite document, linking it to the pending user
    const verificationCode = generateSecureCode();
    await addDoc(invitesCol, {
        ...inviteData,
        pendingUserId: pendingUserRef.id,
        status: 'pending',
        verificationCode,
        createdAt: serverTimestamp(),
    });

    // 3. Send the verification email
    try {
        await sendMail({
            to: inviteData.email,
            subject: 'Verify Your InternshipTrack Account',
            text: `Welcome! Your verification code is ${verificationCode}`,
            html: `<p>Welcome! Your verification code is <strong>${verificationCode}</strong></p><p>Please use this code to complete your registration.</p>`,
        });
    } catch (error) {
        console.error("Failed to send initial invite email:", error);
        // Optionally re-throw or handle the error more gracefully
        throw new Error("Failed to send invitation email.");
    }

    // 4. Create an audit log
    try {
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
    } catch (error) {
        console.error("Failed to create audit log for invite:", error);
        // Decide if this failure should affect the overall outcome.
        // For now, we'll just log it and not throw an error.
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
        return null;
    }

    const inviteDoc = snapshot.docs[0];
    const data = inviteDoc.data();
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();

    return { id: inviteDoc.id, ...data, createdAt } as Invite;
}


export async function completeUserRegistration(inviteId: string, authUid: string) {
    const inviteRef = doc(db, 'invites', inviteId);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
        throw new Error("Invite not found.");
    }
    
    const inviteData = inviteSnap.data() as Invite;
    const userRef = doc(db, 'users', inviteData.pendingUserId);

    const batch = writeBatch(db);

    // Update the user document to active and add the auth UID
    batch.update(userRef, { 
        status: 'active',
        uid: authUid,
        updatedAt: serverTimestamp() 
    });

    // Update the invite status to 'accepted'
    batch.update(inviteRef, { status: 'accepted' });
    
    // Commit the batch
    await batch.commit();
}
