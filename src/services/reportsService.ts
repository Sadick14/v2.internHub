

'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, serverTimestamp, doc, updateDoc, orderBy } from 'firebase/firestore';
import { createAuditLog } from './auditLogService';
import { getUserById } from './userService';

export interface Report {
    id: string;
    studentId: string;
    internshipId: string;
    reportDate: Date;
    declaredTasks: string;
    summary: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    lecturerId: string;
    lecturerComment?: string;
    supervisorComment?: string; // Kept for potential future use or if supervisor also comments
    createdAt: Date;
    updatedAt?: Date;
}

export interface NewReportData {
    studentId: string;
    internshipId: string;
    lecturerId: string;
    reportDate: Date;
    declaredTasks: string;
    summary: string;
}

export async function createReport(reportData: NewReportData): Promise<Report> {
    const dataToSave = {
        ...reportData,
        status: 'Pending' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const newDocRef = await addDoc(collection(db, 'reports'), dataToSave);

    const student = await getUserById(reportData.studentId);
    if (student) {
        await createAuditLog({
            userId: student.uid!,
            userName: student.fullName,
            userEmail: student.email,
            action: 'Submit Report',
            details: `Student ${student.fullName} submitted a daily report.`,
        });
    }

    return {
        id: newDocRef.id,
        ...reportData,
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
    } as Report;
}

export async function getReportsByLecturer(lecturerId: string, statuses: Report['status'][]): Promise<Report[]> {
    const reportsCol = collection(db, 'reports');
    // lecturerId is the Auth UID
    const q = query(
        reportsCol, 
        where('lecturerId', '==', lecturerId), 
        where('status', 'in', statuses),
        orderBy('reportDate', 'desc')
    );
    const reportSnapshot = await getDocs(q);

    const reportsWithStudentNames = await Promise.all(reportSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const student = await getUserById(data.studentId);
        return {
            id: doc.id,
            ...data,
            studentName: student?.fullName || 'Unknown Student',
            reportDate: (data.reportDate as Timestamp).toDate(),
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as Report & { studentName: string };
    }));
    
    return reportsWithStudentNames;
}


export async function approveReport(reportId: string, lecturerComment: string): Promise<void> {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
        status: 'Approved',
        lecturerComment,
        updatedAt: serverTimestamp(),
    });
}

export async function rejectReport(reportId: string, lecturerComment: string): Promise<void> {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
        status: 'Rejected',
        lecturerComment,
        updatedAt: serverTimestamp(),
    });
}

export async function getReportsByStudentId(studentId: string): Promise<Report[]> {
    const reportsCol = collection(db, 'reports');
    // The studentId passed here is the auth UID from useRole.
    const q = query(reportsCol, where('studentId', '==', studentId), orderBy('reportDate', 'desc'));
    const reportSnapshot = await getDocs(q);

    const reportList = reportSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            reportDate: (data.reportDate instanceof Timestamp) ? data.reportDate.toDate() : new Date(),
            createdAt: (data.createdAt instanceof Timestamp) ? data.createdAt.toDate() : new Date(),
        } as Report
    });

    return reportList;
}

// A new function for admins to see all reports or unassigned ones.
export async function getAllReports(filter: 'all' | 'unassigned' = 'all'): Promise<Report[]> {
    const reportsCol = collection(db, 'reports');
    let q;

    if (filter === 'unassigned') {
        q = query(reportsCol, where('lecturerId', '==', ''), orderBy('reportDate', 'desc'));
    } else {
        q = query(reportsCol, orderBy('reportDate', 'desc'));
    }
    
    const reportSnapshot = await getDocs(q);

     const reportsWithStudentNames = await Promise.all(reportSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const student = await getUserById(data.studentId);
        return {
            id: doc.id,
            ...data,
            studentName: student?.fullName || 'Unknown Student',
            reportDate: (data.reportDate as Timestamp).toDate(),
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as Report & { studentName: string };
    }));
    
    return reportsWithStudentNames;
}
