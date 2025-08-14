
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

export interface Report {
    id: string;
    studentId: string;
    reportDate: Date;
    declaredTasks: string;
    dailyReport: string;
    summary: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    lecturerComment?: string;
    supervisorComment?: string;
    createdAt: Date;
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
