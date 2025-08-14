

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, Timestamp, query, where } from 'firebase/firestore';
import type { Role } from '@/hooks/use-role';
import { getFacultyById, getDepartmentById } from './universityService';
import { createAuditLog } from './auditLogService';
import { auth } from '@/lib/firebase';

export interface UserProfile {
    uid?: string; // Auth UID - might not exist for 'pending' users
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
    assignedLecturerName?: string;
}

export async function getAllUsers(): Promise<UserProfile[]> {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    const lecturers = userList.filter(u => u.role === 'lecturer');

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
        
        let assignedLecturerName = '';
        if (user.role === 'student' && user.lecturerId) {
            const assignedLecturer = lecturers.find(l => l.uid === user.lecturerId);
            assignedLecturerName = assignedLecturer?.fullName || '';
        }
        
        const docId = (user as any).uid;

        return { ...user, id: docId, facultyName, departmentName, assignedLecturerName };
    }));

    return enrichedUsers;
}

export async function getUserById(uid: string): Promise<UserProfile | null> {
    const usersRef = collection(db, 'users');
    // First, try finding by actual UID if they are fully registered
    const userDocRef = doc(usersRef, uid);
    let userSnapshot = await getDoc(userDocRef);

    // If not found by UID, it might be a pending user whose doc ID is the UID
    if (!userSnapshot.exists()) {
        const q = query(usersRef, where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            userSnapshot = querySnapshot.docs[0];
        } else {
             const docRef = doc(db, 'users', uid);
             const docSnap = await getDoc(docRef);
             if (docSnap.exists()) {
                 userSnapshot = docSnap;
             } else {
                return null;
             }
        }
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
