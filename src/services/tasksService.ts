
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, serverTimestamp, doc, updateDoc, orderBy } from 'firebase/firestore';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';

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
    // Simplified query to avoid composite index requirement.
    // We fetch all tasks for a student and then filter by date in the application code.
    const q = query(
        tasksCollectionRef,
        where('studentId', '==', studentId)
    );
    const snapshot = await getDocs(q);

    const todayInterval = {
        start: startOfDay(date),
        end: endOfDay(date),
    };

    const tasks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: (data.date as Timestamp).toDate(),
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as DailyTask;
    });

    // Filter by date and sort in the application code
    const tasksForDate = tasks
        .filter(task => isWithinInterval(task.date, todayInterval))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return tasksForDate;
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
