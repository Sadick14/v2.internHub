
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp, serverTimestamp, addDoc, doc, updateDoc } from 'firebase/firestore';
import type { Role } from '@/hooks/use-role';
import { createAuditLog } from './auditLogService';
import { auth } from '@/lib/firebase';
import type { UserProfile } from './userService';

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

    const currentUser = auth.currentUser;
     if (currentUser) {
        await createAuditLog({
            userId: currentUser.uid,
            userName: currentUser.displayName || 'Evaluator',
            userEmail: currentUser.email || 'N/A',
            action: 'Submit Evaluation',
            details: `Submitted a ${evaluationData.evaluatorRole} evaluation for student ID ${evaluationData.studentId}.`,
        });
    }
}


export async function getEvaluationsForStudent(studentId: string): Promise<Evaluation[]> {
    const q = query(evaluationsCollectionRef, where('studentId', '==', studentId));
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
