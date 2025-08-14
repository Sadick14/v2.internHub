
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    action: string;
    details: string;
    timestamp: Date;
}

export interface NewAuditLog {
    userId: string;
    userName: string;
    userEmail: string;
    action: string;
    details: string;
}

const auditLogsCollectionRef = collection(db, 'audit_logs');

export async function createAuditLog(logData: NewAuditLog): Promise<void> {
    await addDoc(auditLogsCollectionRef, {
        ...logData,
        timestamp: serverTimestamp(),
    });
}

export async function getAuditLogs(): Promise<AuditLog[]> {
    const q = query(auditLogsCollectionRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            timestamp: (data.timestamp as Timestamp).toDate(),
        } as AuditLog;
    });
}
