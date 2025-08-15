
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, serverTimestamp, Timestamp, query, orderBy, where } from 'firebase/firestore';
import { updateUserStatus } from './userService';

export interface InternshipTerm {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status: 'Upcoming' | 'Active' | 'Archived';
    createdAt: Date;
}

const termsCollectionRef = collection(db, 'internship_terms');

export async function getAllTerms(): Promise<InternshipTerm[]> {
    const q = query(termsCollectionRef, orderBy('startDate', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            startDate: (data.startDate as Timestamp).toDate(),
            endDate: (data.endDate as Timestamp).toDate(),
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as InternshipTerm;
    });
}

export async function createTerm(termData: { name: string, startDate: Date, endDate: Date }): Promise<void> {
    await addDoc(termsCollectionRef, {
        ...termData,
        status: 'Upcoming',
        createdAt: serverTimestamp(),
    });
}

export async function updateTerm(id: string, data: Partial<Omit<InternshipTerm, 'id'>>): Promise<void> {
    const termDocRef = doc(db, 'internship_terms', id);
    await updateDoc(termDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function archiveTerm(termId: string): Promise<void> {
    const termDocRef = doc(db, 'internship_terms', termId);
    
    // For simplicity, we assume archiving a term makes all currently 'active' students and lecturers 'inactive'.
    // A more complex system might link users to specific terms.
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('status', '==', 'active'), where('role', 'in', ['student', 'lecturer']));
    const usersToArchiveSnapshot = await getDocs(q);

    const batch = db.batch();

    usersToArchiveSnapshot.forEach(userDoc => {
        batch.update(userDoc.ref, { status: 'inactive' });
    });

    batch.update(termDocRef, { status: 'Archived', updatedAt: serverTimestamp() });

    await batch.commit();
}
