
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, serverTimestamp, doc, updateDoc, orderBy } from 'firebase/firestore';
import { startOfDay, endOfDay } from 'date-fns';

export interface DailyTask {
    id: string;
    studentId: string;
    internshipId: string;
    supervisorId: string;
    date: Date;
    description: string;
    learningObjectives: string;
    status: 'Pending' | 'Completed' | 'Approved' | 'Rejected';
    supervisorFeedback?: string;
    createdAt: Date;
}

export interface NewDailyTask {
    studentId: string;
    internshipId: string;
    supervisorId: string;
    date: Date;
    description: string;
    learningObjectives: string;
}

const tasksCollectionRef = collection(db, 'daily_tasks');

export async function createTask(taskData: NewDailyTask): Promise<void> {
    await addDoc(tasksCollectionRef, {
        ...taskData,
        status: 'Pending',
        createdAt: serverTimestamp(),
    });
}

export async function getTasksByDate(studentId: string, date: Date): Promise<DailyTask[]> {
    const q = query(
        tasksCollectionRef,
        where('studentId', '==', studentId),
        where('date', '>=', startOfDay(date)),
        where('date', '<=', endOfDay(date)),
        orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: (data.date as Timestamp).toDate(),
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as DailyTask;
    });
}

export async function getTasksBySupervisor(supervisorId: string, status: DailyTask['status'][]): Promise<DailyTask[]> {
    const q = query(
        tasksCollectionRef,
        where('supervisorId', '==', supervisorId),
        where('status', 'in', status),
        orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: (data.date as Timestamp).toDate(),
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as DailyTask;
    });
}

export async function updateTaskStatus(taskId: string, status: 'Completed' | 'Approved' | 'Rejected', supervisorFeedback?: string): Promise<void> {
    const taskRef = doc(db, 'daily_tasks', taskId);
    const dataToUpdate: any = { status };
    if (supervisorFeedback) {
        dataToUpdate.supervisorFeedback = supervisorFeedback;
    }
    await updateDoc(taskRef, dataToUpdate);
}
