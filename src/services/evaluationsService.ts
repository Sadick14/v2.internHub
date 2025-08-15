
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp, serverTimestamp, addDoc } from 'firebase/firestore';
import type { Role } from '@/hooks/use-role';
import { createAuditLog } from './auditLogService';

export interface EvaluationMetrics {
    technicalSkills: number;
    problemSolving: number;
    communication: number;
    teamwork: number;
    proactiveness: number;
    overall: number;
}

export interface Evaluation {
    id: string;
    studentId: string;
    evaluatorId: string;
    evaluatorRole: Role;
    evaluatorName: string;
    metrics: EvaluationMetrics;
    comments: string;
    createdAt: Date;
}

export interface NewEvaluation {
    studentId: string;
    evaluatorId: string;
    evaluatorRole: Role;
    evaluatorName: string;
    metrics: EvaluationMetrics;
    comments: string;
}

const evaluationsCollectionRef = collection(db, 'evaluations');

export async function createEvaluation(evaluationData: NewEvaluation): Promise<void> {
    await addDoc(evaluationsCollectionRef, {
        ...evaluationData,
        createdAt: serverTimestamp(),
    });

    try {
        await createAuditLog({
            userId: evaluationData.evaluatorId,
            userName: evaluationData.evaluatorName,
            userEmail: 'N/A', // Email not readily available, can be improved if needed
            action: 'Submit Evaluation',
            details: `Submitted a ${evaluationData.evaluatorRole} evaluation for student ID ${evaluationData.studentId}.`,
        });
    } catch(e) {
        console.error("Failed to create audit log for evaluation submission:", e);
    }
}


export async function getEvaluationsForStudent(studentId: string): Promise<Evaluation[]> {
    const q = query(evaluationsCollectionRef, where('studentId', '==', studentId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as Evaluation;
    });
}
