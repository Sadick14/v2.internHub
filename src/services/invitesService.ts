
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Role } from '@/hooks/use-role';

export interface Invite {
    email: string;
    role: Role;
    facultyId?: string;
    departmentId?: string;
    status: 'pending';
    createdAt: any;
}

export async function createInvite(inviteData: Omit<Invite, 'status' | 'createdAt'>): Promise<void> {
    const invitesCol = collection(db, 'invites');
    await addDoc(invitesCol, {
        ...inviteData,
        status: 'pending',
        createdAt: serverTimestamp(),
    });
    // In a real application, this would also trigger an email to be sent.
    console.log(`An invite has been created for ${inviteData.email}.`);
}
