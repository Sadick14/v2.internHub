
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
    archivedAt?: Date;
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
    
    // Mark the term as archived
    await updateDoc(termDocRef, { 
        status: 'Archived', 
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp() 
    });
}

// Get comprehensive archive data for a term
export async function getTermArchiveData(termId: string): Promise<any> {
    const termDoc = await getDocs(query(termsCollectionRef, where('__name__', '==', termId)));
    if (termDoc.empty) {
        throw new Error('Term not found');
    }
    
    const termData = termDoc.docs[0].data();
    const term = {
        id: termDoc.docs[0].id,
        ...termData,
        startDate: (termData.startDate as Timestamp).toDate(),
        endDate: (termData.endDate as Timestamp).toDate(),
        createdAt: (termData.createdAt as Timestamp)?.toDate(),
    };

    // Get all users (students, lecturers, supervisors, hods) - all were part of this term
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate()?.toISOString(),
    }));

    // Get all reports created during the term period
    const reportsSnapshot = await getDocs(collection(db, 'reports'));
    const reports = reportsSnapshot.docs
        .map(doc => {
            const data = doc.data();
            const reportDate = (data.reportDate as Timestamp)?.toDate();
            return {
                id: doc.id,
                ...data,
                reportDate: reportDate?.toISOString(),
                createdAt: (data.createdAt as Timestamp)?.toDate()?.toISOString(),
            };
        })
        .filter(report => {
            const reportDate = new Date(report.reportDate);
            return reportDate >= term.startDate && reportDate <= term.endDate;
        });

    // Get all internship profiles
    const profilesSnapshot = await getDocs(collection(db, 'internship_profiles'));
    const profiles = profilesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: (doc.data().startDate as Timestamp)?.toDate()?.toISOString(),
        endDate: (doc.data().endDate as Timestamp)?.toDate()?.toISOString(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate()?.toISOString(),
    }));

    // Get all evaluations
    const evaluationsSnapshot = await getDocs(collection(db, 'evaluations'));
    const evaluations = evaluationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        evaluatedAt: (doc.data().evaluatedAt as Timestamp)?.toDate()?.toISOString(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate()?.toISOString(),
    }));

    // Get all check-ins during term period
    const checkInsSnapshot = await getDocs(collection(db, 'check_ins'));
    const checkIns = checkInsSnapshot.docs
        .map(doc => {
            const data = doc.data();
            const checkInDate = (data.date as Timestamp)?.toDate();
            return {
                id: doc.id,
                ...data,
                date: checkInDate?.toISOString(),
                createdAt: (data.createdAt as Timestamp)?.toDate()?.toISOString(),
            };
        })
        .filter(checkIn => {
            const checkInDate = new Date(checkIn.date);
            return checkInDate >= term.startDate && checkInDate <= term.endDate;
        });

    // Get all tasks
    const tasksSnapshot = await getDocs(collection(db, 'tasks'));
    const tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: (doc.data().dueDate as Timestamp)?.toDate()?.toISOString(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate()?.toISOString(),
    }));

    // Get departments and faculties
    const deptsSnapshot = await getDocs(collection(db, 'departments'));
    const departments = deptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const facultiesSnapshot = await getDocs(collection(db, 'faculties'));
    const faculties = facultiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return {
        term: {
            ...term,
            startDate: term.startDate.toISOString(),
            endDate: term.endDate.toISOString(),
            createdAt: term.createdAt?.toISOString(),
        },
        statistics: {
            totalUsers: users.length,
            totalStudents: users.filter(u => u.role === 'student').length,
            totalLecturers: users.filter(u => u.role === 'lecturer').length,
            totalSupervisors: users.filter(u => u.role === 'supervisor').length,
            totalReports: reports.length,
            totalProfiles: profiles.length,
            totalEvaluations: evaluations.length,
            totalCheckIns: checkIns.length,
            totalTasks: tasks.length,
        },
        data: {
            users,
            reports,
            profiles,
            evaluations,
            checkIns,
            tasks,
            departments,
            faculties,
        },
    };
}
