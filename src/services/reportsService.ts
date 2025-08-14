
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { createAuditLog } from './auditLogService';

export interface Report {
    id: string;
    studentId: string;
    internshipId: string;
    reportDate: Date;
    declaredTasks: string;
    summary: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    supervisorId: string;
    supervisorComment?: string;
    lecturerComment?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface NewReportData {
    studentId: string;
    internshipId: string;
    supervisorId: string;
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

export async function getReportsBySupervisor(supervisorId: string): Promise<Report[]> {
    const reportsCol = collection(db, 'reports');
    const q = query(reportsCol, where('supervisorId', '==', supervisorId), where('status', '==', 'Pending'));
    const reportSnapshot = await getDocs(q);

    const reportList = reportSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            reportDate: (data.reportDate as Timestamp).toDate(),
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as Report;
    });
    
    return reportList.sort((a,b) => b.reportDate.getTime() - a.reportDate.getTime());
}

export async function approveReport(reportId: string, supervisorComment: string): Promise<void> {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
        status: 'Approved',
        supervisorComment,
        updatedAt: serverTimestamp(),
    });
}

export async function rejectReport(reportId: string, supervisorComment: string): Promise<void> {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
        status: 'Rejected',
        supervisorComment,
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
