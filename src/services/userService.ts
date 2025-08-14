

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, Timestamp, query, where, DocumentReference } from 'firebase/firestore';
import type { Role } from '@/hooks/use-role';
import { getFacultyById, getDepartmentById } from './universityService';
import { createAuditLog } from './auditLogService';
import { auth } from '@/lib/firebase';

export interface UserProfile {
    uid: string; // This is the Firebase Auth UID
    firestoreId: string; // This is the Firestore document ID
    fullName: string;
    email: string;
    role: Role;
    status: 'active' | 'inactive' | 'pending';
    indexNumber?: string;
    programOfStudy?: string;
    facultyId?: string;
    departmentId?: string;
    lecturerId?: string; // Auth UID of the assigned lecturer
    supervisorId?: string; // This would be added when a student sets up their profile
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
    const lecturers = userSnapshot.docs.filter(doc => doc.data().role === 'lecturer').map(doc => ({ id: doc.id, ...doc.data() }));

    const enrichedUsers = await Promise.all(userSnapshot.docs.map(async (doc) => {
        const user = { firestoreId: doc.id, ...doc.data() } as Omit<UserProfile, 'facultyName' | 'departmentName' | 'assignedLecturerName'>;
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
            assignedLecturerName = assignedLecturer?.fullName || 'N/A';
        }

        return { ...user, uid: user.uid!, facultyName, departmentName, assignedLecturerName } as UserProfile;
    }));

    return enrichedUsers;
}


export async function getUserById(uid: string): Promise<UserProfile | null> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        // If not found by auth uid, try treating the uid as a firestore document id
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const userData = docSnap.data();
                 return {
                    ...(docSnap.data() as Omit<UserProfile, 'uid' | 'firestoreId'>),
                    uid: userData.uid, // the auth uid
                    firestoreId: docSnap.id, // the document id
                };
            }
        } catch (e) {
             console.error("Error fetching user by doc ID:", e);
             return null
        }
        return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    return {
        ...(userDoc.data() as Omit<UserProfile, 'uid' | 'firestoreId'>),
        uid: userData.uid, // the auth uid
        firestoreId: userDoc.id, // the document id
    };
}


export async function getUserByEmail(email: string): Promise<UserProfile | null> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    return {
        ...(userDoc.data() as Omit<UserProfile, 'uid' | 'firestoreId'>),
        uid: userData.uid, // the auth uid
        firestoreId: userDoc.id, // the document id
    }
}


export async function updateUser(firestoreId: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', firestoreId);
    await updateDoc(userRef, data);
}

export async function updateUserStatus(firestoreId: string, status: 'active' | 'inactive'): Promise<void> {
    const userRef = doc(db, 'users', firestoreId);
    await updateDoc(userRef, { status });
}


export async function assignLecturerToStudent(studentFirestoreId: string, lecturerAuthId: string): Promise<void> {
    const studentRef = doc(db, 'users', studentFirestoreId);
    await updateDoc(studentRef, { lecturerId: lecturerAuthId });

    // Create an audit log
    const currentUser = auth.currentUser;
    const student = await getUserById(studentFirestoreId);
    const lecturer = await getUserById(lecturerAuthId);

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


export async function getInternsBySupervisor(supervisorId: string): Promise<UserProfile[]> {
    const profilesCol = collection(db, 'internship_profiles');
    const profileQuery = query(profilesCol, where('supervisorId', '==', supervisorId));
    const profileSnapshot = await getDocs(profileQuery);

    if (profileSnapshot.empty) {
        return [];
    }

    const studentIds = profileSnapshot.docs.map(doc => doc.data().studentId);

    const usersCol = collection(db, 'users');
    const studentsQuery = query(usersCol, where('uid', 'in', studentIds));
    const studentsSnapshot = await getDocs(studentsQuery);

    return studentsSnapshot.docs.map(doc => {
         const data = doc.data();
         return {
            ...(data as Omit<UserProfile, 'uid' | 'firestoreId'>),
            uid: data.uid,
            firestoreId: doc.id
         }
    });
}
