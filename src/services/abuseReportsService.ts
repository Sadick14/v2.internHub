
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp, updateDoc, doc, orderBy } from 'firebase/firestore';
import { createAuditLog } from './auditLogService';
import { getUserById, getAllUsers } from './userService';
import { createNotification } from './notificationsService';

export interface AbuseReport {
    id: string;
    studentId: string;
    studentName: string;
    message: string;
    status: 'new' | 'under_review' | 'resolved';
    reportedAt: Date;
    lecturerId?: string; // Auth UID of the assigned lecturer
}

export interface NewAbuseReport {
    studentId: string;
    studentName: string;
    message: string;
}

const abuseReportsCollectionRef = collection(db, 'abuse_reports');

export async function createAbuseReport(studentId: string, studentName: string, message: string): Promise<void> {
    
    const student = await getUserById(studentId);
    if (!student) {
        throw new Error("Student profile not found.");
    }

    const reportData: any = {
        studentId,
        studentName,
        message,
        status: 'new',
        reportedAt: serverTimestamp(),
        lecturerId: student.lecturerId || null,
    };

    await addDoc(abuseReportsCollectionRef, reportData);

    // Create an audit log for this sensitive action
    await createAuditLog({
        userId: studentId,
        userName: studentName,
        userEmail: student.email,
        action: 'Submit Abuse Report',
        details: 'A student submitted a confidential abuse/harassment report.',
    });
    
    // Notify the assigned lecturer if they exist
    if (student.lecturerId) {
        await createNotification({
            userId: student.lecturerId,
            type: 'ABUSE_REPORT_SUBMITTED', // This type will need handling if specific settings are added
            title: 'URGENT: Abuse Report Submitted',
            message: `A confidential report has been submitted by your student, ${studentName}. Please review it immediately.`,
            href: '/lecturer/abuse-reports'
        });
    }

    // Notify all admins
    const allUsers = await getAllUsers();
    const admins = allUsers.filter(u => u.role === 'admin');
    for (const admin of admins) {
        await createNotification({
            userId: admin.uid,
            type: 'ABUSE_REPORT_SUBMITTED',
            title: 'URGENT: Abuse Report Submitted',
            message: `A confidential report has been submitted by student ${studentName}.`,
            href: '/admin/abuse-reports'
        });
    }
}

export async function getAllAbuseReports(): Promise<AbuseReport[]> {
    const q = query(abuseReportsCollectionRef, orderBy('reportedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            reportedAt: (data.reportedAt as Timestamp).toDate(),
        } as AbuseReport;
    });
}

export async function getAbuseReportsByLecturer(lecturerId: string): Promise<AbuseReport[]> {
    const q = query(
        abuseReportsCollectionRef,
        where('lecturerId', '==', lecturerId),
        orderBy('reportedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            reportedAt: (data.reportedAt as Timestamp).toDate(),
        } as AbuseReport;
    });
}


export async function updateAbuseReportStatus(reportId: string, status: AbuseReport['status']): Promise<void> {
    const reportRef = doc(db, 'abuse_reports', reportId);
    await updateDoc(reportRef, { status });
}
