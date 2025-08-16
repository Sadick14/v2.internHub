

'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, Timestamp, writeBatch, documentId, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import type { Role } from '@/hooks/use-role';
import { createAuditLog } from './auditLogService';
import type { UserProfile } from './userService';
import { createNotification } from './notificationsService';
import { sendInviteEmail, sendVerificationCodeEmail } from './emailService';


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

export async function createInvite(inviteData: Omit<Invite, 'status' | 'createdAt' | 'id' | 'verificationCode' | 'pendingUserId'>): Promise<{pendingUserId: string}> {
    const { email, firstName, lastName, role, indexNumber, programOfStudy, facultyId, departmentId, invitedBy } = inviteData;
    
    // The check for an existing user is now handled in internshipProfileService to allow multiple students to link to one supervisor.
    
    try {
        // 1. Create the user document with a 'pending' status
        const pendingUserRef = doc(collection(db, 'users'));
        const userData: Partial<UserProfile> = {
            fullName: `${firstName} ${lastName}`,
            email: email,
            role: role,
            status: 'pending',
            facultyId: facultyId || '',
            departmentId: departmentId || '',
            createdAt: new Date(),
        };

        if (role === 'student') {
            userData.indexNumber = indexNumber || '';
            userData.programOfStudy = programOfStudy || '';
        }
        
        await setDoc(pendingUserRef, userData);


        // 2. Create the invite document, linking it to the pending user
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
        
        // 3. Directly send the initial invitation email using the email service
        await sendInviteEmail(email, firstName);

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

        return { pendingUserId: pendingUserRef.id };

    } catch (error: any) {
        console.error(`Error in createInvite for ${email}:`, error);
        throw new Error(`Failed to create invite in database: ${error.message}`);
    }
}


export async function sendVerificationEmailToExistingInvite(email: string): Promise<{ success: boolean; error?: string }> {
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
        await sendVerificationCodeEmail(email, verificationCode);
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
