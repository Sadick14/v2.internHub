

'use server';

import { db } from '@/lib/firebase';
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
    invitedBy?: { id: string; name: string };
}

function generateSecureCode(): string {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomValue = array[0];
    return (randomValue % 900000 + 100000).toString();
}

export async function createInvite(inviteData: Omit<Invite, 'status' | 'createdAt' | 'id' | 'verificationCode' | 'pendingUserId'>): Promise<void> {
    const { email, firstName, lastName, role, indexNumber, programOfStudy, facultyId, departmentId, invitedBy } = inviteData;
    
    // 1. Check if an active user or a pending user already exists with this email
    const usersCol = collection(db, 'users');
    const existingUserQuery = query(usersCol, where('email', '==', email));
    const existingUserSnap = await getDocs(existingUserQuery);
    if (!existingUserSnap.empty) {
        throw new Error(`A user with the email ${email} already exists or has a pending invite.`);
    }

    try {
        await sendMail({
            to: email,
            subject: 'You have been invited to InternshipTrack',
            text: `Hello ${firstName},\n\nYou have been invited to join InternshipTrack. Please go to the registration page and use the verification code to complete your account setup.\n\nThank you,\nThe InternshipTrack Team`,
            html: `<p>Hello ${firstName},</p><p>You have been invited to join InternshipTrack. Please go to the registration page and use the verification code to complete your account setup.</p><p>Thank you,<br>The InternshipTrack Team</p>`,
        });
    } catch (error: any) {
        console.error("Email sending failed:", error);
        // Throw a detailed error message to be displayed on the client
        throw new Error(`Failed to send invite email: ${error.message}. Please check your email server credentials and configuration.`);
    }


    // 2. Create the user document with a 'pending' status
    const pendingUserRef = await addDoc(usersCol, {
        fullName: `${firstName} ${lastName}`,
        email: email,
        role: role,
        status: 'pending',
        indexNumber: indexNumber || '',
        programOfStudy: programOfStudy || '',
        facultyId: facultyId || '',
        departmentId: departmentId || '',
        createdAt: serverTimestamp(),
    });

    // 3. Create the invite document, linking it to the pending user
    const verificationCode = generateSecureCode();
    const invitesCol = collection(db, 'invites');
    
    const newInvite: any = {
        email,
        role,
        firstName,
        lastName,
        pendingUserId: pendingUserRef.id,
        status: 'pending',
        verificationCode,
        createdAt: serverTimestamp(),
    };

    if (role === 'student') {
        newInvite.indexNumber = indexNumber;
        newInvite.programOfStudy = programOfStudy;
    }
     if (role === 'student' || role === 'lecturer' || role === 'hod') {
        newInvite.facultyId = facultyId;
        newInvite.departmentId = departmentId;
    }

    await addDoc(invitesCol, newInvite);

    // 4. Create an audit log
    if (invitedBy) {
        try {
            await createAuditLog({
                action: 'Create Invite',
                details: `Invited ${firstName} ${lastName} (${email}) as a ${role}.`,
                userId: invitedBy.id,
                userName: invitedBy.name,
                userEmail: 'N/A' // Email of the inviter is not readily available here.
            });
        } catch (error) {
            console.error("Failed to create audit log for invite:", error);
        }
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
