

'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, serverTimestamp, doc, updateDoc, orderBy, getDoc } from 'firebase/firestore';
import { createAuditLog } from './auditLogService';
import { getUserById } from './userService';
import { createNotification } from './notificationsService';

export interface Report {
    id: string;
    studentId: string;
    internshipId: string;
    reportDate: Date;
    declaredTasks: string;
    fullReport: string; // Added field for the full detailed report
    summary: string; // AI summary
    status: 'Pending' | 'Approved' | 'Rejected';
    lecturerId: string;
    lecturerComment?: string;
    supervisorComment?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface NewReportData {
    studentId: string;
    internshipId: string;
    lecturerId: string;
    reportDate: Date;
    declaredTasks: string;
    fullReport: string; // Added field
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

        if (reportData.lecturerId) {
             await createNotification({
                userId: reportData.lecturerId,
                type: 'NEW_REPORT_SUBMITTED',
                title: 'New Report Submitted',
                message: `${student.fullName} has submitted a new daily report for your review.`,
                href: '/lecturer/reports'
            });
        }
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
        where('status', 'in', statuses)
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
    
    // Sort in code to avoid needing a composite index
    return reportsWithStudentNames.sort((a, b) => b.reportDate.getTime() - a.reportDate.getTime());
}

export async function getReportsBySupervisor(supervisorId: string, statuses?: Report['status'][]): Promise<Report[]> {
    const profilesCol = collection(db, 'internship_profiles');
    const profileQuery = query(profilesCol, where('supervisorId', '==', supervisorId));
    const profileSnapshot = await getDocs(profileQuery);

    if (profileSnapshot.empty) {
        return [];
    }

    const studentIds = profileSnapshot.docs.map(doc => doc.data().studentId);
    
    if (studentIds.length === 0) {
        return [];
    }

    const reportsCol = collection(db, 'reports');
    let reportQuery;

    if (statuses && statuses.length > 0) {
        reportQuery = query(
            reportsCol,
            where('studentId', 'in', studentIds),
            where('status', 'in', statuses),
            orderBy('reportDate', 'desc')
        );
    } else {
         reportQuery = query(
            reportsCol,
            where('studentId', 'in', studentIds),
            orderBy('reportDate', 'desc')
        );
    }
    
    const reportSnapshot = await getDocs(reportQuery);
    
    return reportSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            reportDate: (data.reportDate as Timestamp).toDate(),
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as Report;
    });
}


export async function approveReport(reportId: string, lecturerComment: string): Promise<void> {
    const reportRef = doc(db, 'reports', reportId);
    const reportSnap = await getDoc(reportRef);
    if (!reportSnap.exists()) throw new Error("Report not found");
    
    const reportData = reportSnap.data() as Report;

    await updateDoc(reportRef, {
        status: 'Approved',
        lecturerComment,
        updatedAt: serverTimestamp(),
    });

     await createNotification({
        userId: reportData.studentId,
        type: 'REPORT_APPROVED',
        title: 'Report Approved',
        message: 'Your daily report has been approved by your lecturer.',
        href: `/student/reports/${reportId}`
    });
}

export async function rejectReport(reportId: string, lecturerComment: string): Promise<void> {
    const reportRef = doc(db, 'reports', reportId);
    const reportSnap = await getDoc(reportRef);
    if (!reportSnap.exists()) throw new Error("Report not found");
    
    const reportData = reportSnap.data() as Report;

    await updateDoc(reportRef, {
        status: 'Rejected',
        lecturerComment,
        updatedAt: serverTimestamp(),
    });

     await createNotification({
        userId: reportData.studentId,
        type: 'REPORT_REJECTED',
        title: 'Report Needs Review',
        message: 'Your lecturer has requested changes to your daily report.',
        href: `/student/reports/${reportId}`
    });
}

export async function getReportsByStudentId(studentId: string): Promise<Report[]> {
    const reportsCol = collection(db, 'reports');
    const q = query(reportsCol, where('studentId', '==', studentId));
    const reportSnapshot = await getDocs(q);

    const reportList = reportSnapshot.docs.map(doc => {
        const data = doc.data();
        const plainObject: any = { id: doc.id };

        for (const key in data) {
            if (data[key] instanceof Timestamp) {
                plainObject[key] = data[key].toDate();
            } else {
                plainObject[key] = data[key];
            }
        }
        return plainObject as Report;
    });

    return reportList.sort((a, b) => b.reportDate.getTime() - a.reportDate.getTime());
}

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
