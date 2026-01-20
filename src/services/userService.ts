'use server';

import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, Timestamp, query, where, DocumentReference } from 'firebase/firestore';
import { getFacultyById, getDepartmentById } from './universityService';
import { createAuditLog } from './auditLogService';
import { createNotification } from './notificationsService';

// Re-export Role type for other services
export type { Role } from '@/hooks/use-role';
import type { InternshipProfile } from './internshipProfileService';
import { getReportsByStudentId, type Report } from './reportsService';
import { getAllTasksByStudentId, type DailyTask } from './tasksService';
import { getCheckInsByStudentId, type CheckIn } from './checkInService';
import { getEvaluationsForStudent, type Evaluation } from './evaluationsService';


export interface UserProfile {
    uid: string; // This is the Firebase Auth UID
    firestoreId: string; // This is the Firestore document ID
    fullName: string;
    email: string;
    role: Role;
    status: 'active' | 'inactive' | 'pending';
    phoneNumber?: string;
    bio?: string;
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
    companyName?: string;
}

export interface StudentDetails {
    student: UserProfile;
    profile: InternshipProfile | null;
    reports: Report[];
    tasks: DailyTask[];
    checkIns: CheckIn[];
    evaluations: Evaluation[];
}

const enrichUser = async (userDoc: any): Promise<UserProfile> => {
    const user = { firestoreId: userDoc.id, ...userDoc.data() } as Omit<UserProfile, 'facultyName' | 'departmentName' | 'assignedLecturerName' | 'createdAt'> & { createdAt: Timestamp };
    
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
        // This is a bit inefficient, but avoids circular dependencies.
        // In a larger app, we'd cache users.
        const lecturersCol = collection(db, 'users');
        const q = query(lecturersCol, where('uid', '==', user.lecturerId));
        const lecturerSnapshot = await getDocs(q);
        if (!lecturerSnapshot.empty) {
            assignedLecturerName = lecturerSnapshot.docs[0].data().fullName;
        }
    }

    return { 
        ...user, 
        uid: user.uid!,
        createdAt: user.createdAt?.toDate(), 
        facultyName, 
        departmentName, 
        assignedLecturerName,
        companyName: ''
    };
};

export async function getAllUsers(): Promise<UserProfile[]> {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);

    const enrichedUsers = await Promise.all(userSnapshot.docs.map(enrichUser));

    return enrichedUsers;
}


export async function getUserById(uid: string): Promise<UserProfile | null> {
    const usersRef = collection(db, "users");
    let q = query(usersRef, where("uid", "==", uid));
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return await enrichUser(docSnap);
            }
        } catch (e) {
             // It's possible the ID is a firestoreId if the user is pending
             try {
                 const docRef = doc(db, 'users', uid);
                 const docSnap = await getDoc(docRef);
                 if (docSnap.exists()) {
                     return await enrichUser(docSnap);
                 }
             } catch (e2) {
                console.error("Error fetching user by doc ID after failing to fetch by UID:", e2);
                return null;
             }
        }
        return null;
    }

    const userDoc = querySnapshot.docs[0];
    return await enrichUser(userDoc);
}


export async function getUserByEmail(email: string): Promise<UserProfile | null> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const userDoc = querySnapshot.docs[0];
    return await enrichUser(userDoc);
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
    const studentDoc = await getDoc(studentRef);
    const student = await getUserById(studentDoc.data()?.uid);
    const lecturer = await getUserById(lecturerAuthId);

    if (currentUser && student && lecturer) {
        await createAuditLog({
            userId: currentUser.uid,
            userName: currentUser.displayName || 'Admin',
            userEmail: currentUser.email || 'N/A',
            action: 'Assign Lecturer',
            details: `Assigned lecturer ${lecturer.fullName} to student ${student.fullName}.`
        });

         await createNotification({
            userId: student.uid,
            type: 'LECTURER_ASSIGNED',
            title: "Lecturer Assigned",
            message: `You have been assigned ${lecturer.fullName} as your supervising lecturer.`,
            href: '/student/supervisors'
        });
    }
}


export async function getInternsBySupervisor(supervisorAuthId: string): Promise<UserProfile[]> {
    const supervisorProfile = await getUserById(supervisorAuthId);
    if (!supervisorProfile || !supervisorProfile.firestoreId) {
        console.error("Could not find supervisor profile for auth UID:", supervisorAuthId);
        return [];
    }
    const supervisorFirestoreId = supervisorProfile.firestoreId;
    
    const profilesCol = collection(db, 'internship_profiles');
    const profileQuery = query(profilesCol, where('supervisorId', '==', supervisorFirestoreId));
    const profileSnapshot = await getDocs(profileQuery);

    if (profileSnapshot.empty) {
        return [];
    }

    const studentIds = profileSnapshot.docs.map(doc => doc.data().studentId);
    
    if (studentIds.length === 0) return [];

    const usersCol = collection(db, 'users');
    const studentsQuery = query(usersCol, where('uid', 'in', studentIds));
    const studentsSnapshot = await getDocs(studentsQuery);

     const enrichedInterns = await Promise.all(studentsSnapshot.docs.map(async (doc) => {
        const internData = await enrichUser(doc);
        return internData;
    }));

    return enrichedInterns;
}

export async function getStudentsByLecturer(lecturerAuthId: string): Promise<UserProfile[]> {
    if (!lecturerAuthId) return [];

    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('lecturerId', '==', lecturerAuthId), where('role', '==', 'student'));
    const studentsSnapshot = await getDocs(q);

    if (studentsSnapshot.empty) {
        return [];
    }

    const enrichedStudents = await Promise.all(studentsSnapshot.docs.map(enrichUser));
    return enrichedStudents;
}

export async function getStudentDetails(studentId: string): Promise<StudentDetails | null> {
    const student = await getUserById(studentId);
    if (!student) {
        return null;
    }

    const [profile, reports, tasks, checkIns, evaluations] = await Promise.all([
        getInternshipProfileByStudentId(student.uid),
        getReportsByStudentId(student.uid),
        getAllTasksByStudentId(student.uid),
        getCheckInsByStudentId(student.uid),
        getEvaluationsForStudent(student.uid)
    ]);

    return {
        student,
        profile,
        reports,
        tasks,
        checkIns,
        evaluations,
    };
}
