
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import type { Role } from '@/hooks/use-role';
import { getFacultyById, getDepartmentById } from './universityService';

export interface UserProfile {
    uid: string;
    fullName: string;
    email: string;
    role: Role;
    status: 'active' | 'inactive' | 'pending';
    facultyId?: string;
    departmentId?: string;
    facultyName?: string;
    departmentName?: string;
}

export async function getAllUsers(): Promise<UserProfile[]> {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));

    // Enrich users with faculty and department names
    const enrichedUsers = await Promise.all(userList.map(async (user) => {
        let facultyName = '';
        let departmentName = '';
        if (user.facultyId) {
            const faculty = await getFacultyById(user.facultyId);
            facultyName = faculty?.name || '';
        }
        if (user.departmentId) {
            const department = await getDepartmentById(user.departmentId);
            departmentName = department?.name || '';
        }
        return { ...user, facultyName, departmentName };
    }));

    return enrichedUsers;
}


export async function updateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
}

export async function updateUserStatus(uid: string, status: 'active' | 'inactive'): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { status });
}
