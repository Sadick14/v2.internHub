

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
    internshipId?: string; // ID of the active internship
    createdAt?: Date;

    // Enriched fields
    facultyName?: string;
    departmentName?: string;
    assignedLecturerName?: string;
}

export async function getAllUsers(): Promise<UserProfile[]> {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    // The `uid` field in the document is the auth UID. The document's ID is what we use for internal lookups.
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile & { id: string }));
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
            // The lecturerId is the firestore document ID of the lecturer
            const assignedLecturer = lecturers.find(l => l.id === user.lecturerId);
            assignedLecturerName = assignedLecturer?.fullName || '';
        }

        return { ...user, uid: user.uid, facultyName, departmentName, assignedLecturerName };
    }));

    return enrichedUsers;
}

export async function getUserById(uid: string): Promise<UserProfile | null> {
    const usersRef = collection(db, 'users');
    // The UID passed to this function could be an Auth UID or a Firestore Document ID.
    
    // First, try querying by the 'uid' field (Auth UID)
    const q = query(usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    
    let userSnapshot;
    if (!querySnapshot.empty) {
        userSnapshot = querySnapshot.docs[0];
    } else {
        // If that fails, it might be a Firestore document ID (e.g. from lecturerId)
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
             if (docSnap.exists()) {
                userSnapshot = docSnap;
            } else {
                return null;
            }
        } catch (error) {
            return null; // Invalid UID format for doc()
        }
    }

    if (!userSnapshot) return null;

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
        uid: userSnapshot.id, // Ensure we return the document ID as uid for consistency in some places
        facultyName,
        departmentName
    }
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as UserProfile;
    
    return {
        ...userData,
        uid: userDoc.id, // Use the document ID as UID
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
    // studentId and lecturerId here are DOCUMENT IDs from the users collection
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
