

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import type { Role } from '@/hooks/use-role';
import { getFacultyById, getDepartmentById } from './universityService';
import { createAuditLog } from './auditLogService';
import { auth } from '@/lib/firebase';

export interface UserProfile {
    uid: string;
    fullName: string;
    email: string;
    role: Role;
    status: 'active' | 'inactive' | 'pending';
    indexNumber?: string;
    programOfStudy?: string;
    facultyId?: string;
    departmentId?: string;
    lecturerId?: string; // ID of the assigned lecturer
    createdAt?: Date;

    // Enriched fields
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

export async function getUserById(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
        return null;
    }

    const userData = userSnapshot.data() as UserProfile;
    
    // Convert timestamp
    if (userData.createdAt && userData.createdAt instanceof Timestamp) {
        userData.createdAt = userData.createdAt.toDate();
    }

    let facultyName = '';
    let departmentName = '';
    if (userData.facultyId) {
        const faculty = await getFacultyById(userData.facultyId);
        facultyName = faculty?.name || '';
    }
    if (userData.departmentId) {
        const department = await getDepartmentById(userData.departmentId);
        departmentName = department?.name || '';
    }

    return {
        ...userData,
        uid: userSnapshot.id,
        facultyName,
        departmentName
    }
}


export async function updateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
}

export async function updateUserStatus(uid: string, status: 'active' | 'inactive'): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { status });
}


export async function assignLecturerToStudent(studentId: string, lecturerId: string): Promise<void> {
    const studentRef = doc(db, 'users', studentId);
    await updateDoc(studentRef, { lecturerId });

    // Create an audit log
    const currentUser = auth.currentUser;
    const student = await getUserById(studentId);
    const lecturer = await getUserById(lecturerId);

    if (currentUser && student && lecturer) {
        await createAuditLog({
            userId: currentUser.uid,
            userName: currentUser.displayName || 'Admin',
            userEmail: currentUser.email || 'N/A',
            action: 'Assign Lecturer',
            details: `Assigned lecturer ${lecturer.fullName} to student ${student.fullName}.`
        });
    }
}
