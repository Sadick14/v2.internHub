
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
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

    // Placeholder for audit log
    // await createAuditLog(...)

    return {
        id: newDocRef.id,
        ...reportData,
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
    } as Report;
}

export async function getReportsByLecturer(lecturerId: string): Promise<Report[]> {
    const reportsCol = collection(db, 'reports');
    const q = query(reportsCol, where('lecturerId', '==', lecturerId), where('status', '==', 'Pending'));
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
    
    return reportsWithStudentNames.sort((a,b) => b.reportDate.getTime() - a.reportDate.getTime());
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
    // Ensure we are querying against the student's document ID, not the auth UID
    const studentDocId = studentId; // Assuming the passed ID is the document ID for the student
    const q = query(reportsCol, where('studentId', '==', studentDocId));
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

    // sort by reportDate descending
    return reportList.sort((a, b) => b.reportDate.getTime() - a.reportDate.getTime());
}
